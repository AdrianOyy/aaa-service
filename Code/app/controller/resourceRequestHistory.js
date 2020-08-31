'use strict';

module.exports = app => {
  return class extends app.Controller {
    async verifyQuota() {
      const { ctx } = this;
      const { tenantId, year, type, requestNum } = ctx.query;
      if (!tenantId || !year || !type || !requestNum) ctx.error();
      const tenantQuota = await ctx.model.models.tenant_quota_mapping.findOne({
        where: {
          tenantId,
          type,
          year,
        },
      });
      if (!tenantQuota) {
        ctx.success({ pass: false });
      } else {
        const { id, quota } = tenantQuota;
        const history = await app.model.query(`select SUM(requestNum) AS 'total' from resource_request_history WHERE tenantQuotaMappingId = ${id} AND success = true GROUP BY tenantQuotaMappingId`);
        if (!history[0].length) ctx.success({ pass: false });
        else {
          const { total } = history[0][0];
          if (parseInt(total) + parseInt(requestNum) <= quota) {
            ctx.success({ pass: true });
          } else {
            ctx.success({ pass: false });
          }

        }
      }
    }
  };
};
