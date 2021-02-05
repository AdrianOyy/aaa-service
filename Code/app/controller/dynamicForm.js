'use strict';

module.exports = app => {
  return class extends app.Controller {
    async create() {
      const { ctx } = this;
      const { version, modelId, deploymentId } = ctx.request.body;
      const dynamicFormVersion = await ctx.service.workflow.getVersion(modelId);
      const dynamicForm = await ctx.service.workflow.setPubilshDynamicForm(dynamicFormVersion, version, deploymentId);
      // 获取最新 dynamicForm
      const childDynamicForm = await ctx.model.models.dynamicForm.findOne({ where: { parentId: dynamicForm.id } });
      const basicFormFieldList = await ctx.model.models.dynamicFormDetail.findAll({ where: { dynamicFormId: dynamicForm.id } });
      const createBasicFormSQL = await ctx.service.dynamicForm.getBasicNewSQL(dynamicForm.formKey, basicFormFieldList, version);
      const SQLList = [ createBasicFormSQL ];
      if (childDynamicForm) {
        const childTableList = await ctx.model.models.dynamicFormDetail.findAll({ where: { dynamicFormId: childDynamicForm.id } });
        const createChildTableSQLList = await ctx.service.dynamicForm.getChildTableSQLChild(dynamicForm.formKey, childDynamicForm.formKey, childTableList, version);
        SQLList.push(createChildTableSQLList);
      }
      try {
        for (let i = 0; i < SQLList.length; i++) {
          await app.model.query(SQLList[i]);
        }

        // 强删除 version 为 -1 信息
        await ctx.model.models.dynamicForm.destroy({ where: { version: -1, modelId }, force: true });
        ctx.success();
      } catch (error) {
        ctx.error(error);
      }
      ctx.success();
    }

    async getDynamicFormDetail() {
      const { ctx } = this;
      const { deploymentId, userId, formId } = ctx.request.query;
      const dynamicForm = await ctx.model.models.dynamicForm.findOne({ where: { deploymentId } });
      const res = await ctx.service.dynamicForm.getDetailByKey(dynamicForm.formKey, formId);
      const dynamicFormDetail = await ctx.model.models.dynamicFormDetail.findAll({ where: { dynamicFormId: dynamicForm.id } });
      const detailList = [];
      for (const formDetail of dynamicFormDetail) {
        const form = {};
        form.id = formDetail.id;
        form.label = formDetail.fieldName;
        form.fileType = formDetail.fileType;
        form.type = formDetail.inputType;
        form.showOnRequest = formDetail.showOnRequest;
        form.foreignTable = formDetail.foreignTable;
        form.foreignDisplayKey = formDetail.foreignDisplayKey;
        form.foreignKey = formDetail.foreignKey;
        form.labelField = formDetail.foreignDisplayKey;
        form.valueField = formDetail.foreignKey;
        form.indexOf = formDetail.indexOf;
        form.remark = formDetail.remark;
        form.readOnly = false;
        form.disable = true;
        if (formDetail.inputType === 'select') {
          if (formDetail.foreignTable === 'tenant') {
            const itemList = await ctx.service.user.getTenants(userId);
            form.itemList = itemList;
          } else {
            const itemList = await ctx.model.models[formDetail.foreignTable].findAll({});
            form.itemList = itemList;
          }
          form.value = res[formDetail.fieldName][formDetail.foreignKey];
        } else {
          form.value = res[formDetail.fieldName];
        }
        detailList.push(form);
      }
      // 获取子流程
      const sonFormList = [];
      const sonDetailList = [];
      const sonForm = await ctx.model.models.dynamicForm.findOne({ where: { parentId: dynamicForm.id } });
      if (sonForm) {
        const resdetail = res.childTable;
        const sonFormDetail = await ctx.model.models.dynamicFormDetail.findAll({ where: { dynamicFormId: sonForm.id } });
        for (const sonDetail of sonFormDetail) {
          const form = {};
          form.id = sonDetail.id;
          form.label = sonDetail.fieldName;
          form.fileType = sonDetail.fileType;
          form.type = sonDetail.inputType;
          form.showOnRequest = sonDetail.showOnRequest;
          form.foreignTable = sonDetail.foreignTable;
          form.foreignDisplayKey = sonDetail.foreignDisplayKey;
          form.foreignKey = sonDetail.foreignKey;
          form.labelField = sonDetail.foreignDisplayKey;
          form.valueField = sonDetail.foreignKey;
          form.indexOf = sonDetail.indexOf;
          form.remark = sonDetail.remark;
          form.readOnly = false;
          form.value = '';
          if (sonDetail.inputType === 'select') {
            if (sonDetail.foreignTable === 'tenant') {
              const itemList = await ctx.service.user.getTenants(userId);
              form.itemList = itemList;
            } else {
              const itemList = await ctx.model.models[sonDetail.foreignTable].findAll({});
              form.itemList = itemList;
            }
          }
          sonFormList.push(form);
        }
        for (const resd of resdetail) {
          const p = {};
          for (const sonDetail of sonFormDetail) {
            if (sonDetail.inputType === 'select') {
              p[sonDetail.fieldName + '_svalue'] = resd[sonDetail.fieldName] ? resd[sonDetail.fieldName][sonDetail.foreignKey] : null;
              p[sonDetail.fieldName] = resd[sonDetail.fieldName] ? resd[sonDetail.fieldName][sonDetail.foreignDisplayKey] : null;
            } else {
              p[sonDetail.fieldName] = resd[sonDetail.fieldName];
            }
          }
          sonDetailList.push(p);
        }
      }
      ctx.success({ dynamicForm, detailList, sonForm, sonFormList, sonDetailList });
    }

    async save() {
      const { ctx } = this;
      const { formKey, processDefinitionId, startUser, formFieldList, childFormKey, sonFormList, sonDetailList, version } = ctx.request.body;
      let parentsId = 0;
      let tenantCode = null;
      let tenantKey = null;
      if (formFieldList.length > 0) {
        const parentForm = {};
        for (const formfile of formFieldList) {
          parentForm[formfile.fieldName] = formfile.value;
          if (formfile.foreignTable === 'tenant') {
            tenantCode = formfile.value;
            tenantKey = formfile.foreignKey;
          }
        }
        const insertSql = await ctx.service.dynamicForm.getInsertSQL(formKey, parentForm);
        const parents = await app.model.query(insertSql);
        parentsId = parents[0];
      }
      // 保存子流程
      if (sonDetailList.length > 0) {
        for (const sonDetail of sonDetailList) {
          const sonFormDetail = {
            parentId: parentsId,
          };
          for (const sonField of sonFormList) {
            if (sonField.type === 'select') {
              sonFormDetail[sonField.fieldName] = sonDetail[sonField.fieldName + '_svalue'];
            } else {
              sonFormDetail[sonField.fieldName] = sonDetail[sonField.fieldName];
            }
          }
          sonFormDetail.data_center = await ctx.service.dc.getDC(sonFormDetail.environment_type, sonFormDetail.network_zone);
          const insertSql = await ctx.service.dynamicForm.getInsertSQL(childFormKey, sonFormDetail);
          // console.log(insertSql);
          await app.model.query(insertSql);
        }
      }
      const tenant = await ctx.model.models.tenant.findOne({
        raw: true,
        where: {
          [tenantKey]: tenantCode,
        },
      });
      const activitiData = {
        processDefinitionId,
        variables: {
          formId: parentsId,
          formKey,
          version,
          manager_group_id: [ tenant.manager_group_id.toString() ],
        },
        startUser,
      };
      // // 启动流程
      const datas = await ctx.service.syncActiviti.startProcess(activitiData, { headers: ctx.headers });
      // 保存pid
      const updateSql = `UPDATE ${formKey} SET pid = ${datas.data} where id = ${parentsId}`;
      await app.model.query(updateSql);
      const updateSql2 = `UPDATE ${childFormKey} SET pid = ${datas.data} where parentId = ${parentsId}`;
      await app.model.query(updateSql2);
      ctx.success('success');
    }

    async getDetailByKey() {
      const { ctx } = this;
      const { formKey, formId, version } = ctx.query;
      if (!formKey || !formId) ctx.error();
      const res = await ctx.service.dynamicForm.getDetailByKey(formKey, version, formId);
      if (res && res.tenant && res.tenant.manager_group_id) {
        const manager_group = await ctx.model.models.ad_group.findOne({
          raw: true,
          attributes: [ 'name' ],
          where: {
            id: res.tenant.manager_group_id,
          },
        });
        manager_group ? res.tenant.manager_group_name = manager_group.name : undefined;
      }
      if (!res) ctx.error();
      else ctx.success(res);
    }

    async getDetailByVm() {
      const { ctx } = this;
      const { formKey, formId, version } = ctx.query;
      if (!formKey || !formId) ctx.error();
      const res = await ctx.service.dynamicForm.getDetailByKey(formKey, version, formId);
      if (res && res.tenant && res.tenant.manager_group_id) {
        const manager_group = await ctx.model.models.ad_group.findOne({
          raw: true,
          attributes: [ 'name' ],
          where: {
            id: res.tenant.manager_group_id,
          },
        });
        manager_group ? res.tenant.manager_group_name = manager_group.name : undefined;
      }
      if (res && res.childTable && res.childTable.length > 0) {
        const { childTable } = res;
        for (const child of childTable) {
          const where = {
            clusterName: child.vm_cluster,
            cdcId: child.data_center ? child.data_center.id : 0,
            applicationTypeId: child.application_type ? child.application_type.id : 0,
          };
          const dcMapper = await ctx.model.models.vm_cluster_dc_mapping.findOne({ where });
          child.dcMapper = dcMapper;
        }
      }
      if (!res) ctx.error();
      else ctx.success(res);
    }

    async verifyApplicationType() {
      const { ctx } = this;
      try {
        const { formKey, formId } = ctx.query;
        const res = await ctx.service.dynamicForm.getApplicationType(formKey, formId);
        ctx.success(res);
      } catch (error) {
        ctx.error(error);
      }
    }

    async getDynamicForm() {
      const { ctx } = this;
      const { deploymentId, stepName } = ctx.query;
      const dynamicForm = await ctx.service.dynamicForm.getDynamicFormWithForeignTable(deploymentId, stepName);
      ctx.success(dynamicForm ? dynamicForm : {});
    }

    async checkTableExist() {
      const { ctx } = this;
      const { formKeyList } = ctx.request.body;
      if (!formKeyList) ctx.error();
      else {
        const isExist = await ctx.service.dynamicForm.checkTableExist(formKeyList);
        ctx.success({ isExist });
      }
    }

  };
};
