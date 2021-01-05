'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      const { prop, order } = ctx.query;
      let { createdAt, updatedAt } = ctx.query;
      createdAt = ctx.service.common.getDateRangeCondition(createdAt);
      updatedAt = ctx.service.common.getDateRangeCondition(updatedAt);
      if (createdAt === false || updatedAt === false) {
        ctx.error();
        return;
      }
      let Order = [[ 'createdAt', 'DESC' ]];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      const findAdParams = {
        where: Object.assign(
          {},
          createdAt ? { createdAt } : undefined,
          updatedAt ? { updatedAt } : undefined
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
      const inventoryLifeCycle = {
        _ID,
        InventoryID: InventoryID ? InventoryID : null,
        RecordCreatedOn: RecordCreatedOn ? RecordCreatedOn : null,
        ActionDate: ActionDate ? ActionDate : null,
        AssetID,
        ActionType,
        ActionDetails,
        SuccessorInventoryID,
        RespStaff,
        RespStaffDisplayName,
        Reason,
        CaseRef,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
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
      const newModel = {
        _ID,
        InventoryID: InventoryID ? InventoryID : null,
        RecordCreatedOn: RecordCreatedOn ? RecordCreatedOn : null,
        ActionDate: ActionDate ? ActionDate : null,
        AssetID,
        ActionType,
        ActionDetails,
        SuccessorInventoryID,
        RespStaff,
        RespStaffDisplayName,
        Reason,
        CaseRef,
        createdAt: new Date(),
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
      // const { Op } = app.Sequelize;
      const { _ID, id } = ctx.query;
      if (!_ID) ctx.error;
      const sql = 'SELECT count(id) as count FROM inventoryLifeCycle WHERE _ID = ' + _ID + (id ? ' and id != ' + id : '');
      const query = await app.model.query(sql);
      const count = query && query[0] && query[0][0] ? query[0][0].count : 0;
      // const count = await ctx.model.models.inventoryLifeCycle.count({
      //   where: Object.assign(
      //     { _ID },
      //     id ? { id: { [ Op.ne ]: id } } : undefined
      //   ),
      // });
      ctx.success(count);
    }
  };
};
