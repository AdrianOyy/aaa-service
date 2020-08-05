'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { tenantId, ad_groupId, supporter, resourcesQuota, startDate, endDate, prop, order } = ctx.query;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      let Order = [[ 'tenantId', 'DESC' ]];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      try {
        const res = await ctx.model.models.management.findAndCountAll({
          where: Object.assign(
            {},
            tenantId ? { tenantId } : undefined,
            ad_groupId ? { ad_groupId } : undefined,
            supporter ? { supporter: { [Op.like]: `%${supporter}%` } } : undefined,
            resourcesQuota ? { resourcesQuota: { [Op.like]: `%${resourcesQuota}%` } } : undefined,
            startDate ? { createdAt: { [Op.gte]: startDate } } : undefined,
            endDate ? { createdAt: { [Op.lte]: endDate } } : undefined
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
      const result = await ctx.model.models.management.findOne({
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
      const { tenantId, ad_groupId, supporter, resourcesQuota } = ctx.request.body;
      if (!id || !tenantId || !ad_groupId) ctx.error();
      const oldModel = await ctx.model.models.management.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = {
        tenantId,
        ad_groupId,
        supporter,
        resourcesQuota,
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
      const { tenantId, ad_groupId, supporter, resourcesQuota } = ctx.request.body;
      if (!tenantId || !ad_groupId) {
        ctx.error();
      }
      const model = {
        tenantId,
        ad_groupId,
        supporter,
        resourcesQuota,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      try {
        await ctx.model.models.management.create(model);
        ctx.success();
      } catch (error) {
        throw { status: 500, message: 'service busy' };
      }
    }
    async delete() {
      const { ctx } = this;
      const { id } = ctx.query;
      if (!id) ctx.error();
      const entity = await ctx.model.models.management.findByPk(id);
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
        await ctx.model.models.management.destroy({
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
