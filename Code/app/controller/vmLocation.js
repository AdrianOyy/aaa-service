'use strict';

module.exports = app => {
  return class extends app.Controller {
    async detail() {
      const { ctx } = this;
      const { id } = ctx.query;
      const result = await ctx.model.models.vm_location.findOne({
        raw: true,
        where: {
          id,
        },
      });
      ctx.success(result);
    }
    async create() {
      const { ctx } = this;
      const { code, name, processDefinitionId, startUser } = ctx.request.body;
      // const token = ctx.headers.authorization;
      let vm = {
        code,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      try {
        vm = await ctx.model.models.vm_location.create(vm);
        const tenant = await ctx.model.models.tenant.findOne({
          raw: true,
          where: {
            code,
          },
        });
        const data = {
          processDefinitionId,
          variables: {
            vm_id: vm.id,
            manager_group_id: [ tenant.manager_group_id.toString() ],
          },
          startUser,
        };
        await ctx.service.syncActiviti.startProcess(data, { headers: ctx.headers });
        ctx.success('success');
      } catch (error) {
        console.log('error==========================error');
        console.log(error);
        console.log('error==========================error');
        throw { status: 500, message: 'service busy' };
      }
    }
    // async create() {
    //   const { ctx } = this;
    //   const { formFieldList, dialogFormList, dialogValueList, dynamicForm, vmlocation } = ctx.request.body;
    //   let parents = null;
    //   if (formFieldList.length > 0) {
    //     const parentForm = {};
    //     for (const formfile of formFieldList) {
    //       parentForm[formfile.id] = formfile.value;
    //     }
    //     console.log(parentForm);
    //     console.log(dynamicForm.name);
    //     parents = await ctx.model.models[dynamicForm.name].create(parentForm);
    //   }
    //   if (dialogValueList.length > 0) {
    //     const dialogForm = {
    //       parentId: parents.id,
    //     };
    //     for (const dialogValue of dialogValueList) {
    //       for (const dialog of dialogFormList) {
    //         dialogForm[dialog.id] = dialogValue[dialog.id];
    //       }
    //       await ctx.model.models[vmlocation.name].create(dialogForm);
    //     }
    //   }
    //   ctx.success('success');
    // }
  };
};
