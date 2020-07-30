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
  // router.get(`${prefix}/user/login`, controller.syncUser.login);
  // router.get(`${prefix}/tenants/list`, controller.tenants.list);
  // router.get(`${prefix}/tenants/listMapping`, controller.tenants.listMapping);


  // router.get(`${prefix}/tenantsMapping/list`, controller.tenantsMapping.list);
  // router.get(`${prefix}/tenantsMapping/detail`, controller.tenantsMapping.detail);
  // router.post(`${prefix}/tenantsMapping/create`, controller.tenantsMapping.create);
  // router.put(`${prefix}/tenantsMapping/update`, controller.tenantsMapping.update);
  // router.delete(`${prefix}/tenantsMapping/delete`, controller.tenantsMapping.delete);
  // router.delete(`${prefix}/tenantsMapping/deleteMany`, controller.tenantsMapping.deleteMany);

  router.get(`${prefix}/ad_group/list`, controller.adGroup.list);
  router.get(`${prefix}/ad_group/detail`, controller.adGroup.detail);

  router.get(`${prefix}/assign/list`, controller.assign.list);
  router.get(`${prefix}/assign/detail`, controller.assign.detail);
  router.post(`${prefix}/assign/create`, controller.assign.create);
  router.put(`${prefix}/assign/update`, controller.assign.update);
  router.delete(`${prefix}/assign/delete`, controller.assign.delete);
  router.delete(`${prefix}/assign/deleteMany`, controller.assign.deleteMany);

  router.get(`${prefix}/expiry/list`, controller.expiry.list);
  router.get(`${prefix}/expiry/detail`, controller.expiry.detail);
  router.post(`${prefix}/expiry/create`, controller.expiry.create);
  router.put(`${prefix}/expiry/update`, controller.expiry.update);
  router.delete(`${prefix}/expiry/delete`, controller.expiry.delete);
  router.delete(`${prefix}/expiry/deleteMany`, controller.expiry.deleteMany);

  router.get(`${prefix}/management/list`, controller.management.list);
  router.get(`${prefix}/management/detail`, controller.management.detail);
  router.post(`${prefix}/management/create`, controller.management.create);
  router.put(`${prefix}/management/update`, controller.management.update);
  router.delete(`${prefix}/management/delete`, controller.management.delete);
  router.delete(`${prefix}/management/deleteMany`, controller.management.deleteMany);

  router.get(`${prefix}/role/list`, controller.role.list);
  router.get(`${prefix}/role/detail`, controller.role.detail);

  router.get(`${prefix}/tenant/list`, controller.tenant.list);
  router.get(`${prefix}/tenant/detail`, controller.tenant.detail);

  router.get(`${prefix}/tenant_group_mapping/list`, controller.tenantGroupMapping.list);
  router.get(`${prefix}/tenant_group_mapping/detail`, controller.tenantGroupMapping.detail);
  router.post(`${prefix}/tenant_group_mapping/create`, controller.tenantGroupMapping.create);
  router.put(`${prefix}/tenant_group_mapping/update`, controller.tenantGroupMapping.update);
  router.delete(`${prefix}/tenant_group_mapping/delete`, controller.tenantGroupMapping.delete);
  router.delete(`${prefix}/tenant_group_mapping/deleteMany`, controller.tenantGroupMapping.deleteMany);

  router.get(`${prefix}/user/list`, controller.user.list);
  router.get(`${prefix}/user/detail`, controller.user.detail);
  router.post(`${prefix}/user/login`, controller.user.login);

  router.get(`${prefix}/user_gourp_mapping/list`, controller.userGourpMapping.list);
  router.get(`${prefix}/user_gourp_mapping/detail`, controller.userGourpMapping.detail);
  router.post(`${prefix}/user_gourp_mapping/create`, controller.userGourpMapping.create);
  router.put(`${prefix}/user_gourp_mapping/update`, controller.userGourpMapping.update);
  router.delete(`${prefix}/user_gourp_mapping/delete`, controller.userGourpMapping.delete);
  router.delete(`${prefix}/user_gourp_mapping/deleteMany`, controller.userGourpMapping.deleteMany);
};
