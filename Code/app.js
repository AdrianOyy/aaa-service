'use strict';
const sequelizeFixtures = require('sequelize-fixtures');

module.exports = app => {
  app.beforeStart(async function() {
    // 同步模型
    const syncModels = [
      'ad_group', 'role', 'group', 'tenant', 'user', 'user_group_mapping',
      'tenant_group_mapping', 'assign', 'expiry', 'tenant_quota_mapping', 'vm_location',
      'vm_cluster', 'vm_master', 'vm_guest',
      'vm_applicationType', 'vm_cdc', 'vm_zone',
      'vm_platform_type', 'vm_platform', 'vm_type', 'vm_cluster_applicationType',
      'vm_platform_applicationType', 'vm_type_zone_cdc',
      'resource_request_history', 'dynamicForm', 'dynamicFormDetail', 'vm_cluster_dc_mapping',
      'tenant_hostname_reference', 'ip_assignment', 'inventoryStatus', 'inventory',
      'policy', 'equipmentPort', 'portAssignment', 'power', 'powerInput', 'powerOutput',
      'equipType', 'inventoryLifeCycle',
    ];
    console.log('=============================================');
    console.log('Start syncing model');
    for (const syncModel of syncModels) {
      console.log('Now: ', syncModel);
      await app.model.models[syncModel].sync();
    }
    console.log('End syncing model');
    console.log('=============================================');
    // 初始化数据
    const model = app.model.models;
    const fixturesPath = 'app/model/fixtures/';
    if (!await model.group.findOne()) {
      await sequelizeFixtures.loadFile(fixturesPath + 'group.js', model);
    }
    if (!await model.vm_platform_type.findOne()) {
      await sequelizeFixtures.loadFile(fixturesPath + 'vm_platform_type.js', model);
    }
    if (!await model.inventoryStatus.findOne()) {
      await sequelizeFixtures.loadFile(fixturesPath + 'inventoryStatus.js', model);
    }
    if (!await model.equipType.findOne()) {
      await sequelizeFixtures.loadFile(fixturesPath + 'equipType.js', model);
    }
  });
};
