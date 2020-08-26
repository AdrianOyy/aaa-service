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
     * @returns {Object} hostname last char list
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
  };
};