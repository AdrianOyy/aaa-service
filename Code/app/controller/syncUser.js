'use strict';

module.exports = app => {
  return class extends app.Controller {

    async list() {
      const { ctx } = this;
      const result = await ctx.model.models.syncUser.findAndCountAll({});
      ctx.success(result);
    }
  };
};
