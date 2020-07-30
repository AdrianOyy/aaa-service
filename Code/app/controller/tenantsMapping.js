'use strict';

module.exports = app => {
  return class extends app.Controller {

    async list() {
      const { ctx } = this;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      const { project, prop, order } = ctx.query;
      const whereProject = {};
      if (project) {
        whereProject.name = project;
      }

      let Order = [ 'createdAt' ];
      if (order && prop) {
        Order = [[ `${prop}`, `${order}` ]];
      }
      const findAdParams = {
        order: Order,
        offset,
        limit,
      };
      // 关联子表
      findAdParams.include = [
        {
          attributes: [ 'id', 'name' ],
          model: ctx.model.models.tenant,
          as: 'tenant',
          where: whereProject,
        },
        {
          attributes: [ 'id', 'name' ],
          model: ctx.model.models.ad_group,
          as: 'ad_group',
        },
        {
          attributes: [ 'id', 'value', 'label' ],
          model: ctx.model.models.role,
          as: 'role',
        },
      ];
      const result = await ctx.model.models.tenant_group_mapping.findAndCountAll(findAdParams);
      ctx.success(result);
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
            attributes: [ 'id', 'name' ],
            model: ctx.model.models.tenant,
            as: 'tenant',
          },
          {
            attributes: [ 'id', 'name' ],
            model: ctx.model.models.ad_group,
            as: 'ad_group',
          },
          {
            attributes: [ 'id', 'value', 'label' ],
            model: ctx.model.models.role,
            as: 'role',
          },
        ],
      });

      const roles = await ctx.model.models.role.findAll({
        raw: true,
        attributes: [ 'id', 'label' ],
      });
      ctx.success({ result, roles });
    }

    async create() {
      const { ctx } = this;
      const { tenantId, adGroupId, roleId } = ctx.request.body;
      if (!tenantId || !adGroupId || !roleId) {
        ctx.error();
      }
      const model = {
        tenantId,
        adGroupId,
        roleId,
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
    async update() {
      const { ctx } = this;
      const { id, tenantId, adGroupId, roleId } = ctx.request.body;
      if (!id || !tenantId || !adGroupId || !roleId) {
        ctx.error();
      }
      const oldModel = await ctx.model.models.tenant_group_mapping.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = {
        tenantId,
        adGroupId,
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
        ctx.error('tenant_group_mapping update busy');
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
        ctx.error('tenant_group_mapping delete busy');
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
        ctx.error('tenant_group_mapping deleteMany busy');
      }
    }

  };
};
