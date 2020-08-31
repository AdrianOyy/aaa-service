'use strict';

module.exports = app => {
  return class extends app.Service {
    /**
     *
     * @param {number} tenantId Table tenant primary key
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
      return reference;
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
      const res = [ ...new Set([ ...new Set(lastCharList) ].filter(x => !new Set(alreadyUsedCharList).has(x))) ];
      return res;
    }

    /**
     * @param {string} tenantId
     * @param {string} applicationType
     * @param {number} requestNum
     * @return {string[]} hostname hostname
     */
    async generateHostname(tenantId, applicationType, requestNum) {
      const referenceList = await this.getReferenceList(tenantId);
      if (!referenceList) return false;
      const hostNameList = [];
      let flag = false;
      for (let i = 0; i < referenceList.length; i++) {
        const lastCharList = await this.getLastCharList(applicationType, referenceList[i]);
        for (let j = 0; j < lastCharList.length; j++) {
          const hostName = `WCDC${applicationType}${referenceList[i].windows_vm_hostname_reference}${lastCharList[j]}`;
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
      vmList.forEach(el => {
        if (el.application_type) {
          const name = el.application_type.name ? el.application_type.name : '';
          if (!map.get(name)) {
            map.set(name, 1);
          } else {
            map.set(name, map.get(name) + 1);
          }
        }
      });
      const res = [];
      for (const [ k, v ] of map) {
        const model = {
          applicationType: k,
          requestNum: v,
        };
        res.push(model);
      }
      return res;
    }
  };
};
