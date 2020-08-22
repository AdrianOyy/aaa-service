'use strict';

module.exports = app => {
  return class extends app.Controller {

    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      const { surname, prop, order } = ctx.query;
      const where = Object.assign(
        {},
        surname ? { surname: { [Op.like]: `%${surname}%` } } : undefined
      );

      // 过滤无用条件
      Object.keys(where).forEach(k => {
        if (where[k] === undefined || where[k] === '' || !where[k]) {
          delete where[k];
        }
      });
      let Order = [[ 'surname', 'DESC' ]];
      if (order && prop) {
        Order = [[ `${prop}`, `${order}` ]];
      }
      const findAdParams = {
        where,
        order: Order,
        offset,
        limit,
      };
      const result = await ctx.model.models.user.findAndCountAll(findAdParams);
      ctx.success(result);
    }

    async detail() {
      const { ctx } = this;
      const { id } = ctx.query;
      const result = await ctx.model.models.user.findOne({
        raw: true,
        where: {
          id,
        },
      });
      ctx.success(result);
    }

    async login() {
      const { ctx } = this;
      const { username, password } = ctx.request.body;
      const auth = await ctx.service.adService.authenticate(username, password);
      if (auth) {
        const user = await ctx.service.user.loadUser(auth);
        if (user) {
          const groupList = [];
          // const userGroup = await ctx.model.models.user_group_mapping.findAll({ where: { userId: user.id } });
          for (const ug of user.groups) {
            groupList.push(ug.id.toString());
          }
          user.groupList = groupList;
          user.groups = auth.groups;
          auth.user = user;
        }
        ctx.success(auth);
      } else {
        ctx.success(auth);
      }
    }
  };
};
