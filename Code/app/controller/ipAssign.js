'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { IP, DCId, hostname, projectTeam } = ctx.query;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      const IPList = await ctx.model.models.ip_assignment.findAndCountAll({
        where: Object.assign(
          {},
          IP ? { IP: { [Op.like]: `%${IP}%` } } : undefined,
          DCId ? { DCId } : undefined,
          hostname ? { hostname: { [Op.like]: `%${hostname}%` } } : undefined,
          projectTeam ? { projectTeam: { [Op.like]: `%${projectTeam}%` } } : undefined
        ),
        offset,
        limit,
        include: {
          model: ctx.model.models.vm_cdc,
          as: 'DC',
        },
      });
      ctx.success(IPList);
    }

    async detail() {
      const { ctx } = this;
      const { id } = ctx.query;
      if (!id) ctx.error();
      const ipAssign = await ctx.model.models.ip_assignment.findOne({
        where: {
          id,
        },
        include: {
          model: ctx.model.models.vm_cdc,
          as: 'DC',
        },
      });
      ctx.success(ipAssign);
    }

    async update() {
      const { ctx } = this;
      const { id } = ctx.query;
      const {
        ip, dc, hostname, projectTeam,
        networkType, ipPool, vlanId, remark,
      } = ctx.request.body;
      if (!id || !ip || !dc) ctx.error();
      const oldModel = await ctx.model.models.ip_assignment.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = {
        IP: ip,
        DCId: dc,
        hostname,
        projectTeam,
        networkType,
        IPPool: ipPool,
        vlanId: vlanId ? vlanId : null,
        remark,
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
      const { ip, dc, hostname, projectTeam, networkType, ipPool, vlanId, remark } = ctx.request.body;
      const model = {
        IP: ip,
        DCId: dc,
        hostname,
        projectTeam,
        networkType,
        IPPool: ipPool,
        vlanId: vlanId ? vlanId : null,
        remark,
        createdAt: new Date(),
        updatedAt: new Date(),
        assignedDate: new Date(),
      };
      try {
        await ctx.model.models.ip_assignment.create(model);
        ctx.success();
      } catch (err) {
        console.log('err ================= err');
        console.log(err);
        console.log('err ================= err');
        ctx.error(err.message);
      }
    }

    async checkIpExist() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { IP, id } = ctx.query;
      if (!IP) ctx.error;
      const count = await ctx.model.models.ip_assignment.count({
        where: Object.assign(
          { IP },
          id ? { id: { [ Op.ne ]: id } } : undefined
        ),
      });
      ctx.success(count);
    }

    async deleteMany() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { idList } = ctx.request.body;
      if (!idList || !idList.length) ctx.error();
      try {
        await ctx.model.models.ip_assignment.destroy({
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

    async getClosestIP() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { DC, requestNum } = ctx.query;
      if (!DC || !requestNum) ctx.error();
      const IPList = await ctx.model.models.ip_assignment.findAll({
        where: {
          DC,
          hostname: { [Op.is]: null },
        },
        attributes: [ 'id', 'IP' ],
        order: [[ 'IP', 'ASC' ]],
      });
      if (IPList.length < requestNum) {
        ctx.error();
      } else if (IPList.length === parseInt(requestNum)) {
        ctx.success(IPList);
      } else if (parseInt(requestNum) === 1) {
        ctx.success(IPList[0]);
      } else {
        const closestList = await ctx.service.ipAssign.getClosest(IPList, parseInt(requestNum));
        ctx.success(closestList ? closestList : []);
      }
    }
  };
};
