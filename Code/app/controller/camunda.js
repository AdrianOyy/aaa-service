'use strict';

module.exports = app => {
  return class extends app.Controller {

    async start() {
      const { ctx } = this;
      const {
        formKey,
        childFormKey,
        parentData,
        childDataList,
        processDefinitionId,
        version,
        workflowName,
      } = ctx.request.body;
      // ctx.success();
      // 获取父表插入SQL
      const parentInsertSQL = await ctx.service.diyForm.getParentFormInsetSQL(formKey, version, parentData, ctx.authUser.id);

      // 获取子表插入SQL
      const childInsertSQLList = await ctx.service.diyForm.getChildFormInsertSQLList(childFormKey, version, childDataList, ctx.authUser.id);

      const insertSQLList = [ parentInsertSQL, ...childInsertSQLList ];

      const res = await ctx.service.sql.transaction(insertSQLList);

      if (!res.success) {
        ctx.error();
        return;
      }
      // 构造 activiti 需要数据结构并调用接口发起流程
      const parentId = res.idList[0];
      const childIdList = res.idList.slice(1);

      let childIdListString = '';
      childIdList.forEach(id => {
        childIdListString += id + ',';
      });
      childIdListString = childIdListString.substring(0, childIdListString.length - 1);
      if (childInsertSQLList.length) {
        const SQL = `UPDATE ${childFormKey}${version} SET parentId = ${parentId} where id IN (${childIdListString}, 0)`;
        const updateRes = await ctx.service.sql.transaction([ SQL ]);
        if (!updateRes.success) {
          ctx.error();
          return;
        }

      }

      // todo 暂时使用1
      const manager_group_id = 1;
      const frontEndUrl = app.config.mailGroup.frontEndUrl;
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
          process: false,
          start_name: ctx.authUser.name, // 流程发起人Display Name
          start_email: ctx.authUser.email, // 流程发起人email
          start_corp: ctx.authUser.sAMAccountName, // 流程发起人Corp Id
          workflowName,
          frontEndUrl,
        },
        startUser: ctx.authUser.sAMAccountName,
      };
      this.startProcess(ctx, activitiData, formKey, version, parentId, childInsertSQLList, childFormKey);
      // 延时3秒
      await new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 3000);
      });
      ctx.success();
    }

    async startProcess(ctx, activitiData, formKey, version, parentId, childInsertSQLList, childFormKey) {
      // 启动流程
      const { pid, message, error } = await ctx.service.syncCamunda.startProcess(activitiData, { headers: ctx.headers });
      if (error) {
        ctx.error(message);
        console.log(new Date() + ' create processs startProcess error, message: ', message, ' pid: ', pid);
        return;
      }

      // 保存 pid 同时更新子表 parentId
      const parentUpdateSQL = `UPDATE ${formKey}${version} SET pid = '${pid}' where id = ${parentId}`;
      const updateSQL = [ parentUpdateSQL ];
      if (childInsertSQLList.length) {
        const childUpdateSQL = `UPDATE ${childFormKey}${version} SET pid = '${pid}' where parentId = ${parentId}`;
        updateSQL.push(childUpdateSQL);
      }
      await ctx.service.sql.transaction(updateSQL);
    }
  };
};

