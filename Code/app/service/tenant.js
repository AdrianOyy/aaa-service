'use strict';

module.exports = app => {
  return class extends app.Service {
    // 根据用户 id 获取对应 tenant list
    /**
     * @param {number} userId Table `user`'s primary key
     * @return {Object[]} groupList user's group list
     */
    async getUserTenantList(userId) {
      const { ctx } = this;
      const userGroupMappingList = await ctx.model.models.user_group_mapping.findAll({
        where: {
          userId,
        },
        include: {
          model: ctx.model.models.ad_group,
          as: 'ad_group',
          include: {
            model: ctx.model.models.tenant,
            as: 'tenant',
          },
        },
      });
      const tenantList = [];
      if (userGroupMappingList && userGroupMappingList.length > 0) {
        userGroupMappingList.forEach(el => {
          const tenantSet = new Set();
          if (el.ad_group && el.ad_group.tenant) {
            el.ad_group.tenant.forEach(tenant => {
              if (!tenantSet.has(tenant.id)) {
                tenantSet.add(tenant.id);
                tenantList.push(tenant.dataValues);
              }
            });
          }
        });
      }
      return tenantList;
    }
  };
};

