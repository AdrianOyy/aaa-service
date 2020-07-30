'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { tanent_group_mapping_id, roleId, prop, order } = ctx.query;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      let Order = [ 'tanent_group_mapping_id', 'desc' ];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      try {
        const res = await ctx.model.models.assign.findAndCountAll({
          where: Object.assign(
            {},
            tanent_group_mapping_id ? { tanent_group_mapping_id } : undefined,
            roleId ? { roleId } : undefined
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
      const result = await ctx.model.models.assign.findOne({
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
      const { tanent_group_mapping_id, roleId } = ctx.request.body;
      if (!id || tanent_group_mapping_id || roleId) ctx.error();
      const oldModel = await ctx.model.models.assign.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = {
        tanent_group_mapping_id,
        roleId,
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
      const { tanent_group_mapping_id, roleId } = ctx.request.body;
      if (tanent_group_mapping_id || roleId) {
        ctx.error();
      }
      const model = {
        tanent_group_mapping_id,
        roleId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      try {
        await ctx.model.models.assign.create(model);
        ctx.success();
      } catch (error) {
        throw { status: 500, message: 'service busy' };
      }
    }
    async delete() {
      const { ctx } = this;
      const { id } = ctx.query;
      if (!id) ctx.error();
      const entity = await ctx.model.models.assign.findByPk(id);
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
        await ctx.model.models.assign.destroy({
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
