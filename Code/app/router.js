'use strict';
// const path = require('path');

module.exports = app => {
  const { router, controller } = app;
  const prefix = app.config.prefix;


  router.get(`${prefix}/ad_group/list`, controller.adGroup.list);
  router.get(`${prefix}/ad_group/detail`, controller.adGroup.detail);
  router.post(`${prefix}/ad_group/create`, controller.adGroup.create);
  router.put(`${prefix}/ad_group/update`, controller.adGroup.update);
  router.delete(`${prefix}/ad_group/delete`, controller.adGroup.delete);
  router.delete(`${prefix}/ad_group/deleteMany`, controller.adGroup.deleteMany);
  router.get(`${prefix}/ad_group/checkName`, controller.adGroup.checkName);

  router.get(`${prefix}/vm_location/detail`, controller.vmLocation.detail);
  router.post(`${prefix}/vm_location/create`, controller.vmLocation.create);

  router.get(`${prefix}/assign/list`, controller.assign.list);
  router.get(`${prefix}/assign/detail`, controller.assign.detail);
  router.post(`${prefix}/assign/create`, controller.assign.create);
  router.put(`${prefix}/assign/update`, controller.assign.update);
  router.delete(`${prefix}/assign/delete`, controller.assign.delete);
  router.delete(`${prefix}/assign/deleteMany`, controller.assign.deleteMany);
  router.get(`${prefix}/assign/checkExist`, controller.assign.checkExist);
  router.get(`${prefix}/assign/handledList`, controller.assign.handledList);

  router.get(`${prefix}/expiry/list`, controller.expiry.list);
  router.get(`${prefix}/expiry/detail`, controller.expiry.detail);
  router.post(`${prefix}/expiry/create`, controller.expiry.create);
  router.put(`${prefix}/expiry/update`, controller.expiry.update);
  router.delete(`${prefix}/expiry/delete`, controller.expiry.delete);
  router.delete(`${prefix}/expiry/deleteMany`, controller.expiry.deleteMany);
  router.get(`${prefix}/expiry/checkExist`, controller.expiry.checkExist);

  router.get(`${prefix}/management/list`, controller.management.list);
  router.get(`${prefix}/management/detail`, controller.management.detail);
  router.post(`${prefix}/management/create`, controller.management.create);
  router.put(`${prefix}/management/update`, controller.management.update);
  router.delete(`${prefix}/management/delete`, controller.management.delete);
  router.delete(`${prefix}/management/deleteMany`, controller.management.deleteMany);
  router.get(`${prefix}/management/checkExist`, controller.management.checkExist);


  router.get(`${prefix}/role/list`, controller.role.list);
  router.get(`${prefix}/role/detail`, controller.role.detail);
  router.put(`${prefix}/role/update`, controller.role.update);
  router.post(`${prefix}/role/create`, controller.role.create);
  router.delete(`${prefix}/role/deleteMany`, controller.role.deleteMany);
  router.get(`${prefix}/role/checkLabel`, controller.role.checkLabel);

  router.get(`${prefix}/tenant/list`, controller.tenant.list);
  router.get(`${prefix}/tenant/detail`, controller.tenant.detail);
  router.put(`${prefix}/tenant/update`, controller.tenant.update);
  router.post(`${prefix}/tenant/create`, controller.tenant.create);
  router.delete(`${prefix}/tenant/deleteMany`, controller.tenant.deleteMany);
  router.get(`${prefix}/tenant/checkName`, controller.tenant.checkName);

  router.get(`${prefix}/tenant_group_mapping/list`, controller.tenantGroupMapping.list);
  router.get(`${prefix}/tenant_group_mapping/detail`, controller.tenantGroupMapping.detail);
  router.post(`${prefix}/tenant_group_mapping/create`, controller.tenantGroupMapping.create);
  router.put(`${prefix}/tenant_group_mapping/update`, controller.tenantGroupMapping.update);
  router.delete(`${prefix}/tenant_group_mapping/delete`, controller.tenantGroupMapping.delete);
  router.delete(`${prefix}/tenant_group_mapping/deleteMany`, controller.tenantGroupMapping.deleteMany);
  router.get(`${prefix}/tenant_group_mapping/checkExist`, controller.tenantGroupMapping.checkExist);
  router.get(`${prefix}/tenant_group_mapping/handledList`, controller.tenantGroupMapping.handledList);

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
