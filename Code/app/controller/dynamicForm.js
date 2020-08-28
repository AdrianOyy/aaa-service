'use strict';

module.exports = app => {
  return class extends app.Controller {
    async create() {
      const { ctx } = this;
      const { formKey, deploymentId, list, workflowName } = ctx.request.body;
      const basicFormFieldList = [];
      const childTableList = [];
      JSON.parse(list)
        .forEach(el => {
          if (el.type === 'enum') {
            childTableList.push(el);
          } else {
            basicFormFieldList.push(el);
          }
        });

      // 记录表
      // 父表
      const basicDynamicForm = await ctx.model.models.dynamicForm.create({
        deploymentId,
        formKey,
        workflowName,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      // 子表
      const childFormData = [];
      childTableList.forEach(el => {
        const model = {
          parentId: basicDynamicForm.id,
          formKey: el.id,
          workflowName,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        childFormData.push(model);
      });
      const childDynamicFormList = await ctx.model.models.dynamicForm.bulkCreate(childFormData);

      // 渲染表
      const basicDynamicFormDetailData = await ctx.service.dynamicForm.getBasicDynamicFormDetailData(basicDynamicForm.id, basicFormFieldList);
      const childDynamicFormDetailData = await ctx.service.dynamicForm.getChildDynamicFormDetailData(childTableList, childDynamicFormList);
      await ctx.model.models.dynamicFormDetail.bulkCreate([ ...basicDynamicFormDetailData, ...childDynamicFormDetailData ]);

      // 创建数据表
      const createBasicFormSQL = await ctx.service.dynamicForm.getBasicSQL(formKey, basicFormFieldList);
      const createChildTableSQLList = await ctx.service.dynamicForm.getChildTableSQLList(formKey, childTableList);
      const SQLList = [ createBasicFormSQL, ...createChildTableSQLList ];
      try {
        for (let i = 0; i < SQLList.length; i++) {
          await app.model.query(SQLList[i]);
        }
        ctx.success();
      } catch (error) {
        ctx.error(error);
      }
      ctx.success();
    }

    async getDynamicForm() {
      const { ctx } = this;
      const { deploymentId, userId } = ctx.request.query;
      const dynamicForm = await ctx.model.models.dynamicForm.findOne({ where: { deploymentId } });
      if (!dynamicForm) ctx.error();
      const dynamicFormDetail = await ctx.model.models.dynamicFormDetail.findAll({ where: { dynamicFormId: dynamicForm.id } });
      const detailList = [];
      for (const formDetail of dynamicFormDetail) {
        const form = {};
        form.id = formDetail.fieldName;
        form.label = formDetail.fieldName;
        form.fileType = formDetail.fileType;
        form.type = formDetail.inputType;
        form.showOnRequest = formDetail.showOnRequest;
        form.foreignTable = formDetail.foreignTable;
        form.foreignDisplayKey = formDetail.foreignDisplayKey;
        form.foreignKey = formDetail.foreignKey;
        form.labelField = formDetail.foreignDisplayKey;
        form.valueField = formDetail.foreignKey;
        form.readOnly = !formDetail.writable;
        form.disabled = true;
        form.value = '';
        if (formDetail.inputType === 'select') {
          if (formDetail.foreignTable === 'tenant') {
            const itemList = await ctx.service.user.getTenants(userId);
            form.itemList = itemList;
          } else {
            const itemList = await ctx.model.models[formDetail.foreignTable].findAll({});
            form.itemList = itemList;
          }
        }
        detailList.push(form);
      }
      // 获取子流程
      const sonFormList = [];
      const sonDetailList = [];
      const sonForm = await ctx.model.models.dynamicForm.findOne({ where: { parentId: dynamicForm.id } });
      if (sonForm) {
        const sonFormDetail = await ctx.model.models.dynamicFormDetail.findAll({ where: { dynamicFormId: sonForm.id, readable: true } });
        for (const sonDetail of sonFormDetail) {
          const form = {};
          form.id = sonDetail.fieldName;
          form.label = sonDetail.fieldName;
          form.fileType = sonDetail.fileType;
          form.type = sonDetail.inputType === 'long' ? 'number' : sonDetail.inputType;
          form.showOnRequest = sonDetail.showOnRequest;
          form.foreignTable = sonDetail.foreignTable;
          form.foreignDisplayKey = sonDetail.foreignDisplayKey;
          form.foreignKey = sonDetail.foreignKey;
          form.labelField = sonDetail.foreignDisplayKey;
          form.valueField = sonDetail.foreignKey;
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
      }
      ctx.success({ dynamicForm, detailList, sonForm, sonFormList, sonDetailList });
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
          form.readOnly = false;
          form.value = '';
          if (sonDetail.inputType === 'select') {
            if (sonDetail.foreignTable === 'tenant') {
              const itemList = await ctx.service.user.getTenants(userId);
              form.itemList = itemList;
            } else {
              console.log(sonDetail.foreignTable);
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
              console.log(resd);
              console.log(resd[sonDetail.fieldName]);
              p[sonDetail.fieldName] = resd[sonDetail.fieldName] ? resd[sonDetail.fieldName].id : null;
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
      const { formKey, processDefinitionId, startUser, formFieldList, childFormKey, sonFormList, sonDetailList } = ctx.request.body;
      let parentsId = 0;
      let tenantCode = null;
      let tenantKey = null;
      if (formFieldList.length > 0) {
        const parentForm = {};
        for (const formfile of formFieldList) {
          console.log(formfile);
          parentForm[formfile.label] = formfile.value;
          if (formfile.foreignTable === 'tenant') {
            tenantCode = formfile.value;
            tenantKey = formfile.foreignKey;
          }
        }
        // console.log(dynamicForm.formKey);
        // parents = await ctx.model.models[dynamicForm.formKey].create(parentForm);
        const insertSql = await ctx.service.dynamicForm.getInsertSQL(formKey, parentForm);
        // console.log(insertSql);
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
              sonFormDetail[sonField.label] = sonDetail[sonField.label + '_svalue'];
            } else {
              sonFormDetail[sonField.label] = sonDetail[sonField.label];
            }

          }
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
      console.log(tenant);
      const activitiData = {
        processDefinitionId,
        variables: {
          formId: parentsId,
          formKey,
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
      const { formKey, formId } = ctx.query;
      if (!formKey || !formId) ctx.error();
      const res = await ctx.service.dynamicForm.getDetailByKey(formKey, formId);
      console.log('==========================1');
      console.log(res);
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

    async test() {
      const { ctx } = this;
      const { deploymentId } = ctx.query;
      const dynamicForm = await ctx.service.dynamicForm.getDynamicFormWithForeignTable(deploymentId);
      ctx.success(dynamicForm ? dynamicForm : {});
    }

    // async getDynamicForm() {
    //   const { ctx } = this;
    //   const { deploymentId } = ctx.query;
    //   const dynamicForm = await ctx.service.dynamicForm.getDynamicForm({ deploymentId });
    //   ctx.success(dynamicForm ? dynamicForm : undefined);
    // }
  };
};
