'use strict';

module.exports = app => {
  return class extends app.Controller {

    async list() {
      const { ctx } = this;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      const { surname, prop, order } = ctx.query;
      const where = { surname };

      // 过滤无用条件
      Object.keys(where).forEach(k => {
        if (where[k] === undefined || where[k] === '' || !where[k]) {
          delete where[k];
        }
      });
      let Order = [ 'surname' ];
      if (order && prop) {
        Order = [[ `${prop}`, `${order}` ]];
      }
      const findAdParams = {
        where,
        order: Order,
        offset,
        limit,
      };
      const result = await ctx.model.models.syncUser.findAndCountAll(findAdParams);
      ctx.success(result);
    }
  };
};
