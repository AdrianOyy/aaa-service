'use strict';

module.exports = app => {
  return class extends app.Service {
    /**
     *
     * @param {number|string} tenantId Table tenant primary key
     * @return {Object} Table tenant_hostname_reference entity list
     */
    async getReferenceList(tenantId) {
      const { ctx } = this;
      const tenant = await ctx.model.models.tenant.findOne({
        where: {
          id: tenantId,
        },
        include: {
          model: ctx.model.models.tenant_hostname_reference,
          as: 'reference',
          required: true,
          attributes: [ 'tenantCode', 'windows_vm_hostname_reference' ],
        },
      });
      if (!tenant) return false;
      const { reference } = tenant;
      const res = [];
      reference.map(ref => res.push(ref.windows_vm_hostname_reference));
      return res;
    }

    /**
     *
     * @param {string} appType VM application type, like 'IIS'
     * @param {string} reference Table tenant_hostname_reference column reference
     * @return {Object} hostname last char list
     */
    async getLastCharList(appType, reference) {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const vmGuestList = await ctx.model.models.vm_guest.findAll({
        where: {
          hostname: { [Op.like]: `%${('WCDC' + appType + reference).toUpperCase()}%` },
          status: { [Op.ne]: 'fail' },
        },
        attributes: [ 'status', 'hostname' ],
      });
      const lastCharList = [
        'a', 'b', 'c', 'd', 'e', 'f',
        'g', 'h', 'j', 'k', 'm', 'n',
        'p', 'q', 'r', 's', 't', 'u',
        'v', 'w', 'x', 'y', 'z',
      ];
      const alreadyUsedCharList = [];
      for (let i = 0; i < vmGuestList.length; i++) {
        alreadyUsedCharList.push(vmGuestList[i].hostname.charAt(vmGuestList[i].hostname.length - 1));
      }
      // 求差集
      return [ ...new Set([ ...new Set(lastCharList) ].filter(x => !new Set(alreadyUsedCharList).has(x))) ];
    }

    /**
     * @param {string} tenantId
     * @param {object} typeCount
     * @return {string[]} hostname hostname
     */
    async generateHostname(tenantId, typeCount) {
      const hostNameList = [];
      const { applicationType, hostname_prefix, requestNum } = typeCount;
      if (!hostname_prefix) return false;
      const referenceList = await this.getReferenceList(tenantId);
      if (!referenceList) return false;
      let flag = false;
      for (let i = 0; i < referenceList.length; i++) {
        const lastCharList = await this.getLastCharList(applicationType, referenceList[i]);
        for (let j = 0; j < lastCharList.length; j++) {
          const hostName = `${hostname_prefix}${applicationType}${referenceList[i]}${lastCharList[j]}`;
          hostNameList.push(hostName);
          if (hostNameList.length === requestNum) {
            flag = true;
            break;
          }
        }
        if (flag) {
          break;
        }
      }
      if (hostNameList.length < requestNum) {
        return false;
      }
      return hostNameList;
    }

    /**
     * @param {Object[]} vmList VM list
     * @return {Promise<Object[]>} typeCountList
     */
    async countByType(vmList) {
      const map = new Map();
      for (let i = 0; i < vmList.length; i++) {
        const el = vmList[i];
        const name = el.application_type ? el.application_type.code : '';
        const hostnamePrefix = el.hostnamePrefix ? el.hostnamePrefix : null;
        if (!map.get(name)) {
          map.set(name, new Map().set(hostnamePrefix, 1));
        } else {
          if (!map.get(name).get(hostnamePrefix)) {
            map.get(name).set(hostnamePrefix, 1);
          } else {
            map.get(name).set(hostnamePrefix, map.get(name).get(hostnamePrefix) + 1);
          }
        }
      }
      const res = [];
      for (const [ k, v ] of map) {
        for (const [ p, c ] of v) {
          const model = {
            applicationType: k,
            hostname_prefix: p,
            requestNum: c,
          };
          res.push(model);
        }
      }
      return res;
    }

    /**
     * @param {string} vm
     * @return {Promise<string>} hostnamePrefix
     */
    async getPrefix(vm) {
      const { ctx } = this;
      const typeId = vm.environment_type ? vm.environment_type.id : 0;
      const zoneId = vm.network_zone ? vm.network_zone.id : 0;
      const vm_type_zone_cdc = await ctx.model.models.vm_type_zone_cdc.findOne({
        where: {
          typeId,
          zoneId,
        },
      });
      const { hostname_prefix } = vm_type_zone_cdc;
      return hostname_prefix;
    }

    /**
     * @param {string} vm
     * @return {Promise<string>} hostnamePrefix
     */
    async getPrefixByTypeZone(environment_type, network_zone) {
      const { ctx } = this;
      const vm_type_zone_cdc = await ctx.model.models.vm_type_zone_cdc.findOne({
        where: {
          typeId: environment_type,
          zoneId: network_zone,
        },
      });
      const { hostname_prefix } = vm_type_zone_cdc;
      return hostname_prefix;
    }
  };
};
