'use strict';

module.exports = app => {
  return class extends app.Service {
    async getDC(typeId, zoneId) {
      const { ctx } = this;
      const mapping = await ctx.model.models.vm_type_zone_cdc.findOne({
        where: {
          typeId,
          zoneId,
        },
      });
      if (!mapping) return false;
      return mapping.CDCId;
    }
  };
};
