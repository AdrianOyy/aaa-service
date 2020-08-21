'use strict';

module.exports = app => {
  return class extends app.Controller {
    async create() {
      const { ctx } = this;
      const { list } = ctx.request.body;
      JSON.parse(list).forEach(el => {
        console.log('el==========================el');
        console.log(el);
        console.log('el==========================el');
        console.log('xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
      });
      console.log('ctx.request.body==========================ctx.request.body');
      console.log(ctx.request.body);
      console.log('ctx.request.body==========================ctx.request.body');
      ctx.success();
    }

    async test() {
      const { ctx } = this;
      const body = {
        formKey: 'VMALLOCATION',
        deploymentId: '67501',
        list: '[{"id":"Tnenant","name":"${tenant.code | name}#list","type":"string","readable":true,"writable":true,"required":true,"formProperty":null,"childTable":null},{"id":"Text","name":"text#text","type":"string","readable":true,"writable":true,"required":false,"formProperty":null,"childTable":null},{"id":"vmList","name":null,"type":"enum","readable":true,"writable":true,"required":false,"formProperty":null,"childTable":{"CPU":"string","Type":"${type.id | name}#list"}}]',
      };
      const basicFormFieldList = [];
      const childTableList = [];
      JSON.parse(body.list).forEach(el => {
        if (el.type === 'enum') {
          childTableList.push(el);
        } else {
          basicFormFieldList.push(el);
        }
      });
      const createBasicFormSQL = await ctx.service.dynamicForm.getBasicSQL(body.formKey, basicFormFieldList);
      const createChildTableSQLList = await ctx.service.dynamicForm.getChildTableSQLList(childTableList);
      [ createBasicFormSQL, ...createChildTableSQLList ].forEach(SQL => {
        app.model.query(SQL);
      });
      ctx.success();
    }
  };
};
