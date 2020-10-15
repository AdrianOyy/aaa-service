'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { tenantId, groupId, roleId, userId,
        expiryDate, prop, order, createdAt, updatedAt } = ctx.query;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      let Order = [[ 'assignId', 'DESC' ]];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      try {
        const res = await ctx.model.models.expiry.findAndCountAll({
          where: Object.assign(
            {},
            expiryDate ? { expiryDate: { [Op.and]: [{ [Op.gte]: new Date(expiryDate) }, { [Op.lt]: new Date(new Date(expiryDate) - (-8.64e7)) }] } } : undefined,
            createdAt ? { createdAt: { [Op.and]: [{ [Op.gte]: new Date(createdAt) }, { [Op.lt]: new Date(new Date(createdAt) - (-8.64e7)) }] } } : undefined,
            updatedAt ? { updatedAt: { [Op.and]: [{ [Op.gte]: new Date(updatedAt) }, { [Op.lt]: new Date(new Date(updatedAt) - (-8.64e7)) }] } } : undefined
          ),
          include: [
            {
              model: ctx.model.models.assign,
              as: 'assign',
              include: [
                {
                  model: ctx.model.models.tenant_group_mapping,
                  as: 'tenant_group_mapping',
                  include: [
                    {
                      model: ctx.model.models.tenant,
                      as: 'tenant',
                      where: Object.assign(
                        {},
                        tenantId ? { id: tenantId } : undefined
                      ),
                      required: true,
                    },
                    {
                      model: ctx.model.models.ad_group,
                      as: 'ad_group',
                      where: Object.assign(
                        {},
                        groupId ? { id: groupId } : undefined
                      ),
                      required: true,
                    },
                  ],
                  required: true,
                },
                {
                  model: ctx.model.models.role,
                  as: 'role',
                  where: Object.assign(
                    {},
                    roleId ? { id: roleId } : undefined
                  ),
                  required: true,
                },
              ],
              required: true,
            },
            {
              model: ctx.model.models.user,
              as: 'user',
              where: Object.assign(
                {},
                userId ? { id: userId } : undefined
              ),
              required: true,
            },
          ],
          order: Order,
          offset,
          limit,
        });
        ctx.success(res);
      } catch (error) {
        console.log('error==========================error');
        console.log(error.message);
        console.log('error==========================error');
        ctx.error();
      }
    }
    async detail() {
      const { ctx } = this;
      const { id } = ctx.query;
      const result = await ctx.model.models.expiry.findOne({
        where: {
          id,
        },
        include: [
          {
            model: ctx.model.models.assign,
            as: 'assign',
            include: [
              {
                model: ctx.model.models.tenant_group_mapping,
                as: 'tenant_group_mapping',
                include: [
                  {
                    model: ctx.model.models.tenant,
                    as: 'tenant',
                    required: true,
                  },
                  {
                    model: ctx.model.models.ad_group,
                    as: 'ad_group',
                    required: true,
                  },
                ],
                required: true,
              },
              {
                model: ctx.model.models.role,
                as: 'role',
                required: true,
              },
            ],
            required: true,
          },
          {
            model: ctx.model.models.user,
            as: 'user',
            required: true,
          },
        ],
      });
      ctx.success(result);
    }
    async update() {
      const { ctx } = this;
      const { id } = ctx.query;
      const { assignId, roleId } = ctx.request.body;
      if (!id || assignId || roleId) ctx.error();
      const oldModel = await ctx.model.models.expiry.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = {
        assignId,
        roleId,
        updatedAt: new Date(),
      };
      try {
        await oldModel.update(newModel);
        ctx.success();
      } catch (error) {
        console.log('error==========================error');
        console.log(error.message);
        console.log('error==========================error');
        ctx.error('service busy');
      }
    }
    async create() {
      const { ctx } = this;
      const { assignId, userId, expiryDate } = ctx.request.body;
      if (!assignId || !userId || !expiryDate) {
        ctx.error();
      }
      const model = {
        assignId,
        userId,
        expiryDate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      try {
        await ctx.model.models.expiry.create(model);
        ctx.success();
      } catch (error) {
        throw { status: 500, message: 'service busy' };
      }
    }
    async delete() {
      const { ctx } = this;
      const { id } = ctx.query;
      if (!id) ctx.error();
      const entity = await ctx.model.models.expiry.findByPk(id);
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
        await ctx.model.models.expiry.destroy({
          where: {
            id: { [Op.in]: idList },
          },
        });
        ctx.success();
      } catch (error) {
        console.log('error==========================error');
        console.log(error.message);
        console.log('error==========================error');
        ctx.error('service busy');
      }
    }
    async checkExist() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { id, assignId, userId } = ctx.query;
      const count = await ctx.model.models.expiry.count({
        where: {
          id: { [Op.ne]: id },
          assignId,
          userId,
        },
      });
      ctx.success(count);
    }
  };
};
