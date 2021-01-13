'use strict';

const dayjs = require('dayjs');

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { tenantId, prop, order } = ctx.query;
      let { createdAt, updatedAt, expiryDate } = ctx.query;
      expiryDate = ctx.service.common.getDateRangeCondition(expiryDate);
      createdAt = ctx.service.common.getDateRangeCondition(createdAt);
      updatedAt = ctx.service.common.getDateRangeCondition(updatedAt);
      if (createdAt === false || updatedAt === false || expiryDate === false) {
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
        const res = await ctx.model.models.expiry.findAndCountAll({
          where: Object.assign(
            {},
            tenantId ? { tenantId } : undefined,
            expiryDate ? { expiryDate } : undefined,
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
            model: ctx.model.models.tenant,
            as: 'tenant',
            required: true,
          },
        ],
      });
      ctx.success(result);
    }

    async update() {
      const { ctx } = this;
      const { id } = ctx.query;
      const { expiryDate } = ctx.request.body;
      if (!id || !expiryDate) {
        ctx.error();
        return;
      }
      const oldModel = await ctx.model.models.expiry.findByPk(id);
      if (!oldModel) {
        ctx.error();
        return;
      }
      const newModel = {
        expiryDate,
        updatedAt: new Date(),
      };
      try {
        if (dayjs(expiryDate).format('YYYY-MM-DD') !== dayjs(oldModel.expiryDate).format('YYYY-MM-DD')) {
          await oldModel.update(newModel);
        }
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
      const { tenantId, expiryDate } = ctx.request.body;
      if (!tenantId || !expiryDate) {
        ctx.error();
      }
      const model = {
        tenantId,
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
      const { id, tenantId } = ctx.query;
      try {
        const count = await ctx.model.models.expiry.count({
          where: {
            id: { [Op.ne]: id },
            tenantId,
          },
        });
        ctx.success(count);
      } catch (error) {
        console.log('error=========================error');
        console.log(error.message);
        console.log('error=========================error');
        ctx.error();
      }
    }

    // async checkUser() {
    //   const { ctx } = this;
    //   const { Op } = app.Sequelize;
    //   const { id, tenantId, userId } = ctx.query;
    //   try {
    //     const count = await ctx.model.models.expiry.count({
    //       where: {
    //         id: { [Op.ne]: id },
    //         tenantId,
    //         userId,
    //       },
    //     });
    //     ctx.success(count);
    //   } catch (error) {
    //     console.log('error=========================error');
    //     console.log(error.message);
    //     console.log('error=========================error');
    //   }
    // }
  };
};
