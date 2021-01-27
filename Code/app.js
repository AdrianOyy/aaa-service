'use strict';
const sequelizeFixtures = require('sequelize-fixtures');

module.exports = app => {
  app.beforeStart(async function() {
    // 输入配置信息
    console.log('\n');
    console.log('Configure:');
    console.log('=============================================================================================================');
    console.log('DB host:\t\t\t\t', app.config.sequelize.datasources[0].host);
    console.log('DB port:\t\t\t\t', app.config.sequelize.datasources[0].port);
    console.log('Using DB:\t\t\t\t', app.config.sequelize.datasources[0].database);
    console.log('Using procedure DB:\t\t\t', app.config.sequelize.datasources[1].database);
    console.log('Using procedure function:\t\t', app.config.procedure.fnName);
    console.log('Workflow service config:\n', app.config.activiti);
    console.log('Transition service config:\n', app.config.log);
    console.log('Outbound config:\n', app.config.outbound);
    console.log('AD service config:\n', app.config.adService);
    console.log('CPS service config:\n', app.config.cps);
    console.log('CUID service config:\n', app.config.cuid);
    console.log('Token config:\n', app.config.jwt);
    console.log('Load flag:\t\t\t\t', app.config.loadUser.loadFlag);
    console.log('Load cron:\t\t\t\t', app.config.loadUser.cron);
    console.log('Imap config:\n', app.config.imap);
    console.log('Mail host:\t\t\t\t', app.config.mailer.host);
    console.log('Mail port:\t\t\t\t', app.config.mailer.port);
    console.log('=============================================================================================================');
    console.log('\n');
    // 同步模型
    const syncModels = [
      'ad_group', 'groupType', 'role', 'group', 'tenant', 'user', 'user_group_mapping',
      'expiry', 'tenant_quota_mapping', 'vm_location',
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
    if (!await model.dynamicForm.findOne()) {
      console.log('Now: dynamicForm');
      await sequelizeFixtures.loadFile(fixturesPath + 'dynamicForm.js', model);
    }
    if (!await model.dynamicFormDetail.findOne()) {
      console.log('Now: dynamicFormDetail');
      await sequelizeFixtures.loadFile(fixturesPath + 'dynamicFormDetail.js', model);
    }
    if (!await model.group.findOne()) {
      console.log('Now: group');
      await sequelizeFixtures.loadFile(fixturesPath + 'group.js', model);
    }
    // if (!await model.vm_platform_type.findOne()) {
    //   console.log('Now: vm_platform_type');
    //   await sequelizeFixtures.loadFile(fixturesPath + 'vm_platform_type.js', model);
    // }
    if (!await model.inventoryStatus.findOne()) {
      console.log('Now: inventoryStatus');
      await sequelizeFixtures.loadFile(fixturesPath + 'inventoryStatus.js', model);
    }
    if (!await model.equipType.findOne()) {
      console.log('Now: equipType');
      await sequelizeFixtures.loadFile(fixturesPath + 'equipType.js', model);
    }
    // if (!await model.vm_cdc.findOne()) {
    //   console.log('Now: vm_cdc');
    //   await sequelizeFixtures.loadFile(fixturesPath + 'vm_cdc.js', model);
    // }
    if (!await model.account_type.findOne()) {
      console.log('Now: account_type');
      await sequelizeFixtures.loadFile(fixturesPath + 'account_type.js', model);
    }
    if (!await model.apply_for.findOne()) {
      console.log('Now: apply_for');
      await sequelizeFixtures.loadFile(fixturesPath + 'apply_for.js', model);
    }
    if (!await model.apply_for_internet.findOne()) {
      console.log('Now: apply_for_internet');
      await sequelizeFixtures.loadFile(fixturesPath + 'apply_for_internet.js', model);
    }
    if (!await model.authentication_method.findOne()) {
      console.log('Now: authentication_method');
      await sequelizeFixtures.loadFile(fixturesPath + 'authentication_method.js', model);
    }
    if (!await model.clinical_applications.findOne()) {
      console.log('Now: clinical_applications');
      await sequelizeFixtures.loadFile(fixturesPath + 'clinical_applications.js', model);
    }
    if (!await model.is_same.findOne()) {
      console.log('Now: is_same');
      await sequelizeFixtures.loadFile(fixturesPath + 'is_same.js', model);
    }
    if (!await model.non_clinical_applications.findOne()) {
      console.log('Now: non_clinical_applications');
      await sequelizeFixtures.loadFile(fixturesPath + 'non_clinical_applications.js', model);
    }
    if (!await model.owa_webmail.findOne()) {
      console.log('Now: owa_webmail');
      await sequelizeFixtures.loadFile(fixturesPath + 'owa_webmail.js', model);
    }
    if (!await model.staff_type.findOne()) {
      console.log('Now: staff_type');
      await sequelizeFixtures.loadFile(fixturesPath + 'staff_type.js', model);
    }
    if (!await model.yes_no.findOne()) {
      console.log('Now: yes_no');
      await sequelizeFixtures.loadFile(fixturesPath + 'yes_no.js', model);
    }
    if (!await model.role.findOne()) {
      console.log('Now: role');
      await sequelizeFixtures.loadFile(fixturesPath + 'role.js', model);
    }
    console.log('=============================================');
    console.log('End initializing database');
    console.log('\n');
  });
};
