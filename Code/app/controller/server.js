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
      findAdParams.include = [{
        model: ctx.model.models.equipType,
        as: 'equipType',
      }];
      const result = await ctx.model.models.server.findAndCountAll(findAdParams);
      ctx.success(result);
    }

    async detail() {
      const { ctx } = this;
      const { id } = ctx.query;
      if (!id) {
        ctx.success();
        return;
      }
      const server = await ctx.model.models.server.findOne({
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
      ctx.success(server);
    }

    async create() {
      const { ctx } = this;
      const {
        _ID, UnitCode, AssetID, ModelCode, ModelDesc, ClosetID,
        Rack, RLU, ItemOwner, Status, Remark, UnitNo, PortQty, ReqNo,
        DOB, DeliveryDate, DeliveryNoteReceivedDate, MaintID, EquipType,
      } = ctx.request.body;
      if (!_ID || !EquipType) ctx.error();
      const server = {
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
        await ctx.model.models.server.create(server);
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
      const oldModel = await ctx.model.models.server.findByPk(id);
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
        await ctx.model.models.server.destroy({
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
      if (!_ID || !id) ctx.error;
      const sql = `SELECT count(id) as count FROM server WHERE _ID = \'${_ID}\' and id != \'${id}\'`;
      const query = await app.model.query(sql);
      const count = query && query[0] && query[0][0] ? query[0][0].count : 0;
      // const count = await ctx.model.models.server.count({
      //   where: Object.assign(
      //     { _ID },
      //     id ? { id: { [ Op.ne ]: id } } : undefined
      //   ),
      // });
      ctx.success(count);
    }
  };
};
