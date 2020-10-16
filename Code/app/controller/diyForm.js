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
        startValues,
        workflowName,
        deploymentId,
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
          displayTree: '',
          updateTree: '',
          manager_user_id: [ ctx.authUser.id.toString() ],
          manager_group_id: [ manager_group_id.toString() ],
        },
        startUser: ctx.authUser.id,
      };
      if (workflowName === 'Account management') {
        activitiData.variables.displayTree = parentData.account_type ? parentData.account_type.value : '';
        if (startValues) {
          activitiData.variables.updateTree = await ctx.service.workflow.setUpdateType(parentData, startValues, deploymentId);
        }
        const emails = parentData.supervisoremailaccount.value.split(',');
        const result = await ctx.service.syncActiviti.getUsersByEmails({ emails }, { headers: ctx.headers });
        let userIds = [];
        result && result.data && result.data.length > 0 ? userIds = result.data.map(_ => { return _.id; }) : undefined;
        userIds && userIds.length > 0 ? activitiData.variables.manager_user_id = userIds : undefined;
      }
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
        formKey,
        pid,
        parentData,
        childFormKey,
        childDataList,
        version,
        isSentMail,
        taskId,
      } = ctx.request.body;
      // 获取父表插入SQL
      let parentUpdateSQL = [];
      if (parentData) {
        parentUpdateSQL = await ctx.service.diyForm.getParentFormUpdateSQL(formKey, version, parentData, pid);
      }
      let childUpdateSQLList = [];
      if (childDataList) {
        // 获取子表插入SQL
        childUpdateSQLList = await ctx.service.diyForm.getChildFormUpdateSQLList(childFormKey, version, childDataList);
      }

      const updateSQLList = [ parentUpdateSQL, ...childUpdateSQLList ];
      // console.log(updateSQLList);
      const res = await ctx.service.sql.transaction(updateSQLList);
      // 发送邮件
      if (isSentMail) {
        await ctx.service.mailer.sentT3bySkile(childDataList);
      }
      // 下一步启动
      await ctx.service.syncActiviti.actionTask({ taskId, variables: { pass: true } }, { headers: ctx.headers });
      // ctx.success();
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

