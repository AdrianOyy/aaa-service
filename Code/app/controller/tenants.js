'use strict';

module.exports = app => {
  return class extends app.Controller {

    async list() {
      const { ctx } = this;
      const result = await ctx.model.models.tenants.findAndCountAll({});
      ctx.success(result);
    }

    async listMapping() {
      const { ctx } = this;
      const result = await ctx.model.models.tenantsMapping.findAndCountAll({});
      ctx.success(result);
    }
  };
};
