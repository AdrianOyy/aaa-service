'use strict';

module.exports = app => {
  return class extends app.Controller {

    async list() {
      const { ctx } = this;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      const { project, prop, order } = ctx.query;
      const where = { project };

      // 过滤无用条件
      Object.keys(where).forEach(k => {
        if (where[k] === undefined || where[k] === '' || !where[k]) {
          delete where[k];
        }
      });
      let Order = [ 'project' ];
      if (order && prop) {
        Order = [[ `${prop}`, `${order}` ]];
      }
      const findAdParams = {
        where,
        order: Order,
        offset,
        limit,
      };
      const result = await ctx.model.models.tenants.findAndCountAll(findAdParams);
      ctx.success(result);
    }

    async create() {
      const { ctx } = this;
      const { project, ADGroup, right } = ctx.request.body;
      if (!project || !ADGroup || !right) {
        ctx.error();
      }
      const model = {
        project,
        ADGroup,
        right,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      try {
        await ctx.model.models.tenants.create(model);
        ctx.success();
      } catch (error) {
        throw { status: 500, message: 'service busy' };
      }
    }
    async update() {
      const { ctx } = this;
      const { id, project, ADGroup, right } = ctx.request.body;
      if (!id || !project || !ADGroup || !right) {
        ctx.error();
      }
      const oldModel = await ctx.model.models.tenants.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = {
        project,
        ADGroup,
        right,
        updatedAt: new Date(),
      };
      try {
        await oldModel.update(newModel);
        ctx.success();
      } catch (error) {
        console.log('error==========================error');
        console.log(error);
        console.log('error==========================error');
        ctx.error('tenants update busy');
      }
    }
    async delete() {
      const { ctx } = this;
      const { id } = ctx.query;
      if (!id) ctx.error();
      const entity = await ctx.model.models.tenants.findByPk(id);
      if (!entity) ctx.error;
      try {
        await entity.destroy(id);
        ctx.success();
      } catch (error) {
        console.log('error==========================error');
        console.log(error);
        console.log('error==========================error');
        ctx.error('tenants delete busy');
      }
    }
    async deleteMany() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { idList } = ctx.request.body;
      if (!idList || !idList.length) ctx.error();
      try {
        await ctx.model.models.tenants.destroy({
          where: {
            id: { [Op.in]: idList },
          },
        });
        ctx.success();
      } catch (error) {
        console.log('error==========================error');
        console.log(error);
        console.log('error==========================error');
        ctx.error('tenants deleteMany busy');
      }
    }

  };
};
