'use strict';
const sequelizeFixtures = require('sequelize-fixtures');

class AppBootHook {
  constructor(app) {
    this.app = app;
  }
  configWillLoad() {
    console.time();
    const { app } = this;
    console.log(new Date(), '\tConfigure will load...');
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
  }

  async didLoad() {
    console.log(new Date(), '\tConfigure Loaded...');
    const { app } = this;
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
    console.log(new Date(), '\tSyncing model start');
    console.log('=============================================================================================================');
    for (const syncModel of syncModels) {
      console.log(new Date(), '\tNow: ', syncModel);
      await app.model.models[syncModel].sync();
    }
    console.log('=============================================================================================================');
    console.log(new Date(), '\tSyncing model end');


    // 初始化数据
    const model = app.model.models;
    const fixturesPath = 'app/model/fixtures/';
    console.log(new Date(), '\tInitializing database start ');
    console.log('=============================================================================================================');
    const initModels = [
      'dynamicForm', 'dynamicFormDetail', 'group', 'inventoryStatus',
      'equipType', 'account_type', 'apply_for', 'apply_for_internet',
      'authentication_method', 'clinical_applications', 'is_same',
      'non_clinical_applications', 'owa_webmail', 'staff_type',
      'yes_no', 'role',
    ];
    for (const initModel of initModels) {
      if (!await model[initModel].findOne()) {
        console.log(new Date(), `\tNow: ${initModel}`);
        await sequelizeFixtures.loadFile(fixturesPath + initModel + '.js', model);
      }
    }
    console.log('=============================================================================================================');
    console.log(new Date(), '\tInitializing Database end ');
    console.log('\n');
  }

  async willReady() {
    console.log(new Date(), '\tAPP will ready...');
  }

  async serverDidReady() {
    console.log(new Date(), '\tAPP readied!');
    console.timeEnd();
  }
}

module.exports = AppBootHook;
