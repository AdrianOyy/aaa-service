'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      const { isNetwork, createdAt, updatedAt, prop, order } = ctx.query;
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
      findAdParams.include = [{
        model: ctx.model.models.equipType,
        as: 'equipType',
        where: Object.assign(
          {},
          isNetwork ? { Type: { [Op.ne]: 'EqServer' } } : { Type: { [Op.eq]: 'EqServer' } }
        ),
      }];
      const result = await ctx.model.models.inventory.findAndCountAll(findAdParams);
      ctx.success(result);
    }

    async listStatus() {
      const { ctx } = this;

      const result = await ctx.model.models.inventoryStatus.findAll({});
      ctx.success(result);
    }

    async listEquipType() {
      const { ctx } = this;

      const result = await ctx.model.models.equipType.findAll({});
      ctx.success(result);
    }

    async detail() {
      const { ctx } = this;
      const { id } = ctx.query;
      if (!id) {
        ctx.success();
        return;
      }
      const inventory = await ctx.model.models.inventory.findOne({
        where: {
          id,
        },
        include: [
          {
            model: ctx.model.models.inventoryStatus,
            as: 'status',
          },
          {
            model: ctx.model.models.equipType,
            as: 'equipType',
          },
          {
            model: ctx.model.models.equipmentPort,
            as: 'equipPort',
            include: {
              model: ctx.model.models.portAssignment,
              as: 'portAssignment',
            },
          },
          {
            model: ctx.model.models.policy,
            as: 'policy',
          },
          {
            model: ctx.model.models.powerInput,
            as: 'powerInput',
          },
          {
            model: ctx.model.models.powerOutput,
            as: 'powerOutput',
          },
        ],
      });
      ctx.success(inventory);
    }

    async create() {
      const { ctx } = this;
      const {
        _ID, UnitCode, AssetID, ModelCode, ModelDesc, ClosetID,
        Rack, RLU, ItemOwner, Status, Remark, UnitNo, PortQty, ReqNo,
        DOB, DeliveryDate, DeliveryNoteReceivedDate, MaintID, EquipType,
      } = ctx.request.body;
      if (!_ID || !EquipType) ctx.error();
      const inventory = {
        _ID,
        EquipType,
        AssetID: AssetID ? AssetID : null,
        ClosetID: ClosetID ? ClosetID : null,
        DeliveryDate: DeliveryDate ? DeliveryDate : null,
        Status: Status ? Status : null,
        PortQty: PortQty ? PortQty : null,
        DeliveryNoteReceivedDate: DeliveryNoteReceivedDate ? DeliveryNoteReceivedDate : null,
        ModelCode,
        ModelDesc,
        Rack,
        RLU,
        ItemOwner,
        Remark,
        UnitNo,
        ReqNo,
        MaintID,
        UnitCode,
        DOB: DOB ? DOB : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      try {
        await ctx.model.models.inventory.create(inventory);
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
        _ID, UnitCode, AssetID, ModelCode, ModelDesc, ClosetID,
        Rack, RLU, ItemOwner, Status, Remark, UnitNo, PortQty, ReqNo,
        DOB, DeliveryDate, DeliveryNoteReceivedDate, MaintID, EquipType,
      } = ctx.request.body;
      if (!_ID) ctx.error();
      const oldModel = await ctx.model.models.inventory.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = {
        _ID,
        EquipType,
        AssetID: AssetID ? AssetID : null,
        ClosetID: ClosetID ? ClosetID : null,
        DeliveryDate: DeliveryDate ? DeliveryDate : null,
        Status: Status ? Status : null,
        PortQty: PortQty ? PortQty : null,
        DeliveryNoteReceivedDate: DeliveryNoteReceivedDate ? DeliveryNoteReceivedDate : null,
        ModelCode,
        ModelDesc,
        Rack,
        RLU,
        ItemOwner,
        Remark,
        UnitNo,
        ReqNo,
        MaintID,
        UnitCode,
        DOB: DOB ? DOB : null,
        updatedAt: new Date(),
      };
      console.log(newModel);
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
        await ctx.model.models.inventory.destroy({
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
      const count = await ctx.model.models.inventory.count({
        where: Object.assign(
          { _ID },
          id ? { id: { [ Op.ne ]: id } } : undefined
        ),
      });
      ctx.success(count);
    }
  };
};
