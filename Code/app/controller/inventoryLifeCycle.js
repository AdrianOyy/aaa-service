'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      const { createdAt, updatedAt, prop, order } = ctx.query;
      let Order = [[ 'createdAt', 'DESC' ]];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      const findAdParams = {
        where: Object.assign(
          {},
          createdAt ? { createdAt: { [Op.and]: [{ [Op.gte]: new Date(createdAt) }, { [Op.lt]: new Date(new Date(createdAt) - (-8.64e7)) }] } } : undefined,
          updatedAt ? { updatedAt: { [Op.and]: [{ [Op.gte]: new Date(updatedAt) }, { [Op.lt]: new Date(new Date(updatedAt) - (-8.64e7)) }] } } : undefined
        ),
        order: Order,
        offset,
        limit,
      };
      const result = await ctx.model.models.inventoryLifeCycle.findAndCountAll(findAdParams);
      ctx.success(result);
    }
    async listInventorys() {
      const { ctx } = this;
      const findAdParams = {
        raw: true,
        attributes: [ 'id', '_ID' ],
      };
      const result = await ctx.model.models.inventory.findAll(findAdParams);
      ctx.success(result);
    }

    async detail() {
      const { ctx } = this;
      const { id } = ctx.query;
      if (!id) {
        ctx.success();
        return;
      }
      const inventoryLifeCycle = await ctx.model.models.inventoryLifeCycle.findOne({
        where: {
          id,
        },
        include: [
          {
            model: ctx.model.models.inventory,
            as: 'inventory',
          },
        ],
      });
      ctx.success(inventoryLifeCycle);
    }

    async create() {
      const { ctx } = this;
      const {
        _ID, InventoryID, AssetID, RecordCreatedOn, ActionType, ActionDetails,
        SuccessorInventoryID, ActionDate, RespStaff, RespStaffDisplayName,
        Reason, CaseRef,
      } = ctx.request.body;
      if (!_ID) ctx.error();
      const inventoryLifeCycle = Object.assign(
        {
          _ID, AssetID, ActionType, ActionDetails,
          SuccessorInventoryID, RespStaff, RespStaffDisplayName,
          Reason, CaseRef,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        InventoryID ? { InventoryID } : undefined,
        RecordCreatedOn ? { RecordCreatedOn } : undefined,
        ActionDate ? { ActionDate } : undefined
      );
      try {
        await ctx.model.models.inventoryLifeCycle.create(inventoryLifeCycle);
        ctx.success();
      } catch (error) {
        console.log(error.message);
        throw { status: 500, message: 'service busy' };
      }
    }

    async update() {
      const { ctx } = this;
      const { id } = ctx.query;
      const {
        _ID, InventoryID, AssetID, RecordCreatedOn, ActionType, ActionDetails,
        SuccessorInventoryID, ActionDate, RespStaff, RespStaffDisplayName,
        Reason, CaseRef,
      } = ctx.request.body;
      if (!_ID) ctx.error();
      const oldModel = await ctx.model.models.inventoryLifeCycle.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = Object.assign(
        {
          _ID, AssetID, ActionType, ActionDetails,
          SuccessorInventoryID, RespStaff, RespStaffDisplayName,
          Reason, CaseRef,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        InventoryID ? { InventoryID } : undefined,
        AssetID ? { AssetID } : undefined,
        RecordCreatedOn ? { RecordCreatedOn } : undefined,
        ActionDate ? { ActionDate } : undefined
      );
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
        await ctx.model.models.inventoryLifeCycle.destroy({
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

    async checkIDExist() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { _ID, id } = ctx.query;
      if (!_ID) ctx.error;
      const count = await ctx.model.models.inventoryLifeCycle.count({
        where: Object.assign(
          { _ID },
          id ? { id: { [ Op.ne ]: id } } : undefined
        ),
      });
      ctx.success(count);
    }
  };
};
