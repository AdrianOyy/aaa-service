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
      const { code, name } = ctx.request.body;
      let vm = {
        code,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      try {
        vm = await ctx.model.models.vm_location.create(vm);
        ctx.success(vm);
      } catch (error) {
        throw { status: 500, message: 'service busy' };
      }
    }
  };
};
