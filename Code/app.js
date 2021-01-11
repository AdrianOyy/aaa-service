'use strict';
const sequelizeFixtures = require('sequelize-fixtures');

module.exports = app => {
  app.beforeStart(async function() {
    // 同步模型
    console.log('DB host:\t\t\t\t', app.config.sequelize.datasources[0].host);
    console.log('DB port:\t\t\t\t', app.config.sequelize.datasources[0].port);
    console.log('using DB:\t\t\t\t', app.config.sequelize.datasources[0].database);
    console.log('using procedure DB:\t\t\t', app.config.sequelize.datasources[1].database);
    console.log('using procedure function:\t\t', app.config.procedure.fnName);
    console.log('\n');
    const syncModels = [
      'ad_group', 'groupType', 'role', 'group', 'tenant', 'user', 'user_group_mapping',
      'tenant_group_mapping', 'assign', 'expiry', 'tenant_quota_mapping', 'vm_location',
      'vm_cluster', 'vm_master', 'vm_guest',
      'vm_applicationType', 'vm_cdc', 'vm_zone',
      'vm_platform_type', 'vm_platform', 'vm_type', 'vm_cluster_applicationType',
      'vm_platform_applicationType', 'vm_type_zone_cdc',
      'resource_request_history', 'dynamicForm', 'dynamicFormDetail', 'vm_cluster_dc_mapping',
      'tenant_hostname_reference', 'ip_assignment', 'inventoryStatus', 'equipType',
      'inventory', 'server', 'policy', 'equipmentPort', 'portAssignment', 'power', 'powerInput',
      'powerOutput', 'inventoryLifeCycle', 'clinical_group',
      'account_type', 'apply_for', 'apply_for_internet', 'authentication_method', 'clinical_applications',
      'is_same', 'owa_webmail', 'yes_no', 'staff_type', 'non_clinical_applications',
    ];
    console.log('Start syncing model');
    console.log('=============================================');
    for (const syncModel of syncModels) {
      console.log('Now: ', syncModel);
      await app.model.models[syncModel].sync();
    }
    console.log('=============================================');
    console.log('End syncing model');
    console.log('\n');
    // 初始化数据
    const model = app.model.models;
    const fixturesPath = 'app/model/fixtures/';
    console.log('Start initializing database');
    console.log('=============================================');
    if (!await model.group.findOne()) {
      console.log('Now: group');
      await sequelizeFixtures.loadFile(fixturesPath + 'group.js', model);
    }
    if (!await model.vm_platform_type.findOne()) {
      console.log('Now: vm_platform_type');
      await sequelizeFixtures.loadFile(fixturesPath + 'vm_platform_type.js', model);
    }
    if (!await model.inventoryStatus.findOne()) {
      console.log('Now: inventoryStatus');
      await sequelizeFixtures.loadFile(fixturesPath + 'inventoryStatus.js', model);
    }
    if (!await model.equipType.findOne()) {
      console.log('Now: equipType');
      await sequelizeFixtures.loadFile(fixturesPath + 'equipType.js', model);
    }
    if (!await model.vm_cdc.findOne()) {
      console.log('Now: vm_cdc');
      await sequelizeFixtures.loadFile(fixturesPath + 'vm_cdc.js', model);
    }
    if (!await model.account_type.findOne()) {
      console.log('Now: account_type');
      await sequelizeFixtures.loadFile(fixturesPath + 'account_type.js', model);
    }
    if (!await model.role.findOne()) {
      console.log('Now: role');
      await sequelizeFixtures.loadFile(fixturesPath + 'role.js', model);
    }
    console.log('=============================================');
    console.log('End initializing database');
  });
};
