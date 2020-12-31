'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { tenantId, groupId, roleId, prop, order } = ctx.query;
      let { createdAt, updatedAt } = ctx.query;
      createdAt = ctx.service.common.getDateRangeCondition(createdAt);
      updatedAt = ctx.service.common.getDateRangeCondition(updatedAt);
      if (createdAt === false || updatedAt === false) {
        ctx.error();
        return;
      }
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      let Order = [[ 'createdAt', 'DESC' ]];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      try {
        const res = await ctx.model.models.assign.findAndCountAll({
          where: Object.assign(
            {},
            roleId ? { roleId } : undefined,
            createdAt ? { createdAt } : undefined,
            updatedAt ? { updatedAt } : undefined
          ),
          include: [
            {
              model: ctx.model.models.tenant_group_mapping,
              as: 'tenant_group_mapping',
              where: Object.assign(
                {},
                tenantId ? { tenantId } : undefined,
                groupId ? { ad_groupId: groupId } : undefined
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
            },
            {
              model: ctx.model.models.role,
              as: 'role',
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
    async handledList() {
      const { ctx } = this;
      try {
        const rawList = await ctx.model.models.assign.findAll({
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
        });
        const res = [];
        rawList.forEach(el => {
          const model = {
            id: el.id,
            value: el.tenant_group_mapping.tenant.name
              + ' + '
              + el.tenant_group_mapping.ad_group.name
              + ' + '
              + el.role.label,
          };
          res.push(model);
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
      const result = await ctx.model.models.assign.findOne({
        where: {
          id,
        },
        include: [
          {
            model: ctx.model.models.tenant_group_mapping,
            as: 'tenant_group_mapping',
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
          },
          {
            model: ctx.model.models.role,
            as: 'role',
          },
        ],
      });
      ctx.success(result);
    }
    async update() {
      const { ctx } = this;
      const { id } = ctx.query;
      const { roleId } = ctx.request.body;
      if (!id || !roleId) ctx.error();
      const oldModel = await ctx.model.models.assign.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = {
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
      const { mappingId, roleId } = ctx.request.body;
      if (!mappingId || !roleId) {
        ctx.error();
      }
      const count = await ctx.model.models.assign.count({
        where: {
          tenant_group_mappingId: mappingId,
        },
      });
      if (count) ctx.error();
      const model = {
        tenant_group_mappingId: mappingId,
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
        await ctx.model.models.assign.destroy({
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
      const { id, mappingId } = ctx.query;
      const count = await ctx.model.models.assign.count({
        where: {
          id: { [Op.ne]: id },
          tenant_group_mappingId: mappingId,
        },
      });
      ctx.success(count);
    }
  };
};
