'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      const { name, prop, order } = ctx.query;
      const where = { name };
      // 过滤无用条件
      Object.keys(where).forEach(k => {
        if (where[k] === undefined || where[k] === '' || !where[k]) {
          delete where[k];
        }
      });
      let Order = [ 'name', 'desc' ];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      const findAdParams = {
        where,
        order: Order,
        offset,
        limit,
      };
      const result = await ctx.model.models.ad_group.findAndCountAll(findAdParams);
      ctx.success(result);
    }
    async detail() {
      const { ctx } = this;
      const { id } = ctx.query;
      const result = await ctx.model.models.ad_group.findOne({
        raw: true,
        where: {
          id,
        },
      });
      ctx.success(result);
    }
  };
};
