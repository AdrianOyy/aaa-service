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
  };
};
