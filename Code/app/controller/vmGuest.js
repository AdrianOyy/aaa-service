'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { serialNumber, prop, order } = ctx.query;
      let { createdAt, updatedAt } = ctx.query;
      createdAt = ctx.service.common.getDateRangeCondition(createdAt);
      updatedAt = ctx.service.common.getDateRangeCondition(updatedAt);
      if (createdAt === false || updatedAt === false) {
        ctx.error();
        return;
      }
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
            createdAt ? { createdAt } : undefined,
            updatedAt ? { updatedAt } : undefined
          ),
          order: Order,
          offset,
          limit,
        });
        // 根据tenantId查询tenant
        const tenants = await ctx.model.models.tenant.findAll({
          raw: true,
          attributes: [ 'id', 'name', 'code' ],
        });
        if (tenants && res && res.rows && res.rows.length > 0) {
          res.rows = res.rows.map(vm_guest => {
            const filterTenants = tenants.filter(_ => _.id === vm_guest.dataValues.tenantId);
            if (filterTenants && filterTenants[0] && filterTenants[0].name) {
              vm_guest.dataValues.tenant = filterTenants[0].name;
            }
            return vm_guest;
          });
        }
        ctx.success(res);
      } catch (error) {
        ctx.logger.error(error);
        console.log('error=========================error');
        console.log(error);
        console.log('error=========================error');
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
        rid,
        dataPortIP,
        serialNumber,
        model,
        assignedMemory,
        assignedCPUCores,
        CPUType,
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
        rid,
        dataPortIP,
        serialNumber,
        model,
        CPUType,
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
        ctx.logger.error(error);
        console.log(error.message);
        throw { status: 500, message: 'service busy' };
      }
    }
    async update() {
      const { ctx } = this;
      const { id } = ctx.query;
      const { Op } = app.Sequelize;
      const {
        rid,
        dataPortIP,
        serialNumber,
        model,
        assignedMemory,
        assignedCPUCores,
        CPUType,
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
        rid,
        dataPortIP,
        serialNumber,
        model,
        assignedMemory,
        assignedCPUCores,
        CPUType,
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
        ctx.logger.error(error);
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
          serialNumber ? { serialNumber: { [Op.like]: `%${serialNumber}%` } } : undefined,
          !createdAt || (!createdAt[0] && !createdAt[1]) ? undefined : { createdAt: {
            [Op.and]: [
              { [Op.gte]: new Date(createdAt[0] ? createdAt[0] : 0) },
              { [Op.lt]: createdAt[1] ? new Date(new Date(createdAt[1]) - (-8.64e7)) : new Date(new Date() - (-8.64e7)) }],
          } },
          !updatedAt || (!updatedAt[0] && !updatedAt[1]) ? undefined : { updatedAt: {
            [Op.and]: [
              { [Op.gte]: new Date(updatedAt[0] ? updatedAt[0] : 0) },
              { [Op.lt]: updatedAt[1] ? new Date(new Date(updatedAt[1]) - (-8.64e7)) : new Date(new Date() - (-8.64e7)) }],
          } }),
        include: {
          model: ctx.model.models.vm_cluster_dc_mapping,
          as: 'vm_cluster_dc_mapping',
          include: {
            model: ctx.model.models.vm_cdc,
            as: 'vm_cdc',
          },
        },
      });
      // const dataList = Object.assign(vmList.dataValues, { extend: vmList.vm_cluster_dc_mapping });
      const dataList = [];
      vmList.forEach(vm => {
        const { vm_cluster_dc_mapping: { vm_cdc: { name } } } = vm;
        const rawData = vm.dataValues;
        delete rawData.vm_cluster_dc_mapping;
        Object.assign(rawData, { dataCenterName: name });
        dataList.push(rawData);
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
