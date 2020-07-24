'use strict';
const sequelizeFixtures = require('sequelize-fixtures');

module.exports = app => {
  app.beforeStart(async function() {
    // 同步模型
    const syncModels = [
      'tenants', 'tenantsMapping', 'syncUser', 'management',
    ];
    for (const syncModel of syncModels) {
      await app.model.models[syncModel].sync();
    }
    // 初始化数据
    const model = app.model.models;
    const fixturesPath = 'app/model/fixtures/';
    if (!await model.tenants.findOne()) {
      await sequelizeFixtures.loadFile(fixturesPath + 'tenants.js', model);
    }
    if (!await model.tenantsMapping.findOne()) {
      await sequelizeFixtures.loadFile(fixturesPath + 'tenantsMapping.js', model);
    }
    if (!await model.syncUser.findOne()) {
      await sequelizeFixtures.loadFile(fixturesPath + 'syncUser.js', model);
    }
    if (!await model.management.findOne()) {
      await sequelizeFixtures.loadFile(fixturesPath + 'management.js', model);
    }
  });
};
