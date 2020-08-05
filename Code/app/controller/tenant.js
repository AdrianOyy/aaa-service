'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { name, createdAt, updatedAt, prop, order } = ctx.query;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      let Order = [[ 'createdAt', 'desc' ]];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      try {
        const res = await ctx.model.models.tenant.findAndCountAll({
          where: Object.assign(
            {},
            name ? { name: { [Op.like]: `%${name}%` } } : undefined,
            createdAt ? { createdAt: { [Op.and]: [{ [Op.gte]: new Date(createdAt) }, { [Op.lt]: new Date(new Date(createdAt) - (-8.64e7)) }] } } : undefined,
            updatedAt ? { updatedAt: { [Op.and]: [{ [Op.gte]: new Date(updatedAt) }, { [Op.lt]: new Date(new Date(updatedAt) - (-8.64e7)) }] } } : undefined
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
      const result = await ctx.model.models.tenant.findOne({
        raw: true,
        where: {
          id,
        },
      });
      ctx.success(result);
    }
    async create() {
      const { ctx } = this;
      const { name } = ctx.request.body;
      if (!name) ctx.error();
      const existNum = await ctx.model.models.tenant.count({
        where: {
          name,
        },
      });
      if (existNum > 0) ctx.error();
      const model = {
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      try {
        await ctx.model.models.tenant.create(model);
        ctx.success();
      } catch (error) {
        throw { status: 500, message: 'service busy' };
      }
    }
    async update() {
      const { ctx } = this;
      const { id } = ctx.query;
      const { Op } = app.Sequelize;
      const { name } = ctx.request.body;
      if (!id || !name) ctx.error();
      const existNum = await ctx.model.models.tenant.count({
        where: {
          id: { [Op.ne]: id },
          name,
        },
      });
      if (existNum > 0) ctx.error();
      const oldModel = await ctx.model.models.tenant.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = {
        name,
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
    async deleteMany() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { idList } = ctx.request.body;
      if (!idList || !idList.length) ctx.error();
      try {
        await ctx.model.models.tenant.destroy({
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
    async checkName() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { id, name } = ctx.query;
      const count = await ctx.model.models.tenant.count({
        where: {
          name,
          id: { [Op.ne]: id },
        },
      });
      ctx.success(count);
    }
  };
};
