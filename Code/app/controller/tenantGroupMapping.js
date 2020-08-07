'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { tenantId, groupId, createdAt, updatedAt, prop, order } = ctx.query;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      let Order = [[ 'tenantId', 'DESC' ]];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      try {
        const res = await ctx.model.models.tenant_group_mapping.findAndCountAll({
          where: Object.assign(
            {},
            tenantId ? { tenantId } : undefined,
            groupId ? { ad_groupId: groupId } : undefined,
            createdAt ? { createdAt: { [Op.and]: [{ [Op.gte]: new Date(createdAt) }, { [Op.lt]: new Date(new Date(createdAt) - (-8.64e7)) }] } } : undefined,
            updatedAt ? { updatedAt: { [Op.and]: [{ [Op.gte]: new Date(updatedAt) }, { [Op.lt]: new Date(new Date(updatedAt) - (-8.64e7)) }] } } : undefined
          ),
          include: [
            {
              model: ctx.model.models.tenant,
              as: 'tenant',
            },
            {
              model: ctx.model.models.ad_group,
              as: 'ad_group',
            },
          ],
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
    async handledList() {
      const { ctx } = this;
      const rawList = await ctx.model.models.tenant_group_mapping.findAll({
        include: [
          {
            model: ctx.model.models.tenant,
            as: 'tenant',
          },
          {
            model: ctx.model.models.ad_group,
            as: 'ad_group',
          },
        ],
      });
      const list = [];
      rawList.forEach(el => {
        list.push({ id: el.id, name: el.tenant.name + ' + ' + el.ad_group.name });
      });
      ctx.success(list);
    }
    async detail() {
      const { ctx } = this;
      const { id } = ctx.query;
      const result = await ctx.model.models.tenant_group_mapping.findOne({
        where: {
          id,
        },
        include: [
          {
            model: ctx.model.models.tenant,
            as: 'tenant',
          },
          {
            model: ctx.model.models.ad_group,
            as: 'ad_group',
          },
        ],
      });
      ctx.success(result);
    }
    async update() {
      const { ctx } = this;
      const { id } = ctx.query;
      const { tenantId, groupId } = ctx.request.body;
      if (!id || !tenantId || !groupId) ctx.error();
      const oldModel = await ctx.model.models.tenant_group_mapping.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = {
        tenantId,
        ad_groupId: groupId,
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
      const { tenantId, groupId } = ctx.request.body;
      if (!tenantId || !groupId) {
        ctx.error();
      }
      const model = {
        tenantId,
        ad_groupId: groupId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      try {
        await ctx.model.models.tenant_group_mapping.create(model);
        ctx.success();
      } catch (error) {
        throw { status: 500, message: 'service busy' };
      }
    }
    async delete() {
      const { ctx } = this;
      const { id } = ctx.query;
      if (!id) ctx.error();
      const entity = await ctx.model.models.tenant_group_mapping.findByPk(id);
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
        await ctx.model.models.tenant_group_mapping.destroy({
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
    async checkExist() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { id, tenantId, groupId } = ctx.query;
      const count = await ctx.model.models.tenant_group_mapping.count({
        where: {
          id: { [Op.ne]: id },
          tenantId,
          ad_groupId: groupId,
        },
      });
      ctx.success(count);
    }
  };
};