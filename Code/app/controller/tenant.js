'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { name, code, manager_group_id, supporter_group_id, group_id,
        justification, budget_type, project_owner,
        contact_person, project_estimation, methodology_text,
        createdAt, updatedAt, prop, order } = ctx.query;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      let Order = [[ 'createdAt', 'desc' ]];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      try {
        const res = await ctx.model.models.tenant.findAndCountAll({
          where: Object.assign(
            {},
            name ? { name: { [Op.like]: `%${name}%` } } : undefined,
            code ? { code: { [Op.like]: `%${code}%` } } : undefined,
            manager_group_id ? { manager_group_id } : undefined,
            supporter_group_id ? { supporter_group_id } : undefined,
            group_id ? { group_id } : undefined,
            justification ? { justification } : justification,
            budget_type ? { budget_type } : budget_type,
            project_owner ? { project_owner } : project_owner,
            contact_person ? { contact_person } : contact_person,
            project_estimation ? { project_estimation } : project_estimation,
            methodology_text ? { methodology_text } : methodology_text,
            createdAt ? { createdAt: { [Op.and]: [{ [Op.gte]: new Date(createdAt) }, { [Op.lt]: new Date(new Date(createdAt) - (-8.64e7)) }] } } : undefined,
            updatedAt ? { updatedAt: { [Op.and]: [{ [Op.gte]: new Date(updatedAt) }, { [Op.lt]: new Date(new Date(updatedAt) - (-8.64e7)) }] } } : undefined
          ),
          include: [
            {
              model: ctx.model.models.ad_group,
              as: 'manager_group',
              required: true,
            },
            {
              model: ctx.model.models.ad_group,
              as: 'supporter_group',
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
      const result = await ctx.model.models.tenant.findOne({
        where: {
          id,
        },
        include: [
          {
            model: ctx.model.models.ad_group,
            as: 'manager_group',
            required: true,
          },
          {
            model: ctx.model.models.ad_group,
            as: 'supporter_group',
            required: true,
          },
          {
            model: ctx.model.models.group,
            as: 'group',
            required: true,
          },
        ],
      });
      ctx.success(result);
    }

    async create() {
      const { ctx } = this;
      const {
        name, code, manager_group_id, supporter_group_id, group_id,
        justification, budget_type, project_owner,
        contact_person, project_estimation,
        methodology_text } = ctx.request.body;
      if (!name || !code || !manager_group_id || !supporter_group_id || !group_id ||
        !justification || !budget_type || !project_owner ||
        !contact_person || !project_estimation ||
        !methodology_text) ctx.error();
      const existNum = await ctx.model.models.tenant.count({
        where: {
          code,
        },
      });
      if (existNum > 0) ctx.error();
      const model = {
        name,
        code,
        manager_group_id,
        supporter_group_id,
        group_id,
        justification,
        budget_type,
        project_owner,
        contact_person,
        project_estimation,
        methodology_text,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      try {
        await ctx.model.models.tenant.create(model);
        ctx.success();
      } catch (error) {
        console.log('error ================================== error');
        console.log(error.message);
        console.log('error ================================== error');
        throw { status: 500, message: 'service busy' };
      }
    }

    async update() {
      const { ctx } = this;
      const { id } = ctx.query;
      const {
        name, manager_group_id, supporter_group_id, group_id,
        justification, budget_type,
        project_owner, contact_person, project_estimation,
        methodology_text } = ctx.request.body;
      if (!id || !name || !manager_group_id || !supporter_group_id || !group_id ||
        !justification || !budget_type ||
        !project_owner || !contact_person || !project_estimation ||
        !methodology_text) ctx.error();
      const oldModel = await ctx.model.models.tenant.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = {
        name,
        manager_group_id,
        supporter_group_id,
        group_id,
        justification,
        budget_type,
        project_owner,
        contact_person,
        project_estimation,
        methodology_text,
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

    async deleteMany() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { idList } = ctx.request.body;
      if (!idList || !idList.length) ctx.error();
      try {
        await ctx.model.models.tenant.destroy({
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
      const { id, code } = ctx.query;
      const count = await ctx.model.models.tenant.count({
        where: {
          code,
          id: { [Op.ne]: id },
        },
      });
      ctx.success(count);
    }
  };
};
