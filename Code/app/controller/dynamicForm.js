'use strict';

module.exports = app => {
  return class extends app.Controller {
    async create() {
      const { ctx } = this;
      const { formKey, deploymentId, list } = ctx.request.body;
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
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      // 子表
      const childFormData = [];
      childTableList.forEach(el => {
        const model = {
          parentId: basicDynamicForm.id,
          formKey: el.id,
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
        form.readOnly = false;
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
        const sonFormDetail = await ctx.model.models.dynamicFormDetail.findAll({ where: { dynamicFormId: sonForm.id } });
        for (const sonDetail of sonFormDetail) {
          const form = {};
          form.id = sonDetail.fieldName;
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
              const itemList = await ctx.model.models[sonDetail.foreignTable].findAll({});
              form.itemList = itemList;
            }
          }
          sonFormList.push(form);
        }
      }
      ctx.success({ dynamicForm, detailList, sonForm, sonFormList, sonDetailList });
    }

    async save() {
      const { ctx } = this;
      const { dynamicForm, processDefinitionId, startUser, formFieldList, sonForm, sonFormList, sonDetailList } = ctx.request.body;
      let parentsId = 0;
      let tenantCode = null;
      let tenantKey = null;
      if (formFieldList.length > 0) {
        const parentForm = {};
        for (const formfile of formFieldList) {
          parentForm[formfile.label] = formfile.value;
          if (formfile.foreignTable === 'tenant') {
            tenantCode = formfile.value;
            tenantKey = formfile.foreignKey;
          }
        }
        console.log(dynamicForm.formKey);
        // parents = await ctx.model.models[dynamicForm.formKey].create(parentForm);
        const insertSql = await ctx.service.dynamicForm.getInsertSQL(dynamicForm, parentForm);
        console.log(insertSql);
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
            sonFormDetail[sonField.label] = sonDetail[sonField.label];
          }
          const insertSql = await ctx.service.dynamicForm.getInsertSQL(sonForm, sonFormDetail);
          console.log(insertSql);
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
          formKey: dynamicForm.formKey,
          manager_group_id: [ tenant.manager_group_id.toString() ],
        },
        startUser,
      };
      // // 启动流程
      const datas = await ctx.service.syncActiviti.startProcess(activitiData, { headers: ctx.headers });
      console.log('datas ================= datas');
      console.log(datas);
      console.log('datas ================= datas');
      // 保存pid
      const updateSql = `UPDATE ${dynamicForm.formKey} SET pid = ${datas.data} where id = ${parentsId}`;
      await app.model.query(updateSql);
      const updateSql2 = `UPDATE ${sonForm.formKey} SET pid = ${datas.data} where parentId = ${parentsId}`;
      await app.model.query(updateSql2);
      ctx.success('success');
    }

    async test() {
      const { ctx } = this;
      const body = {
        formKey: 'VMALLOCATION',
        deploymentId: '67501',
        list: '[{"id":"Tenant","name":"${tenant.id | name}#list","type":"string","readable":true,"writable":true,"required":true,"formProperty":null,"childTable":null},{"id":"Text","name":"text#text","type":"string","readable":true,"writable":true,"required":false,"formProperty":null,"childTable":null},{"id":"vmList","name":null,"type":"enum","readable":true,"writable":true,"required":false,"formProperty":null,"childTable":{"CPU":"string","Group":"${ad_group.id | name}#list"}}]',
      };
      const { formKey, deploymentId, list } = body;
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
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      // 子表
      const childFormData = [];
      childTableList.forEach(el => {
        const model = {
          parentId: basicDynamicForm.id,
          formKey: el.id,
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
    }

    async getDetailByKey() {
      const { ctx } = this;
      const { formKey, formId } = ctx.query;
      if (!formKey || !formId) ctx.error();
      const res = await ctx.service.dynamicForm.getDetailByKey(formKey, formId);
      if (!res) ctx.error();
      else ctx.success(res);
    }
  };
};
