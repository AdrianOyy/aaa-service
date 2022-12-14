'use strict';

module.exports = app => {
  return class extends app.Controller {

    async listApplicationType() {
      const { ctx } = this;

      const result = await ctx.model.models.vm_applicationType.findAll({});
      ctx.success(result);
    }

    async listCDC() {
      const { ctx } = this;

      const result = await ctx.model.models.vm_cdc.findAll({});
      ctx.success(result);
    }

    async listClusterApplicationType() {
      const { ctx } = this;
      const findParams = {
        include: [
          {
            model: ctx.model.models.vm_applicationType,
            as: 'applicationType',
            attributes: [ 'id', 'name' ],
          },
        ],
      };

      const result = await ctx.model.models.vm_cluster_applicationType.findAll(findParams);
      ctx.success(result);
    }

    async listPlatform() {
      const { ctx } = this;

      const result = await ctx.model.models.vm_platform.findAll({});
      ctx.success(result);
    }

    async listPlatformApplicationType() {
      const { ctx } = this;

      const findParams = {
        include: [
          {
            model: ctx.model.models.vm_platform,
            as: 'platform',
            attributes: [ 'id', 'name' ],
          },
          {
            model: ctx.model.models.vm_applicationType,
            as: 'applicationType',
            attributes: [ 'id', 'name' ],
          },
        ],
      };

      const result = await ctx.model.models.vm_platform_applicationType.findAll(findParams);
      ctx.success(result);
    }

    async listType() {
      const { ctx } = this;

      const result = await ctx.model.models.vm_type.findAll({});
      ctx.success(result);
    }

    async listTypeZoneCDC() {
      const { ctx } = this;

      const findParams = {
        include: [
          {
            model: ctx.model.models.vm_type,
            as: 'type',
            attributes: [ 'id', 'name' ],
          },
          {
            model: ctx.model.models.vm_cdc,
            as: 'cdc',
            attributes: [ 'id', 'name' ],
          },
          {
            model: ctx.model.models.vm_platform,
            as: 'platform',
            attributes: [ 'id', 'name' ],
          },
          {
            model: ctx.model.models.vm_zone,
            as: 'zone',
            attributes: [ 'id', 'name' ],
          },
        ],
      };

      const result = await ctx.model.models.vm_type_zone_cdc.findAll(findParams);
      ctx.success(result);
    }

    async listZone() {
      const { ctx } = this;

      const result = await ctx.model.models.vm_zone.findAll({});
      ctx.success(result);
    }

    async getClusterList() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { formKey, formId } = ctx.request.body;
      const vmlist = await ctx.service.getFormDetailList(formKey, formId);
      const inCluster = [];
      for (const vm of vmlist) {
        const cluster = [];
        if (vm.network_zone && vm.application_type) {
          // ??????applicationType ?????? Cluster
          const typeClusters = await ctx.model.models.vm_cluster_applicationType.findAll({ where: { applicationTypeId: vm.application_type } });
          // console.log(appCluster);
          // ?????? typeId ??? zoomId ?????? dc?????????dc?????? Cluster
          const dcClusters = await ctx.model.models.vm_cluster_dc_mapping.findAll({
            where: { cdcid: { [Op.in]: app.Sequelize.literal(`(select cdcid from vm_type_zone_cdc where typeId = ${vm.environment_type} and zoneId = ${vm.network_zone})`) } },
          });
          for (const typeCluster of typeClusters) {
            cluster.push(typeCluster.cluster);
          }
          for (const dcCluster of dcClusters) {
            if (cluster.indexOf(dcCluster.clusterName) === -1) {
              cluster.push(dcCluster.clusterName);
            }
          }
          const data = await ctx.service.getCluserList(cluster, vm, inCluster);
          // ????????????
          vm.cluser = data;
          inCluster.push(vm);
        }
      }
      return vmlist;
    }

    async preDefine() {
      const { ctx } = this;
      let pass = true;
      let message = '';
      const { formKey, formId, version } = ctx.request.body;
      try {
        const dynamicForm = await ctx.service.dynamicForm.getDetailByKey(formKey, version, formId);
        const { childFormKey, childTable, tenant } = dynamicForm;
        const tenantId = tenant.id;
        const tenantName = tenant.name;
        // generate hostname
        for (let i = 0; i < childTable.length; i++) {
          const prefix = await ctx.service.hostname.getPrefix(childTable[i]);
          if (prefix) {
            childTable[i].hostnamePrefix = prefix;
          } else {
            if (childTable[i].environment_type
              && childTable[i].environment_type.name
              && childTable[i].network_zone
              && childTable[i].network_zone.name) {
              message += `Environment Type \`${childTable[i].environment_type.name}\` and Network Zone \`${childTable[i].network_zone.name}\` has not Hostname Prefix\n`;
            }
            pass = false;
          }
        }
        const typeCountList = await ctx.service.hostname.countByType(childTable);
        const hostnameMap = new Map();
        for (let i = 0; i < typeCountList.length; i++) {
          const list = await ctx.service.hostname.generateHostname(tenantId, typeCountList[i]);
          if (!list) {
            pass = false;
            message += `Tenant \`${tenantName}\` with Application type \`${typeCountList[i].applicationType}\` hostname is not enough\n`;
          }
          hostnameMap.set(typeCountList[i].applicationType, new Map().set(typeCountList[i].hostname_prefix, list));
        }
        // TODO assign IP (delay function, verify IP  in this tern)
        const CIPMap = new Map();
        const FIPMap = new Map();
        const DCCountList = await ctx.service.ipAssign.countByDC(childTable);
        for (let i = 0; i < DCCountList.length; i++) {
          const list = await ctx.service.ipAssign.assign(DCCountList[i].dataCenter, DCCountList[i].requestNum);
          console.log(list);
          if (!list) {
            pass = false;
            message += 'IP is not enough\n';
          } else {
            const [ CList, FList ] = list;
            CIPMap.set(DCCountList[i].dataCenter, CList);
            FIPMap.set(DCCountList[i].dataCenter, FList);
          }
        }

        for (let i = 0; i < childTable.length; i++) {
          const el = childTable[i];
          if (el.application_type && el.application_type.code && pass) {
            const list = hostnameMap.get(el.application_type.code).get(el.hostnamePrefix);
            el.hostname = list[0];
            hostnameMap.get(el.application_type.code).set(el.hostnamePrefix, list.slice(1));
          }
          if (el.data_center && el.data_center.id && pass) {
            const CList = CIPMap.get(el.data_center.id);
            const FList = FIPMap.get(el.data_center.id);
            el.os_ip = CList[0].IP;
            el.atl_ip = FList[0].IP;
            CIPMap.set(el.data_center.id, CList.slice(1));
            FIPMap.set(el.data_center.id, FList.slice(1));
          }
          // define VM's type

          const type = await ctx.service.defineVMType.defineVMType(el.network_zone.id, el.environment_type.id, el.data_storage_request_number);
          el.type = type;
        }
        // switch VM's type to define vm cluster with different route
        const data = await ctx.service.cluster.getClusterList(childTable);
        if (!data.pass) {
          pass = false;
          message += data.message;
        }

        // TODO save new VM list(childTable)
        if (pass) {
          for (let i = 0; i < childTable.length; i++) {
            const el = childTable[i];
            const columnList = `hostname = \"${el.hostname}\", vm_cluster= \"${el.vm_cluster}\", vm_master= \"${el.vm_master}\",os_ip= \"${el.os_ip}\",atl_ip= \"${el.atl_ip}\",csv=\"${el.csv}\",platformtype=\"${el.type}\"`;
            try {
              const updateSQL = `UPDATE \`${childFormKey}${version}\` SET ${columnList} WHERE \`${childFormKey}${version}\`.id = ${el.id}`;
              await app.model.query(updateSQL);
            } catch (e) {
              console.log('e ================= e');
              console.log(e);
              console.log('e ================= e');
              message = 'System busy';
              pass = false;
            }
          }
        }
      } catch (error) {
        ctx.logger.error(error);
        console.log('error=========================error');
        console.log(error);
        console.log('error=========================error');
        message = error;
        pass = false;
      }

      // return a map includes result and message to workflow service
      ctx.success({ pass, message });
    }


    async check() {
      const { ctx } = this;
      const { formKey, parentData, version, childData } = ctx.request.body;
      if (!formKey || !parentData || !version || !childData) {
        ctx.error();
        return;
      }
      let formId = 0;
      if (parentData) {
        formId = parentData.id.value;
      }
      const fileList = [];
      let jobId = '';
      const dynamicForm = await ctx.service.dynamicForm.getDetailByKey(formKey, version, formId);
      const { tenant } = dynamicForm;
      const tenantId = tenant.id;
      const tenantName = tenant.name;
      const applicationType = childData.application_type.value;
      const hostname = childData.hostname.value;
      const environment_type = childData.environment_type.value;
      const network_zone = childData.network_zone.value;
      // TODO 1. ???????????? application type ???????????? hostname ??????
      const hostname_prefix = await ctx.service.hostname.getPrefixByTypeZone(environment_type, network_zone);
      const applicationTypeId = childData.application_type.value;
      const application = await ctx.model.models.vm_applicationType.findOne({ where: { id: applicationTypeId } });
      const typeCount = {
        applicationType: application ? application.code : '',
        hostname_prefix,
        requestNum: 1,
      };
      const list = await ctx.service.hostname.generateCheckHostname(tenantId, typeCount);
      console.log(list);
      const appResult = {
        fieldName: 'hostname',
        error: false,
        message: null,
      };
      if (!list) {
        appResult.error = true;
        appResult.message = `Tenant \`${tenantName}\` with Application type  hostname is not enough`;
        fileList.push(appResult);
      }
      // TODO 1.1 ???????????? hostname list ???????????????????????? hostname list ?????????
      if (list && hostname) {
        if (list.indexOf(hostname) === -1) {
          appResult.error = true;
          appResult.message = `Tenant \`${tenantName}\` with Application type  hostname is not found in hostnameList`;
          fileList.push(appResult);
        }
      }
      const dcResult = {
        fieldName: 'dc',
        error: false,
        message: null,
      };
      // TODO 1.2 ???????????? hostname ??????????????????
      const guestHost = await ctx.model.models.vm_guest.findOne({ where: { hostname } });
      if (guestHost) {
        const hostResult = {
          fieldName: 'hostname',
          error: true,
          message: 'Hostname is occupied',
        };
        fileList.push(hostResult);
      }
      // TODO 2. ?????? zoom ??? type ???????????? data center
      const dc = await ctx.service.dc.getDC(environment_type, network_zone);
      if (!dc) {
        dcResult.error = true;
        dcResult.message = 'Data Center with Environment Type and Network Zone is not enough';
        fileList.push(dcResult);
      }
      // T0D0 2.1 ?????????ip?????????
      const os_ip = childData.os_ip.value;
      const atl_ip = childData.atl_ip.value;
      const opResult = await ctx.service.ipAssign.checkAssign(dc, os_ip, 'Cat C - OS');
      const atlResult = await ctx.service.ipAssign.checkAssign(dc, atl_ip, 'Cat F - ATL');
      if (opResult) {
        const opPing = await ctx.service.ipAssign.pingIp(os_ip);
        if (opPing) {
          fileList.push({
            fieldName: 'os_ip',
            error: true,
            message: 'OS IP is occupied',
          });
        }
      } else {
        fileList.push({
          fieldName: 'os_ip',
          error: true,
          message: 'OS IP is not found',
        });
      }
      if (atlResult) {
        const atlPing = await ctx.service.ipAssign.pingIp(atl_ip);
        if (atlPing) {
          fileList.push({
            fieldName: 'atl_ip',
            error: true,
            message: 'ATL IP is occupied',
          });
        }
      } else {
        fileList.push({
          fieldName: 'atl_ip',
          error: true,
          message: 'ATL IP is not found',
        });
      }
      // TODO 3. ???????????? vm type
      // TODO 4. ?????? data center ?????? vm cluster ??? vm master ????????????
      const clusterList = await ctx.service.cluster.checkClusterList(dc, applicationType);
      const vm_cluster = childData.vm_cluster.value;
      const cluster = clusterList.indexOf(vm_cluster);
      if (cluster > -1) {
        if (fileList.length === 0) {
          // call jobid
          const data_storage_request_number = childData.data_storage_request_number.value;
          const type = await ctx.service.defineVMType.defineVMType(network_zone, environment_type, data_storage_request_number);
          if (type === 'VMWare') {
            const vclusters = { vClusters: vm_cluster };
            jobId = await ctx.service.cluster.getAnsibleJob(vclusters);
            if (!jobId) {
              fileList.push({
                fieldName: 'jobId',
                error: true,
                message: 'An error occurred during getting job ID',
              });
            }
          } else {
            const where = {
              clusterName: vm_cluster,
              cdcId: dc,
              applicationTypeId: applicationType,
            };
            const center = await ctx.model.models.vm_cluster_dc_mapping.findOne({ where });
            const hicData = { vClusters: vm_cluster, vSiteIPs: center.vCenter };
            jobId = await ctx.service.hciResource.getAnsibleJobByHCI(hicData);
            console.log(jobId);
            if (!jobId) {
              fileList.push({
                fieldName: 'jobId',
                error: true,
                message: 'An error occurred during getting job ID',
              });
            }
            // ??????HCI
          }
        }
        // const vm_master = childData.vm_master.value;
        // const ram_request_number = childData.ram_request_number.value;
        // const cpu_request_number = childData.cpu_request_number.value;
        // const vmResult = await ctx.service.cluster.getCheck(vm_cluster, vm_master, data_storage_request_number, ram_request_number, cpu_request_number, type);
        // console.log('====================Check VM Cluster End', vmResult.message, new Date());
        // fileList.push(vmResult);
      } else {
        fileList.push({
          fieldName: 'vm_cluster',
          error: true,
          message: 'VM cluster with selected data center is not found ',
        });
      }
      // if (cluster  -1) {
      //   const vm_master = childData.vm_master.value;
      //   const ram_request_number = childData.ram_request_number.value;
      //   const cpu_request_number = childData.cpu_request_number.value;
      //   const vmResult = await ctx.service.cluster.getCheck(vm_cluster, vm_master, data_storage_request_number, ram_request_number, cpu_request_number, type);
      //   console.log('====================Check VM Cluster End', vmResult.message, new Date());
      //   fileList.push(vmResult);
      // } else {
      //   fileList.push({
      //     fieldName: 'vm_cluster',
      //     error: true,
      //     message: 'vm_cluster is not found by data center',
      //   });
      // }
      // TODO 5. ?????? data center
      const data = {
        success: fileList.length === 0,
        message: fileList.length !== 0 ? fileList[0].message : '',
        jobId,
      };
      ctx.success(data);
    }

    async getResource() {
      const { ctx } = this;
      const { form, jobId } = ctx.request.body;
      const { childData } = form;
      const environment_type = childData.environment_type.value;
      const network_zone = childData.network_zone.value;
      const data_storage_request_number = childData.data_storage_request_number.value;
      const type = await ctx.service.defineVMType.defineVMType(network_zone, environment_type, data_storage_request_number);
      const vm_master = childData.vm_master.value;
      const ram_request_number = childData.ram_request_number.value;
      const cpu_request_number = childData.cpu_request_number.value;
      const vm_cluster = childData.vm_cluster.value;
      const vmResult = await ctx.service.cluster.getCheck(vm_cluster, vm_master, data_storage_request_number, ram_request_number, cpu_request_number, type, jobId);
      ctx.success({ done: vmResult.done, success: !vmResult.error, message: vmResult.message });
    }
  };
};
