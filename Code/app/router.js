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
  // router.get(`${prefix}/syncUser/list`, controller.syncUser.list);
  // router.get(`${prefix}/syncUser/detail`, controller.syncUser.detail);
  router.get(`${prefix}/syncUser/login`, controller.syncUser.login);
  // router.get(`${prefix}/tenants/list`, controller.tenants.list);
  // router.get(`${prefix}/tenants/listMapping`, controller.tenants.listMapping);

  router.get(`${prefix}/management/list`, controller.management.list);
  router.post(`${prefix}/management/create`, controller.management.create);
  router.put(`${prefix}/management/update`, controller.management.update);
  router.delete(`${prefix}/management/delete`, controller.management.delete);
  router.delete(`${prefix}/management/deleteMany`, controller.management.deleteMany);
};
