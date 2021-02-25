'use strict';

module.exports = app => {
  return class extends app.Controller {
    async verifyQuota() {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const { workflowId, formKey, version } = ctx.query;
      const formId = await ctx.service.dynamicForm.getFormIdByPid(formKey, version, workflowId);
      if (!formId) {
        ctx.success({ pass: false });
        return;
      }
      const dynamicFormDetail = await ctx.service.dynamicForm.getDetailByKey(formKey, version, formId);
      if (!dynamicFormDetail) {
        ctx.success({ pass: false });
        return;
      }
      const { childTable, tenant } = dynamicFormDetail;
      const tenantId = tenant.id;
      const year = new Date().getFullYear();
      const requestMap = new Map();
      const typeSet = new Set();
      for (const child of childTable) {
        const { platform: { name } } = child;
        requestMap.set(name, requestMap.get(name) ? requestMap.get(name) + 1 : 1);
        typeSet.add(name);
      }
      const tenantQuotaMappingList = await ctx.model.models.tenant_quota_mapping.findAll({
        where: {
          type: { [ Op.in ]: [ ...typeSet ] },
          year,
          tenantId,
        },
      });
      let pass = true;
      const tenantQuotaMappingIdList = [];
      for (const tenantQuotaMapping of tenantQuotaMappingList) {
        const { id } = tenantQuotaMapping;
        tenantQuotaMappingIdList.push(id);
      }
      const historyList = await ctx.model.models.resource_request_history.findAll({
        where: {
          tenantQuotaMappingId: { [Op.in]: tenantQuotaMappingIdList },
          status: { [Op.or]: [ 'success', 'pending' ] },
        },
      });
      const historyMap = new Map();
      for (const history of historyList) {
        const { tenantQuotaMappingId, requestNum } = history;
        historyMap.set(tenantQuotaMappingId, historyMap.get(tenantQuotaMappingId) ? historyMap.get(tenantQuotaMappingId) + requestNum : requestNum);
      }
      for (const tenantQuotaMapping of tenantQuotaMappingList) {
        const { type, quota, id } = tenantQuotaMapping;
        const remain = quota - historyMap.get(id) - requestMap.get(type);
        if (remain < 0) {
          pass = false;
          break;
        }
      }
      ctx.success({ pass });
      // 最后才更新资源
      const modelList = [];
      for (const tenantQuotaMapping of tenantQuotaMappingList) {
        const { id, type } = tenantQuotaMapping;
        const model = {
          workflowId,
          tenantQuotaMappingId: id,
          status: 'pending',
          requestNum: requestMap.get(type),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        modelList.push(model);
      }
      ctx.model.models.resource_request_history.bulkCreate(modelList);
    }
  };
};
