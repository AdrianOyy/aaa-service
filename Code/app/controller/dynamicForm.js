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

    async test() {
      const { ctx } = this;
      const body = {
        formKey: 'VMALLOCATION',
        deploymentId: '67501',
        list: '[{"id":"Tenant","name":"${tenant.code | name}#list","type":"string","readable":true,"writable":true,"required":true,"formProperty":null,"childTable":null},{"id":"Text","name":"text#text","type":"string","readable":true,"writable":true,"required":false,"formProperty":null,"childTable":null},{"id":"vmList","name":null,"type":"enum","readable":true,"writable":true,"required":false,"formProperty":null,"childTable":{"CPU":"string","Type":"${type.id | name}#list"}}]',
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
  };
};
