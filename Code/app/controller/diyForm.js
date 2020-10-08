'use strict';

module.exports = app => {
  return class extends app.Controller {
    async create() {
      const { ctx } = this;
      const {
        formKey,
        childFormKey,
        parentData,
        childDataList,
        processDefinitionId,
        version,
      } = ctx.request.body;
      ctx.success();

      // 获取父表插入SQL
      const parentInsertSQL = await ctx.service.diyForm.getParentFormInsetSQL(formKey, version, parentData);

      // 获取子表插入SQL
      for (const childData of childDataList) {
        const dc = await ctx.service.dc.getDC(childData.environment_type.value, childData.network_zone.value);
        childData.data_center = {
          id: 'data_center',
          value: dc,
          label: dc,
        };
      }
      const childInsertSQLList = await ctx.service.diyForm.getChildFormInsertSQLList(childFormKey, version, childDataList);

      const insertSQLList = [ parentInsertSQL, ...childInsertSQLList ];

      const res = await ctx.service.sql.transaction(insertSQLList);

      if (!res.success) {
        ctx.error();
        return;
      }
      // 构造activiti 需要癨数据结构并调用接口发起流程
      const parentId = res.idList[0];
      const childIdList = res.idList.slice(1);

      let childIdListString = '';
      childIdList.forEach(id => {
        childIdListString += id + ',';
      });
      childIdListString = childIdListString.substring(0, childIdListString.length - 1);
      if (childInsertSQLList.length) {
        const SQL = `UPDATE ${childFormKey}${version} SET parentId = ${parentId} where id IN (${childIdListString})`;
        const updateRes = await ctx.service.sql.transaction([ SQL ]);

        if (!updateRes.success) {
          ctx.error();
          return;
        }

      }

      const tenant = await ctx.model.models.tenant.findByPk(parentData && parentData.tenant ? parentData.tenant.value : 0);
      // todo 暂时使用1
      let manager_group_id = 1;

      if (tenant) {
        manager_group_id = tenant.manager_group_id;
      }

      const activitiData = {
        processDefinitionId,
        variables: {
          formId: parentId,
          formKey,
          version,
          manager_user_id: [ ctx.authUser.id.toString() ],
          manager_group_id: [ manager_group_id.toString() ],
        },
        startUser: ctx.authUser.id,
      };
      // 启动流程
      const datas = await ctx.service.syncActiviti.startProcess(activitiData, { headers: ctx.headers });
      // if (formKey === 'moveIn'
      //   && parentData && parentData.text && parentData.text.value === 'send') {
      //   ctx.service.syncActiviti.sendTaskEmail(
      //     { taskId: datas.data }, { headers: ctx.headers });
      // }
      // 保存 pid 同时更新子表 parentId
      const parentUpdateSQL = `UPDATE ${formKey}${version} SET pid = ${datas.data} where id = ${parentId}`;
      const updateSQL = [ parentUpdateSQL ];
      if (childInsertSQLList.length) {
        const childUpdateSQL = `UPDATE ${childFormKey}${version} SET pid = ${datas.data} where parentId = ${parentId}`;
        updateSQL.push(childUpdateSQL);
      }
      const updateFormRes = await ctx.service.sql.transaction(updateSQL);
      if (updateFormRes.success) {
        ctx.success();
      } else {
        ctx.error();
      }
    }

    async detail() {
      const { ctx } = this;
      const { pid, deploymentId } = ctx.query;
      if (!pid) {
        ctx.error();
        return;
      }
      const dynamicForm = await ctx.model.models.dynamicForm.findOne({ where: { deploymentId, parentId: null } });
      const childForm = await ctx.model.models.dynamicForm.findOne({ where: { parentId: dynamicForm.id } });
      const detail = await ctx.service.diyForm.getDIYFormDetail(pid, dynamicForm.formKey, childForm ? childForm.formKey : null, dynamicForm.version);
      // if (!detail) {
      //   ctx.error();
      //   return;
      // }
      ctx.success(detail);
    }
    //
    async update() {
      const { ctx } = this;
      const {
        childFormKey,
        childDataList,
        version,
        taskId,
      } = ctx.request.body;
      // 获取父表插入SQL
      // let parentUpdateSQL = null;
      // console.log(parentData);
      // if (parentData.tenant) {
      //   parentUpdateSQL = await ctx.service.diyForm.getParentFormUpdateSQL(formKey, parentData, pid);
      // }

      // 获取子表插入SQL
      const childUpdateSQLList = await ctx.service.diyForm.getChildFormUpdateSQLList(childFormKey, version, childDataList);

      const updateSQLList = [ ...childUpdateSQLList ];
      // console.log(updateSQLList);
      const res = await ctx.service.sql.transaction(updateSQLList);
      // 发送邮件
      await ctx.service.mailer.sentT3bySkile(childDataList);
      // 下一步启动
      await ctx.service.syncActiviti.actionTask({ taskId, variables: { pass: true } }, { headers: ctx.headers });
      ctx.success();
      if (!res.success) {
        ctx.error();
      } else {
        ctx.success();
      }
    }
    //
    // async delete() {
    //
    // }
    //
    // async deleteMayn() {
    //
    // }
  };
};

