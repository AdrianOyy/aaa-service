'use strict';
// const path = require('path');

module.exports = app => {
  const { router, controller } = app;

  // 中间件
  const { baseDir, bucket } = app.config.upload;
  const saveFile = app.middleware.upload({ baseDir, bucket });

  router.get('/workflow/list', controller.workflow.list);
  router.post('/workflow/upload', saveFile, controller.workflow.upload);
  router.get('/syncUser/list', controller.syncUser.list);
  router.get('/tenants/list', controller.tenants.list);
  router.get('/tenants/listMapping', controller.tenants.listMapping);
};
