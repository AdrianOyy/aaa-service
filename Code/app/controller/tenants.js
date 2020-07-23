'use strict';

module.exports = app => {
  return class extends app.Controller {

    async list() {
      const { ctx } = this;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      const { project, prop, order } = ctx.query;
      const where = { project };

      // 过滤无用条件
      Object.keys(where).forEach(k => {
        if (where[k] === undefined || where[k] === '' || !where[k]) {
          delete where[k];
        }
      });
      let Order = [ 'project' ];
      if (order && prop) {
        Order = [[ `${prop}`, `${order}` ]];
      }
      const findAdParams = {
        where,
        order: Order,
        offset,
        limit,
      };
      const result = await ctx.model.models.tenants.findAndCountAll(findAdParams);
      ctx.success(result);
    }

    async listMapping() {
      const { ctx } = this;
      const result = await ctx.model.models.tenantsMapping.findAndCountAll({});
      ctx.success(result);
    }
  };
};
