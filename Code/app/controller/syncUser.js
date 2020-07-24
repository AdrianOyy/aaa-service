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

    async detail() {
      const { ctx } = this;
      const { id } = ctx.query;
      const result = await ctx.model.models.syncUser.findOne({
        raw: true,
        where: {
          id,
        },
      });
      ctx.success(result);
    }

    async sync() {
      const { ctx } = this;
      const flag = await ctx.service.syncUser.authenticate('qiwei', 'APJ.com123');
      console.log('authenticate true', flag === true);
      // flag = await ctx.service.syncUser.authenticate('qiwei', 'APJ.com123123');
      // console.log('authenticate false', flag === false);
      const group = await ctx.service.syncUser.findGroup('IT');
      console.log('findGroup', group.cn);
      const groups = await ctx.service.syncUser.findGroups();
      console.log('findGroups', groups.length);
      const user = await ctx.service.syncUser.findUser('qiwei');
      console.log('findUser', user.cn);
      const users = await ctx.service.syncUser.findUsers();
      console.log('findUsers', users.length);
      ctx.success();
    }
  };
};
