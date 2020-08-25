'use strict';

module.exports = app => {
  return class extends app.Controller {
    async getReferenceList() {
      const { ctx } = this;
      const { tenantId } = ctx.query;
      if (!tenantId) ctx.error();
      const referenceList = await ctx.service.hostname.getReferenceList(tenantId);
      ctx.success(referenceList ? referenceList : []);
    }

    async getHostNameLastCharList() {
      const { ctx } = this;
      const { appType, reference } = ctx.query;
      if (!appType || !reference) ctx.error();
      const lastCharList = await ctx.service.hostname.getLastCharList(appType, reference);
      ctx.success(lastCharList ? lastCharList : []);
    }

    async generateHostname() {
      const { ctx } = this;
      const { tenantId, applicationType } = ctx.query;
      if (!tenantId || !applicationType) ctx.error();
      const referenceList = await ctx.service.hostname.getReferenceList(tenantId);
      if (!referenceList) ctx.success([]);
      else {
        let lastCharList = [];
        let refIndex = 0;
        for (let i = 0; i < referenceList.length; i++) {
          const temp = await ctx.service.hostname.getLastCharList(applicationType, referenceList[i]);
          if (temp.length > 0) {
            lastCharList = temp;
            refIndex = i;
            break;
          }
        }
        ctx.success(
          lastCharList.length === 0
            ? undefined
            : `WCDC${applicationType}${referenceList[refIndex].windows_vm_hostname_reference}${lastCharList[0]}`
        );
      }
    }
  };
};

