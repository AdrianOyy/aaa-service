'use strict';
// const path = require('path');

module.exports = app => {
  const { router, controller } = app;
  const prefix = app.config.prefix;

  // 中间件
  // const { baseDir, bucket } = app.config.upload;
  // const saveFile = app.middleware.upload({ baseDir, bucket });

  // router.get(`${prefix}/workflow/list`, controller.workflow.list);
  // router.post(`${prefix}/workflow/upload`, saveFile, controller.workflow.upload);
  router.get(`${prefix}/syncUser/list`, controller.syncUser.list);
  router.get(`${prefix}/syncUser/sync`, controller.syncUser.sync);
  router.get(`${prefix}/tenants/list`, controller.tenants.list);
  router.get(`${prefix}/tenants/listMapping`, controller.tenants.listMapping);
};
