'use strict';
// const path = require('path');

module.exports = app => {
  const { router, controller } = app;
  const prefix = app.config.prefix;

  // 中间件
  // const { baseDir, bucket } = app.config.upload;
  // const saveFile = app.middleware.upload({ baseDir, bucket });

  router.get(`${prefix}/syncUser/list`, controller.syncUser.list);
  router.get(`${prefix}/syncUser/detail`, controller.syncUser.detail);
  router.get(`${prefix}/syncUser/sync`, controller.syncUser.sync);
  router.get(`${prefix}/tenants/list`, controller.tenants.list);
  router.post(`${prefix}/tenants/create`, controller.tenants.create);
  router.put(`${prefix}/tenants/update`, controller.tenants.update);
  router.delete(`${prefix}/tenants/delete`, controller.tenants.delete);
  router.delete(`${prefix}/tenants/deleteMany`, controller.tenants.deleteMany);

  router.get(`${prefix}/management/list`, controller.management.list);
  router.post(`${prefix}/management/create`, controller.management.create);
  router.put(`${prefix}/management/update`, controller.management.update);
  router.delete(`${prefix}/management/delete`, controller.management.delete);
  router.delete(`${prefix}/management/deleteMany`, controller.management.deleteMany);
};
