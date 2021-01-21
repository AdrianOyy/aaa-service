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
          // 根据applicationType 获取 Cluster
          const typeClusters = await ctx.model.models.vm_cluster_applicationType.findAll({ where: { applicationTypeId: vm.application_type } });
          // console.log(appCluster);
          // 根据 typeId 和 zoomId 获取 dc，根据dc获取 Cluster
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
          // 保存名称
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
          childTable[i].hostnamePrefix = prefix;
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
          if (el.application_type && el.application_type.name && pass) {
            const list = hostnameMap.get(el.application_type.name).get(el.hostnamePrefix);
            el.hostname = list[0];
            hostnameMap.get(el.application_type.name).set(el.hostnamePrefix, list.slice(1));
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
            const columnList = `hostname = \"${el.hostname}\", vm_cluster= \"${el.vm_cluster}\", vm_master= \"${el.vm_master}\",os_ip= \"${el.os_ip}\",atl_ip= \"${el.atl_ip}\",csv=\"${el.csv}\"`;
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
        console.log(error);
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
      const dynamicForm = await ctx.service.dynamicForm.getDetailByKey(formKey, version, formId);
      const { tenant } = dynamicForm;
      const tenantId = tenant.id;
      const tenantName = tenant.name;
      const applicationType = childData.application_type.value;
      const hostname = childData.hostname.value;
      const environment_type = childData.environment_type.value;
      const network_zone = childData.network_zone.value;
      const data_storage_request_number = childData.data_storage_request_number.value;
      // TODO 1. 根据新的 application type 计算新的 hostname 列表
      const hostname_prefix = await ctx.service.hostname.getPrefixByTypeZone(environment_type, network_zone);
      const applicationTypelabel = childData.application_type.label;
      const typeCount = {
        applicationType: applicationTypelabel,
        hostname_prefix,
        requestNum: 1,
      };
      const list = await ctx.service.hostname.generateHostname(tenantId, typeCount);
      const appResult = {
        fieldName: 'hostname',
        error: false,
        message: null,
      };
      if (!list) {
        appResult.error = true;
        appResult.message = `Tenant \`${tenantName}\` with Application type  hostname is not enough`;
      }
      // TODO 1.1 验证新的 hostname list 是否为计算出来的 hostname list 的子集
      if (list && hostname) {
        if (list.indexOf(hostname) === -1) {
          appResult.error = true;
          appResult.message = `Tenant \`${tenantName}\` with Application type  hostname is not found in hostnameList`;
        }
      }
      fileList.push(appResult);
      const dcResult = {
        fieldName: 'dc',
        error: false,
        message: null,
      };
      // TODO 1.2 验证新的 hostname 是否被使用中
      const guestHost = await ctx.model.models.vm_guest.findOne({ where: { hostname } });
      if (guestHost) {
        const hostResult = {
          fieldName: 'hostname',
          error: true,
          message: 'hostname is used',
        };
        fileList.push(hostResult);
      }
      // TODO 2. 根据 zoom 和 type 确定新的 data center
      const dc = await ctx.service.dc.getDC(environment_type, network_zone);
      if (!dc) {
        dcResult.error = true;
        dcResult.message = 'Data Center with Environment Type and Network Zone is not enough';
      }
      fileList.push(dcResult);
      // T0D0 2.1 验证新ip是否在
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
            message: 'os_ip is user',
          });
        }
      } else {
        fileList.push({
          fieldName: 'os_ip',
          error: true,
          message: 'os_ip is not found ip assign',
        });
      }
      if (atlResult) {
        const atlPing = await ctx.service.ipAssign.pingIp(atl_ip);
        if (atlPing) {
          fileList.push({
            fieldName: 'atl_ip',
            error: true,
            message: 'atl_ip is user',
          });
        }
      } else {
        fileList.push({
          fieldName: 'atl_ip',
          error: true,
          message: 'atl_ip is not found ip assign',
        });
      }
      // TODO 3. 确定新的 vm type
      const type = await ctx.service.defineVMType.defineVMType(network_zone, environment_type, data_storage_request_number);
      // TODO 4. 根据 data center 验证 vm cluster 和 vm master 的正确性
      const clusterList = await ctx.service.cluster.checkClusterList(dc, applicationType);
      const vm_cluster = childData.vm_cluster.value;
      const cluster = clusterList.indexOf(vm_cluster);
      if (cluster > -1) {
        const vm_master = childData.vm_master.value;
        const ram_request_number = childData.ram_request_number.value;
        const cpu_request_number = childData.cpu_request_number.value;
        const vmResult = await ctx.service.cluster.getCheck(vm_cluster, vm_master, data_storage_request_number, ram_request_number, cpu_request_number, type);
        fileList.push(vmResult);
      } else {
        fileList.push({
          fieldName: 'vm_cluster',
          error: true,
          message: 'vm_cluster is not found by data center',
        });
      }
      // TODO 5. 根据 data center
      ctx.success(fileList);
    }
  };
};
