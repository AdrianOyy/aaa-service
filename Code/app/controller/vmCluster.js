'use strict';

module.exports = app => {
  return class extends app.Controller {
    async list() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { prop, order, createdAt, updatedAt } = ctx.query;
      const limit = parseInt(ctx.query.limit) || 10;
      const offset = (parseInt(ctx.query.page || 1) - 1) * limit;
      let Order = [[ 'createdAt', 'desc' ]];
      if (order && prop) {
        Order = [[ prop, order ]];
      }
      try {
        const res = await ctx.model.models.vm_cluster.findAndCountAll({
          where: Object.assign(
            {},
            createdAt ? { createdAt: { [Op.and]: [{ [Op.gte]: new Date(createdAt) }, { [Op.lt]: new Date(new Date(createdAt) - (-8.64e7)) }] } } : undefined,
            updatedAt ? { updatedAt: { [Op.and]: [{ [Op.gte]: new Date(updatedAt) }, { [Op.lt]: new Date(new Date(updatedAt) - (-8.64e7)) }] } } : undefined
          ),
          order: Order,
          offset,
          limit,
        });
        ctx.success(res);
      } catch (error) {
        ctx.logger.error(error);
        console.log('error==========================error');
        console.log(error.message);
        console.log('error==========================error');
        ctx.error();
      }
    }

    async updateResources() {
      const { ctx } = this;
      const {
        vm_clusters,
        vm_masters,
      } = ctx.request.body;
      // if (!serialNumber) ctx.error();
      console.log(vm_clusters, vm_masters);
      try {
        for (const _ of vm_clusters) {
          console.log(_.VMClusterName);
          let vm_cluster = await ctx.model.models.vm_cluster.findOne({
            where: {
              VMClusterName: _.VMClusterName,
            },
          });
          console.log(vm_cluster);
          if (!vm_cluster) {
            vm_cluster = await ctx.model.models.vm_cluster.create(
              Object.assign(_, {
                createdAt: new Date(),
                updatedAt: new Date(),
              })
            );
          } else {
            vm_cluster.update(
              Object.assign(_, {
                updatedAt: new Date(),
              })
            );
          }
        }
        for (const _ of vm_masters) {
          const vm_cluster = await ctx.model.models.vm_cluster.findOne({
            raw: true,
            attributes: [ 'id' ],
            where: {
              VMClusterName: _.VMClusterName,
            },
          });
          _.VMClusterId = vm_cluster.id;
          let vm_master = await ctx.model.models.vm_master.findOne({
            where: {
              VMCMasterName: _.VMCMasterName,
            },
          });
          if (!vm_master) {
            vm_master = await ctx.model.models.vm_master.create(Object.assign(_, {
              createdAt: new Date(),
              updatedAt: new Date(),
            }));
          } else {
            vm_master.update(
              Object.assign(_, {
                updatedAt: new Date(),
              })
            );
          }
        }
        ctx.success(true);
      } catch (error) {
        console.log(error.message);
        throw { status: 500, message: 'service busy' };
      }
    }
    async createVMGuest() {
      const { ctx } = this;
      const {
        data,
      } = ctx.request.body;
      // if (!serialNumber) ctx.error();
      try {
        const projectCode = data.tenant.code;
        const tenantId = data.tenant.id;
        const projectContact = data.tenant.contact_person;
        const projectManager = data.tenant.project_owner;
        const vmGuests = [];
        console.log(new Date(), ' update resource childTable', data.childTable);
        const childTable = data.childTable.filter(_ => _.status === 'Successfully');
        for (const _ of childTable) {
          const vmGuest = {};
          vmGuest.serialNumber = _.pid;
          vmGuest.model = await ctx.service.defineVMType.defineVMType(_.network_zone.id, _.environment_type.id, _.data_storage_request_number);
          vmGuest.assignedMemory = _.ram_request_number;
          vmGuest.assignedCPUCores = _.cpu_request_number;
          vmGuest.diskVolumeName = null;
          vmGuest.CSVName = _.csv;
          vmGuest.diskSize = _.data_storage_request_number;
          vmGuest.status = _.status;
          vmGuest.hostname = _.hostname;
          vmGuest.OS = _.platform.name;
          vmGuest.serverRole = _.application_type.code;
          vmGuest.hostIP = _.os_ip;
          vmGuest.ATLIP = _.atl_ip;
          vmGuest.magementHost = null;
          vmGuest.extraIPs = null;
          vmGuest.remarks = _.remarks;
          vmGuest.tenantId = tenantId;
          vmGuest.projectCode = projectCode;
          vmGuest.projectContact = projectContact;
          vmGuest.projectManager = projectManager;
          vmGuest.section = null;
          vmGuest.createdAt = _.createdAt;
          vmGuest.updatedAt = _.updatedAt;
          vmGuest.VMClusterId = null;
          vmGuest.VMClusterName = _.vm_cluster;
          vmGuest.VMMasterId = null;
          vmGuest.VMMasterName = _.vm_master;
          if (_.vm_master) {
            const VMMaster = await ctx.model.models.vm_master.findOne({
              raw: true,
              where: {
                VMCMasterName: _.vm_master,
              },
            });
            if (VMMaster) {
              vmGuest.VMMasterId = VMMaster.id;
              const newModel = await ctx.model.models.vm_master.findByPk(VMMaster.id);
              VMMaster.freeMemory = VMMaster.freeMemory - vmGuest.assignedMemory;
              VMMaster.freeNumberOfCPU = VMMaster.freeNumberOfCPU - vmGuest.assignedCPUCores;
              VMMaster.updatedAt = new Date();
              console.log(new Date(), ' update resource update VMMaster', VMMaster);
              await newModel.update(VMMaster);
            }
          }
          if (_.vm_cluster) {
            const VMCluster = await ctx.model.models.vm_cluster.findOne({
              raw: true,
              where: {
                VMClusterName: _.vm_cluster,
              },
            });
            if (VMCluster) {
              vmGuest.VMClusterId = VMCluster.id;
              const newModel = await ctx.model.models.vm_cluster.findByPk(VMCluster.id);
              VMCluster.freeTotalMemory = VMCluster.freeTotalMemory - vmGuest.assignedMemory;
              VMCluster.freeTotalNumbeOfCPU = VMCluster.freeTotalNumbeOfCPU - vmGuest.assignedCPUCores;
              VMCluster.freeStoragePoolSize = VMCluster.freeStoragePoolSize - vmGuest.diskSize;
              VMCluster.updatedAt = new Date();
              console.log(new Date(), ' update resource update VMCluster', VMCluster);
              await newModel.update(VMCluster);
            }
          }
          const ip_assignment = await ctx.model.models.ip_assignment.findOne({
            raw: true,
            where: {
              IP: vmGuest.ATLIP,
            },
            attributes: [ 'id' ],
          });
          const newModel = await ctx.model.models.ip_assignment.findByPk(ip_assignment.id);
          ip_assignment.hostname = vmGuest.hostname;
          ip_assignment.projectTeam = vmGuest.projectCode;
          ip_assignment.assignedDate = new Date();
          console.log(new Date(), ' update resource update ip_assignment', ip_assignment);
          await newModel.update(ip_assignment);
          console.log(new Date(), ' update resource create vmGuest', vmGuest);
          vmGuests.push(vmGuest);
        }
        await ctx.model.models.vm_guest.bulkCreate(vmGuests);
        ctx.success(true);
      } catch (error) {
        console.log(error.message);
        throw { status: 500, message: 'service busy' };
      }
    }
  };
};

