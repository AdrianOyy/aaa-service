'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      if (!ctx.service.common.checkApiKey()) {
        ctx.status = 401;
        ctx.body = {
          success: false,
          data: null,
          message: 'Unauthorized',
        };
        return;
      }
      let { formKey, startTime, endTime } = ctx.query;
      if (startTime && isNaN(parseInt(new Date(startTime).getTime())) || endTime && isNaN(parseInt(new Date(endTime).getTime()))) {
        ctx.success([]);
        return;
      }
      if (startTime && endTime && (new Date(startTime) - new Date(endTime) > 0)) {
        const tmp = startTime;
        startTime = endTime;
        endTime = tmp;
      }
      const res = await ctx.service.diyForm.getWorkflowInformation(formKey, startTime, endTime);
      ctx.success(res);
    }

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
      // ctx.success();
      // 获取父表插入SQL
      const parentInsertSQL = await ctx.service.diyForm.getParentFormInsetSQL(formKey, version, parentData, ctx.authUser.id);

      // 获取子表插入SQL
      for (const childData of childDataList) {
        const dc = await ctx.service.dc.getDC(childData.environment_type.value, childData.network_zone.value);
        childData.data_center = {
          id: 'data_center',
          value: dc,
          label: dc,
        };
      }
      const childInsertSQLList = await ctx.service.diyForm.getChildFormInsertSQLList(childFormKey, version, childDataList, ctx.authUser.id);

      const insertSQLList = [ parentInsertSQL, ...childInsertSQLList ];

      const res = await ctx.service.sql.transaction(insertSQLList);

      if (!res.success) {
        ctx.error();
        return;
      }
      // 构造 activiti 需要癨数据结构并调用接口发起流程
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

      const tenant = await ctx.model.models.tenant.findByPk(parentData && parentData.tenant ? parentData.tenant.value : 0);
      // todo 暂时使用1
      let manager_group_id = 1;
      if (tenant) {
        const ad_group = await ctx.model.models.ad_group.findOne({
          raw: true,
          where: {
            id: tenant.manager_group_id,
          },
        });
        if (ad_group) {
          manager_group_id = ad_group.name;
        }
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
          process: false,
          start_name: ctx.authUser.name, // 流程发起人Display Name
          start_email: ctx.authUser.email, // 流程发起人email
          start_corp: ctx.authUser.sAMAccountName, // 流程发起人Corp Id
        },
        startUser: ctx.authUser.id,
      };
      if (workflowName === 'Account management'
        || workflowName === 'Non-Personal Account'
        || workflowName === 'Distribution List'
        || workflowName === 'Closing Account') {
        activitiData.variables.displayTree = parentData.account_type ? parentData.account_type.value.replace('!@#', ',') : '';
        if (startValues) {
          activitiData.variables.updateTree = await ctx.service.workflow.setUpdateType(parentData, startValues, deploymentId);
        }
        const emails = parentData.supervisoremailaccount.value.split(',');
        const users = await ctx.model.models.user.findAll({
          raw: true,
          attributes: [ 'corpId', 'id' ],
        });
        const userIds = [];
        if (users && users.length > 0 && emails.length > 0) {
          users.forEach(_ => {
            if (emails.includes(_.corpId)) {
              userIds.push(_.id.toString());
            }
          });
        }
        if (userIds && userIds.length > 0) {
          activitiData.variables.manager_user_id = userIds;
        } else {
          const res = await ctx.service.adService.findUsersByCn(emails);
          const token = await ctx.service.jwtUtils.getToken({ content: { username: ctx.authUser.sAMAccountName }, expiresIn: app.config.jwt.expiresIn });
          for (let i = 0; i < res.length; i++) {
            const auth = {};
            auth.token = token;
            auth.user = res[i].user;
            auth.groups = res[i].groups;
            const user = await ctx.service.user.loadUser(auth);
            user ? userIds.push(user.id.toString()) : undefined;
          }
          activitiData.variables.manager_user_id = userIds;
        }
      }
      // 启动流程
      const { pid, message, error } = await ctx.service.syncActiviti.startProcess(activitiData, { headers: ctx.headers });
      if (error) {
        ctx.error(message);
        return;
      }

      // 保存 pid 同时更新子表 parentId
      const parentUpdateSQL = `UPDATE ${formKey}${version} SET pid = ${pid} where id = ${parentId}`;
      const updateSQL = [ parentUpdateSQL ];
      if (childInsertSQLList.length) {
        const childUpdateSQL = `UPDATE ${childFormKey}${version} SET pid = ${pid} where parentId = ${parentId}`;
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
      ctx.success(detail);
    }

    async update() {
      const { ctx } = this;
      const {
        formKey,
        pid,
        parentData,
        childFormKey,
        childDataList,
        version,
        // isSentMail,
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

      const updateSQLList = [ parentUpdateSQL, ...childUpdateSQLList ]; 3;
      // console.log(updateSQLList);
      const res = await ctx.service.sql.transaction(updateSQLList);
      // 发送邮件
      await ctx.service.mailer.sentT3bySkile(childDataList, parentData);
      // 下一步启动
      ctx.service.syncActiviti.actionTask({ taskId, variables: { pass: true } }, { headers: ctx.headers });
      // 延时3s
      await new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 3000);
      });
      // ctx.success();
      if (!res.success) {
        ctx.error();
      } else {
        ctx.success();
      }
    }
  };
};

