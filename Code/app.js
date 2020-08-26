'use strict';
const sequelizeFixtures = require('sequelize-fixtures');

module.exports = app => {
  app.beforeStart(async function() {
    // 同步模型
    const syncModels = [
      'ad_group', 'role', 'tenant', 'user', 'user_group_mapping',
      'tenant_group_mapping', 'assign', 'expiry', 'tenant_quota_mapping', 'vm_location',
      'vm_cluster', 'vm_master', 'vm_guest',
      'vm_applicationType', 'vm_cdc', 'vm_zone',
      'vm_platform', 'vm_type', 'vm_cluster_applicationType',
      'vm_platform_applicationType', 'vm_type_zone_cdc',
      'resource_request_history', 'dynamicForm', 'dynamicFormDetail',
      'tenant_hostname_reference', 'group', 'ip_assignment',
    ];
    for (const syncModel of syncModels) {
      await app.model.models[syncModel].sync();
    }
    // 初始化数据
    const model = app.model.models;
    const fixturesPath = 'app/model/fixtures/';
    if (!await model.group.findOne()) {
      await sequelizeFixtures.loadFile(fixturesPath + 'group.js', model);
    }
  });
};
