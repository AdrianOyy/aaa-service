'use strict';
const { isInt } = require('../utils/regexp');

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { tenantId, type, year, createdAt, updatedAt, prop, order } = ctx.query;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      let Order = [[ 'createdAt', 'DESC' ]];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      try {
        const res = await ctx.model.models.tenant_quota_mapping.findAndCountAll({
          where: Object.assign(
            {},
            tenantId ? { tenantId } : undefined,
            type ? { type: { [Op.like]: `%${type}%` } } : undefined,
            year ? { year } : undefined,
            createdAt ? { createdAt: { [Op.and]: [{ [Op.gte]: new Date(createdAt) }, { [Op.lt]: new Date(new Date(createdAt) - (-8.64e7)) }] } } : undefined,
            updatedAt ? { updatedAt: { [Op.and]: [{ [Op.gte]: new Date(updatedAt) }, { [Op.lt]: new Date(new Date(updatedAt) - (-8.64e7)) }] } } : undefined
          ),
          include: [
            {
              model: ctx.model.models.tenant,
              as: 'tenant',
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
      const result = await ctx.model.models.tenant_quota_mapping.findOne({
        where: {
          id,
        },
        include: [
          {
            model: ctx.model.models.tenant,
            as: 'tenant',
          },
        ],
      });
      ctx.success(result);
    }

    async update() {
      const { ctx } = this;
      const { id } = ctx.query;
      const { type, quota, year } = ctx.request.body;
      if (!id || !type || !quota || !year) ctx.error();
      const oldModel = await ctx.model.models.tenant_quota_mapping.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = {
        type,
        quota,
        year: new Date(year).getFullYear(),
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
      const { tenantId, type, quota, year } = ctx.request.body;
      if (!tenantId || !type || !quota || !year) ctx.error();
      const model = {
        tenantId,
        type,
        quota,
        year: new Date(year).getFullYear(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      try {
        await ctx.model.models.tenant_quota_mapping.create(model);
        ctx.success();
      } catch (error) {
        throw { status: 500, message: 'service busy' };
      }
    }

    async delete() {
      const { ctx } = this;
      const { id } = ctx.query;
      if (!id) ctx.error();
      const entity = await ctx.model.models.tenant_quota_mapping.findByPk(id);
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
        await ctx.model.models.tenant_quota_mapping.destroy({
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

    async checkTypeExist() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { id, tenantId, type } = ctx.query;
      const count = await ctx.model.models.tenant_quota_mapping.count({
        where: {
          id: { [Op.ne]: id },
          tenantId,
          type,
        },
      });
      ctx.success(count);
    }

    async checkYearExist() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { id, tenantId, year } = ctx.query;
      const count = await ctx.model.models.tenant_quota_mapping.count({
        where: {
          id: { [Op.ne]: id },
          tenantId,
          year: new Date(year).getFullYear(),
        },
      });
      ctx.success(count);
    }

    async checkRequest() {
      const { ctx } = this;
      const { tenantId, type, quota } = ctx.query;
      if (!tenantId || !type || !quota) ctx.error();
      let res = true;
      const mappingList = await ctx.model.models.tenant_quota_mapping.findAll({
        where: {
          tenantId,
          year: new Date().getFullYear(),
        },
      });
      if (!mappingList || !mappingList.length) res = false;
      else {
        mappingList.forEach(el => {
          if (el.type === type && el.quota < quota) res = false;
        });
      }
      ctx.success({ pass: res });
    }

    async quotaDeduction() {
      const { ctx } = this;
      const { type, number, year, tenantId } = ctx.request.body;
      if (!type || !number || !year || !tenantId) {
        ctx.error();
        return;
      }
      if (!isInt(number)) {
        ctx.error('Bad params "Number"');
        return;
      }
      if (!isInt(year)) {
        ctx.error('Bad params "Year"');
        return;
      }
      if (!isInt(tenantId)) {
        ctx.error('Bad Params "Tenant Id"');
        return;
      }
      const transaction = await this.ctx.model.transaction();
      try {
        const oldModel = await ctx.model.models.tenant_quota_mapping.findOne({
          where: {
            type,
            year,
            tenantId,
          },
        });
        if (!oldModel) throw new Error('Can not find data');
        const { quota } = oldModel;
        if (!quota || parseInt(quota) < parseInt(number)) throw new Error('request number is greater than quota');
        await oldModel.update({ quota: quota - number }, { transaction });
      } catch (error) {
        await transaction.rollback();
        ctx.error(error.message);
      }


    }
  };
};
