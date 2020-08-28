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
      const { formKey, formId } = ctx.request.body;
      const dynamicForm = await ctx.service.dynamicForm.getDetailByKey(formKey, formId);
      const { childFormKey, childTable, tenant } = dynamicForm;
      const tenantId = tenant.id;
      const tenantName = tenant.name;

      // TODO generate hostname
      const typeCountList = await ctx.service.hostname.countByType(childTable);
      const hostnameMap = new Map();
      for (let i = 0; i < typeCountList.length; i++) {
        const list = await ctx.service.hostname.generateHostname(tenantId, typeCountList[i].applicationType.name, typeCountList[i].requestNum);
        if (!list) {
          pass = false;
          message += `Tenant \`${tenantName}\` with Application type \`${typeCountList[i].applicationType}\` hostname is not enough\n`;
        }
        hostnameMap.set(typeCountList[i].applicationType, list);
      }

      childTable.forEach(el => {
        if (el.application_type && el.applicationType.name) {
          const list = hostnameMap.get(el.applicationType.name);
          el.hostname = list[0];
          hostnameMap.set(el.applicationType.name, list.slice(1));
        }
      });

      // TODO define vm type

      // TODO switch vm type to define vm cluster with different route
      const data = await ctx.service.cluster.getClusterList(childTable);
      if (!data.pass) {
        pass = false;
        message += data.message;
      }
      // TODO assign IP (delay function, verify IP  in this tern)

      // TODO save new VM list(childTable)
      for (let i = 0; i < childTable.length; i++) {
        const el = childTable[i];
        const columnList = `hostname = \"${el.hostname}\"`;
        try {
          const updateSQL = `UPDATE \`${childFormKey}\` SET ${columnList} WHERE \`${childFormKey}\`.id = ${el.id}`;
          await app.model.query(updateSQL);
        } catch (e) {
          console.log('e ================= e');
          console.log(e);
          console.log('e ================= e');
          message = 'System busy';
          pass = false;
        }
      }

      // TODO return a map includes result and message to workflow service
      ctx.success({ pass, message });
    }

    async check() {
      const { ctx } = this;
      const { formKey, formId, dynamicForm } = ctx.request.body;

    }
  };
};
