'use strict';

module.exports = app => {
  return class extends app.Service {
    /**
     * zoon 等于Intranet typeId等于Production size小于等于500 返回HCI
     * 否则VMWare
     * @param {*} zoonId vm_zone id
     * @param {*} typeId vm_type id
     * @param {*} size 大小
     */
    async defineVMType(zoonId, typeId, size) {
      const { ctx } = this;
      let VMType = null;
      if (!zoonId || !typeId || !size || size < 0) {
        return VMType;
      }
      const vm_zone = await ctx.model.models.vm_zone.findOne({
        raw: true,
        where: {
          id: zoonId,
        },
      });

      const vm_type = await ctx.model.models.vm_type.findOne({
        raw: true,
        where: {
          id: typeId,
        },
      });
      if (vm_zone != null && vm_type != null && size != null) {
        VMType = 'VMWare';
        if (vm_zone.name.trim() === 'Intranet' && vm_type.name.trim() === 'Production' && size <= 500) {
          VMType = 'HCI';
        }
      }

      return VMType;
    }
  };
};
