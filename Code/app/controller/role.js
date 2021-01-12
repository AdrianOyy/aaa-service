'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const roleList = await ctx.model.models.role.findAll();
      ctx.success(roleList);
    }
  };
};
