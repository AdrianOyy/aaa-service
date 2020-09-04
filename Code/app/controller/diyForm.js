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
      } = ctx.request.body;
      ctx.success();

      // 获取父表插入SQL
      const parentInsertSQL = await ctx.service.diyForm.getParentFormInsetSQL(formKey, parentData);

      // 获取子表插入SQL
      const childInsertSQLList = await ctx.service.diyForm.getChildFormInsertSQLList(childFormKey, childDataList);

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

      const SQL = `UPDATE ${childFormKey} SET parentId = ${parentId} where id IN (${childIdListString})`;

      const updateRes = await ctx.service.sql.transaction([ SQL ]);

      if (!updateRes.success) {
        ctx.error();
        return;
      }

      const tenant = await ctx.model.models.tenant.findByPk(parentData && parentData.tenant ? parentData.tenant.value : 0);

      let manager_group_id = 0;

      if (tenant) {
        manager_group_id = tenant.manager_group_id;
      }

      const activitiData = {
        processDefinitionId,
        variables: {
          formId: parentId,
          formKey,
          manager_group_id: [ manager_group_id.toString() ],
        },
        startUser: ctx.authUser.id,
      };
      // 启动流程
      const datas = await ctx.service.syncActiviti.startProcess(activitiData, { headers: ctx.headers });
      // 保存 pid 同时更新子表 parentId
      const parentUpdateSQL = `UPDATE ${formKey} SET pid = ${datas.data} where id = ${parentId}`;
      const childUpdateSQL = `UPDATE ${childFormKey} SET pid = ${datas.data} where parentId = ${parentId}`;
      const updateFormRes = await ctx.service.sql.transaction([ parentUpdateSQL, childUpdateSQL ]);
      if (updateFormRes.success) {
        ctx.success();
      } else {
        ctx.error();
      }
    }

    // async detail() {
    //
    // }
    //
    async update() {
      const { ctx } = this;
      const {
        formKey,
        formId,
        childFormKey,
        parentData,
        childDataList,
      } = ctx.request.body;
      // 获取父表插入SQL
      const parentInsertSQL = await ctx.service.diyForm.getParentFormUpdateSQL(formKey, parentData, formId);

      // 获取子表插入SQL
      const childInsertSQLList = await ctx.service.diyForm.getChildFormUpdateSQLList(childFormKey, childDataList);

      const updateSQLList = [ parentInsertSQL, ...childInsertSQLList ];

      const res = await ctx.service.sql.transaction(updateSQLList);

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

