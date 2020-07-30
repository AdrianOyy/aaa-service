'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { project, managerADGroup, supporter, resourcesQuota, startDate, endDate } = ctx.query;
      try {
        const res = await ctx.model.models.management.findAndCountAll({
          where: Object.assign(
            {},
            project ? { project: { [Op.like]: `%${project}%` } } : undefined,
            managerADGroup ? { managerADGroup: { [Op.like]: `%${managerADGroup}%` } } : undefined,
            supporter ? { supporter: { [Op.like]: `%${supporter}%` } } : undefined,
            resourcesQuota ? { resourcesQuota: { [Op.like]: `%${resourcesQuota}%` } } : undefined,
            startDate ? { createdAt: { [Op.gte]: startDate } } : undefined,
            endDate ? { createdAt: { [Op.lte]: endDate } } : undefined
          ),
        });
        ctx.success(res);
      } catch (error) {
        console.log('error==========================error');
        console.log(error);
        console.log('error==========================error');
        ctx.error();
      }
    }
    async create() {
      const { ctx } = this;
      const { project, managerADGroup, supporter, resourcesQuota } = ctx.request.body;
      if (!project || !managerADGroup) {
        ctx.error();
      }
      const model = {
        project,
        managerADGroup,
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
    async update() {
      const { ctx } = this;
      const { id } = ctx.query;
      const { project, managerADGroup, supporter, resourcesQuota } = ctx.request.body;
      if (!id || !project || !managerADGroup) ctx.error();
      const oldModel = await ctx.model.models.management.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = {
        project,
        managerADGroup,
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
