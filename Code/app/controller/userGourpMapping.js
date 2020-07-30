'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { groupId, userId, prop, order } = ctx.query;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      let Order = [ 'groupId', 'desc' ];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      try {
        const res = await ctx.model.models.user_group_mapping.findAndCountAll({
          where: Object.assign(
            {},
            groupId ? { groupId } : undefined,
            userId ? { userId } : undefined
          ),
          order: Order,
          offset,
          limit,
        });
        ctx.success(res);
      } catch (error) {
        console.log('error==========================error');
        console.log(error);
        console.log('error==========================error');
        ctx.error();
      }
    }
    async detail() {
      const { ctx } = this;
      const { id } = ctx.query;
      const result = await ctx.model.models.user_group_mapping.findOne({
        raw: true,
        where: {
          id,
        },
      });
      ctx.success(result);
    }
    async update() {
      const { ctx } = this;
      const { id } = ctx.query;
      const { groupId, userId } = ctx.request.body;
      if (!id || !groupId || !userId) ctx.error();
      const oldModel = await ctx.model.models.user_group_mapping.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = {
        groupId,
        userId,
        updatedAt: new Date(),
      };
      try {
        await oldModel.update(newModel);
        ctx.success();
      } catch (error) {
        console.log('error==========================error');
        console.log(error);
        console.log('error==========================error');
        ctx.error('service busy');
      }
    }
    async create() {
      const { ctx } = this;
      const { groupId, userId } = ctx.request.body;
      if (!groupId || userId) {
        ctx.error();
      }
      const model = {
        groupId,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      try {
        await ctx.model.models.user_group_mapping.create(model);
        ctx.success();
      } catch (error) {
        throw { status: 500, message: 'service busy' };
      }
    }
    async delete() {
      const { ctx } = this;
      const { id } = ctx.query;
      if (!id) ctx.error();
      const entity = await ctx.model.models.user_group_mapping.findByPk(id);
      if (!entity) ctx.error;
      try {
        await entity.destroy(id);
        ctx.success();
      } catch (error) {
        console.log('error==========================error');
        console.log(error);
        console.log('error==========================error');
        ctx.error('service busy');
      }
    }
    async deleteMany() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { idList } = ctx.request.body;
      if (!idList || !idList.length) ctx.error();
      try {
        await ctx.model.models.user_group_mapping.destroy({
          where: {
            id: { [Op.in]: idList },
          },
        });
        ctx.success();
      } catch (error) {
        console.log('error==========================error');
        console.log(error);
        console.log('error==========================error');
        ctx.error('service busy');
      }
    }
  };
};
