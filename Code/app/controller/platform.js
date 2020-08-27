'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { name, typeId, prop, order, createdAt, updatedAt } = ctx.query;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      let Order = [[ 'createdAt', 'desc' ]];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      try {
        const res = await ctx.model.models.vm_platform.findAndCountAll({
          where: Object.assign(
            {},
            name ? { name: { [Op.like]: `%${name}%` } } : undefined,
            typeId ? { typeId } : undefined,
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
      const result = await ctx.model.models.vm_platform.findOne({
        raw: true,
        where: {
          id,
        },
        include: [
          {
            model: ctx.model.models.vm_platform_type,
            as: 'vm_platform_type',
            attributes: [ 'name' ],
          },
        ],
      });
      ctx.success(result);
    }
    async create() {
      const { ctx } = this;
      const { name, typeId } = ctx.request.body;
      if (!name) ctx.error();
      const existNum = await ctx.model.models.vm_platform.count({
        where: {
          name,
        },
      });
      if (existNum > 0) ctx.error();
      const model = {
        name,
        typeId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      try {
        await ctx.model.models.vm_platform.create(model);
        ctx.success();
      } catch (error) {
        throw { status: 500, message: 'service busy' };
      }
    }
    async update() {
      const { ctx } = this;
      const { id } = ctx.query;
      const { Op } = app.Sequelize;
      const { name, typeId } = ctx.request.body;
      if (!id || !name || !typeId) ctx.error();
      const existNum = await ctx.model.models.vm_platform.count({
        where: {
          id: { [Op.ne]: id },
          name,
        },
      });
      if (existNum > 0) ctx.error();
      const oldModel = await ctx.model.models.vm_platform.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = {
        name,
        typeId,
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
        await ctx.model.models.vm_platform.destroy({
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
      const count = await ctx.model.models.vm_platform.count({
        where: {
          name,
          id: { [Op.ne]: id },
        },
      });
      ctx.success(count);
    }
    async listType() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { prop, order, createdAt, updatedAt } = ctx.query;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      let Order = [[ 'createdAt', 'desc' ]];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      try {
        const res = await ctx.model.models.vm_platform_type.findAndCountAll({
          where: Object.assign(
            {},
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
  };
};
