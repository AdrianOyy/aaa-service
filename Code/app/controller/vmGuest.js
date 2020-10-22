'use strict';
const dayjs = require('dayjs');

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { serialNumber, prop, order, createdAt, updatedAt } = ctx.query;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      let Order = [[ 'createdAt', 'desc' ]];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      try {
        const res = await ctx.model.models.vm_guest.findAndCountAll({
          where: Object.assign(
            {},
            serialNumber ? { serialNumber: { [Op.like]: `%${serialNumber}%` } } : undefined,
            createdAt ? { createdAt: { [Op.and]: [{ [Op.gte]: new Date(createdAt) }, { [Op.lt]: new Date(new Date(createdAt) - (-8.64e7)) }] } } : undefined,
            updatedAt ? { updatedAt: { [Op.and]: [{ [Op.gte]: new Date(updatedAt) }, { [Op.lt]: new Date(new Date(updatedAt) - (-8.64e7)) }] } } : undefined
          ),
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
      const result = await ctx.model.models.vm_guest.findOne({
        raw: true,
        where: {
          id,
        },
      });
      ctx.success(result);
    }
    async create() {
      const { ctx } = this;
      const {
        serialNumber,
        model,
        assignedMemory,
        assignedCPUCores,
        diskVolumeName,
        CSVName,
        diskSize,
        status,
        hostname,
        VMClusterId,
        VMClusterName,
        OS,
        serverRole,
        hostIP,
        ATLIP,
        magementHost,
        extraIPs,
        remarks,
        tenantId,
        projectCode,
        projectContact,
        projectManager,
        section,
      } = ctx.request.body;
      if (!serialNumber) ctx.error();
      const existNum = await ctx.model.models.vm_guest.count({
        where: {
          serialNumber,
        },
      });
      if (existNum > 0) ctx.error();
      const newModel = {
        serialNumber,
        model,
        assignedMemory,
        assignedCPUCores,
        diskVolumeName,
        CSVName,
        diskSize,
        status,
        hostname,
        OS,
        serverRole,
        hostIP,
        ATLIP,
        magementHost,
        extraIPs,
        remarks,
        tenantId,
        projectCode,
        projectContact,
        projectManager,
        section,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      if (VMClusterId) {
        newModel.VMClusterId = VMClusterId;
        newModel.VMClusterName = VMClusterName;
      }
      try {
        await ctx.model.models.vm_guest.create(newModel);
        ctx.success();
      } catch (error) {
        console.log(error.message);
        throw { status: 500, message: 'service busy' };
      }
    }
    async update() {
      const { ctx } = this;
      const { id } = ctx.query;
      const { Op } = app.Sequelize;
      const {
        serialNumber,
        model,
        assignedMemory,
        assignedCPUCores,
        diskVolumeName,
        CSVName,
        diskSize,
        status,
        hostname,
        VMClusterId,
        VMClusterName,
        OS,
        serverRole,
        hostIP,
        ATLIP,
        magementHost,
        extraIPs,
        remarks,
        tenantId,
        projectCode,
        projectContact,
        projectManager,
        section,
      } = ctx.request.body;
      if (!id || !serialNumber) ctx.error();
      const existNum = await ctx.model.models.vm_guest.count({
        where: {
          id: { [Op.ne]: id },
          serialNumber,
        },
      });
      if (existNum > 0) ctx.error();
      const oldModel = await ctx.model.models.vm_guest.findByPk(id);
      if (!oldModel) ctx.error();
      const newModel = {
        serialNumber,
        model,
        assignedMemory,
        assignedCPUCores,
        diskVolumeName,
        CSVName,
        diskSize,
        status,
        hostname,
        VMClusterId,
        VMClusterName,
        OS,
        serverRole,
        hostIP,
        ATLIP,
        magementHost,
        extraIPs,
        remarks,
        tenantId,
        projectCode,
        projectContact,
        projectManager,
        section,
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
        await ctx.model.models.vm_guest.destroy({
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
    async checkSerialNumber() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { id, serialNumber } = ctx.query;
      const count = await ctx.model.models.vm_guest.count({
        where: {
          serialNumber,
          id: { [Op.ne]: id },
        },
      });
      ctx.success(count);
    }
    async export() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { serialNumber, createdAt, updatedAt } = ctx.request.body;
      const vmList = await ctx.model.models.vm_guest.findAll({
        where: Object.assign({},
          serialNumber ? { serialNumber: { [Op.like]: `%${serialNumber}%` } } : undefined, {
            createdAt: {
              [Op.and]: [
                { [Op.gt]: new Date(createdAt[0] ? createdAt[0] : 0) },
                { [Op.lte]: createdAt[1] ? new Date(createdAt[1]) : new Date(new Date() - (-8.64e7)) }],
            },
            updatedAt: {
              [Op.and]: [
                { [Op.gt]: new Date(updatedAt[0] ? updatedAt[0] : 0) },
                { [Op.lte]: updatedAt[1] ? new Date(updatedAt[1]) : new Date(new Date() - (-8.64e7)) }],
            },
          }),
      });
      const dataList = [];
      vmList.forEach(el => {
        const model = Object.assign(el.dataValues, {
          createdAt: dayjs(el.createdAt).format('DD-MMM-YYYY HH:mm'),
          updatedAt: dayjs(el.updatedAt).format('DD-MMM-YYYY HH:mm'),
        });
        dataList.push(model);
      });
      const data = {
        len: vmList.length,
        dataList,
      };
      const buffer = await ctx.service.file.getFileBlob('VM', 'VM.xlsx', data);
      ctx.set('Content-Type', 'application/octet-stream');
      ctx.body = buffer;
    }
  };
};
