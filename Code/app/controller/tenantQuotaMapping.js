'use strict';
const { isInt } = require('../utils/regexp');

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { tenantId, type, year, prop, order } = ctx.query;
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
        const res = await ctx.model.models.tenant_quota_mapping.findAndCountAll({
          where: Object.assign(
            {},
            tenantId ? { tenantId } : undefined,
            type ? { type: { [Op.like]: `%${type}%` } } : undefined,
            year ? { year } : undefined,
            createdAt ? { createdAt } : undefined,
            updatedAt ? { updatedAt } : undefined
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
        // 查询currentQuota
        const resource_request_historys = await ctx.model.models.resource_request_history.findAll({
          raw: true,
          attributes: [ 'tenantQuotaMappingId', 'status' ],
        });
        if (res && res.rows && res.rows.length > 0) {
          res.rows = res.rows.map(tenant_quota_mapping => {
            let currentQuota = 0;
            if (resource_request_historys) {
              const filterPending = resource_request_historys.filter(_ => _.tenantQuotaMappingId === tenant_quota_mapping.dataValues.id && _.status === 'pending');
              const filterSuccess = resource_request_historys.filter(_ => _.tenantQuotaMappingId === tenant_quota_mapping.dataValues.id && _.status === 'success');
              currentQuota = filterPending ? (currentQuota + filterPending.length) : currentQuota;
              currentQuota = filterSuccess ? (currentQuota + filterSuccess.length) : currentQuota;
            }
            tenant_quota_mapping.dataValues.currentQuota = currentQuota;
            return tenant_quota_mapping;
          });
        }
        ctx.success(res);
      } catch (error) {
        ctx.logger.error(error);
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
        year: parseInt(year),
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
      if (!tenantId || !type || !quota || !year) {
        ctx.error();
        return;
      }
      const model = {
        tenantId,
        type,
        quota,
        year: parseInt(year),
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

    async checkExist() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { id, tenantId, year, type } = ctx.query;
      const count = await ctx.model.models.tenant_quota_mapping.count({
        where: {
          id: { [Op.ne]: id },
          tenantId,
          type,
          year: parseInt(year),
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
      const { types, year, tenantId, workflowId } = ctx.request.body;
      const transaction = await this.ctx.model.transaction();
      try {
        await ctx.model.models.resource_request_history.destroy({
          where: {
            workflowId,
            status: 'pending',
          },
        }, { transaction });
        for (let index = 0; index < types.length; index++) {
          const element = types[index];
          const typeAndNumber = element.split(',');
          const type = typeAndNumber[0];
          const requestNum = typeAndNumber[1];
          const tenant_quota_mapping = await ctx.model.models.tenant_quota_mapping.findOne({
            where: {
              type,
              year,
              tenantId,
            },
            raw: true,
          }, { transaction });
          if (!tenant_quota_mapping) throw new Error('Can not find tenant_quota_mapping type: ' + type + ', year: ' + year + ', tenantId: ' + tenantId);
          const resource_request_history = {
            workflowId,
            tenantQuotaMappingId: tenant_quota_mapping.id,
            status: 'success',
            requestNum,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          await ctx.model.models.resource_request_history.create(resource_request_history, { transaction });
        }
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        console.log(error.message);
      }
      ctx.success();
    }

    async deleteHistory() {
      const { ctx } = this;
      const { workflowId } = ctx.query;
      if (!workflowId) ctx.error();
      try {
        await ctx.model.models.resource_request_history.destroy({
          where: {
            workflowId,
            status: 'pending',
          },
        });
        console.log(new Date(), 'deleteHistory workflowId', workflowId);
        ctx.success();
      } catch (error) {
        console.log('error==========================error');
        console.log(error.message);
        console.log('error==========================error');
        ctx.error('service busy');
      }
    }
  };
};
