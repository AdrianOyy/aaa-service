'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      const { name, createdAt, updatedAt, prop, order } = ctx.query;
      let Order = [[ 'createdAt', 'DESC' ]];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      const findAdParams = {
        where: Object.assign(
          {},
          name ? { name: { [Op.like]: `%${name}%` } } : undefined,
          createdAt ? { createdAt: { [Op.and]: [{ [Op.gte]: new Date(createdAt) }, { [Op.lt]: new Date(new Date(createdAt) - (-8.64e7)) }] } } : undefined,
          updatedAt ? { updatedAt: { [Op.and]: [{ [Op.gte]: new Date(updatedAt) }, { [Op.lt]: new Date(new Date(updatedAt) - (-8.64e7)) }] } } : undefined
        ),
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

    async create() {
      const { ctx } = this;
      const { name } = ctx.request.body;
      if (!name) ctx.error();
      let group = {
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      try {
        group = await ctx.model.models.ad_group.create(group);
        ctx.service.syncActiviti.saveOrUpdateGroup({ id: group.dataValues.id, cn: group.name }, { headers: ctx.headers });
        ctx.success();
      } catch (error) {
        throw { status: 500, message: 'service busy' };
      }
    }

    async update() {
      const { ctx } = this;
      const { id } = ctx.query;
      const { name } = ctx.request.body;
      if (!id || !name) ctx.error();
      const oldModel = await ctx.model.models.ad_group.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = {
        name,
        updatedAt: new Date(),
      };
      try {
        await oldModel.update(newModel);
        ctx.service.syncActiviti.saveOrUpdateGroup({ id: oldModel.dataValues.id, cn: name }, { headers: ctx.headers });
        ctx.success();
      } catch (error) {
        console.log('error==========================error');
        console.log(error.message);
        console.log('error==========================error');
        ctx.error('service busy');
      }
    }

    async delete() {
      const { ctx } = this;
      const { id } = ctx.query;
      if (!id) ctx.error();
      const entity = await ctx.model.models.ad_group.findByPk(id);
      if (!entity) ctx.error;
      try {
        await entity.destroy(id);
        ctx.success();
      } catch (error) {
        console.log('error==========================error');
        console.log(error.message);
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
        await ctx.model.transaction(async t => {
          await ctx.model.models.ad_group.destroy({
            where: {
              id: { [Op.in]: idList },
            },
          }, { transaction: t });
          await ctx.model.models.tenant_group_mapping.destroy({
            where: {
              ad_groupId: { [Op.in]: idList },
            },
          }, { transaction: t });
          await ctx.model.models.user_group_mapping.destroy({
            where: {
              groupId: { [Op.in]: idList },
            },
          }, { transaction: t });
        });

        ctx.service.syncActiviti.deleteGroup(idList.join(','), ctx.headers);
        ctx.success();
      } catch (error) {
        console.log('error==========================error');
        console.log(error.message);
        console.log('error==========================error');
        ctx.error('service busy');
      }
    }

    async checkName() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { id, name } = ctx.query;
      const count = await ctx.model.models.ad_group.count({
        where: {
          name,
          id: { [Op.ne]: id },
        },
      });
      ctx.success(count);
    }
  };
};
