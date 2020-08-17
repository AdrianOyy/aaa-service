'use strict';
// const sequelizeFixtures = require('sequelize-fixtures');

module.exports = app => {
  app.beforeStart(async function() {
    // 同步模型
    const syncModels = [
      'ad_group', 'role', 'tenant', 'user', 'user_gourp_mapping',
      'tenant_group_mapping', 'assign', 'expiry', 'tenant_quota_mapping', 'vm_location',
    ];
    for (const syncModel of syncModels) {
      await app.model.models[syncModel].sync();
    }
    // 初始化数据
  });
};
