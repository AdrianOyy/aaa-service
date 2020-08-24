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

  router.get(`${prefix}/tenant_quota_mapping/list`, controller.tenantQuotaMapping.list);
  router.get(`${prefix}/tenant_quota_mapping/detail`, controller.tenantQuotaMapping.detail);
  router.post(`${prefix}/tenant_quota_mapping/create`, controller.tenantQuotaMapping.create);
  router.put(`${prefix}/tenant_quota_mapping/update`, controller.tenantQuotaMapping.update);
  router.delete(`${prefix}/tenant_quota_mapping/delete`, controller.tenantQuotaMapping.delete);
  router.delete(`${prefix}/tenant_quota_mapping/deleteMany`, controller.tenantQuotaMapping.deleteMany);
  router.get(`${prefix}/tenant_quota_mapping/checkTypeExist`, controller.tenantQuotaMapping.checkTypeExist);
  router.get(`${prefix}/tenant_quota_mapping/checkYearExist`, controller.tenantQuotaMapping.checkYearExist);
  router.get(`${prefix}/tenant_quota_mapping/checkRequest`, controller.tenantQuotaMapping.checkRequest);


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
  router.get(`${prefix}/tenant/checkExist`, controller.tenant.checkExist);

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

  router.get(`${prefix}/user_group_mapping/list`, controller.userGourpMapping.list);
  router.get(`${prefix}/user_group_mapping/detail`, controller.userGourpMapping.detail);
  router.post(`${prefix}/user_group_mapping/create`, controller.userGourpMapping.create);
  router.put(`${prefix}/user_group_mapping/update`, controller.userGourpMapping.update);
  router.delete(`${prefix}/user_group_mapping/delete`, controller.userGourpMapping.delete);
  router.delete(`${prefix}/user_group_mapping/deleteMany`, controller.userGourpMapping.deleteMany);

  router.get(`${prefix}/resource_request_history/verifyQuota`, controller.resourceRequestHistory.verifyQuota);

  router.get(`${prefix}/vm/listApplicationType`, controller.vm.listApplicationType);
  router.get(`${prefix}/vm/listCDC`, controller.vm.listCDC);
  router.get(`${prefix}/vm/listClusterApplicationType`, controller.vm.listClusterApplicationType);
  router.get(`${prefix}/vm/listPlatform`, controller.vm.listPlatform);
  router.get(`${prefix}/vm/listPlatformApplicationType`, controller.vm.listPlatformApplicationType);
  router.get(`${prefix}/vm/listType`, controller.vm.listType);
  router.get(`${prefix}/vm/listTypeZoneCDC`, controller.vm.listTypeZoneCDC);
  router.get(`${prefix}/vm/listZone`, controller.vm.listZone);

  router.post(`${prefix}/dynamicForm/create`, controller.dynamicForm.create);
  router.post(`${prefix}/dynamicForm/save`, controller.dynamicForm.save);
  router.get(`${prefix}/dynamicForm/test`, controller.dynamicForm.test);
  router.get(`${prefix}/dynamicForm/getDetailByKey`, controller.dynamicForm.getDetailByKey);
  router.get(`${prefix}/dynamicForm/getDynamicForm`, controller.dynamicForm.getDynamicForm);
  router.get(`${prefix}/dynamicForm/verifApplicationType`, controller.dynamicForm.verifApplicationType);
  router.get(`${prefix}/dynamicForm/getDynamicFormDetail`, controller.dynamicForm.getDynamicFormDetail);

  router.get(`${prefix}/platform/list`, controller.platform.list);
  router.get(`${prefix}/platform/detail`, controller.platform.detail);
  router.put(`${prefix}/platform/update`, controller.platform.update);
  router.post(`${prefix}/platform/create`, controller.platform.create);
  router.delete(`${prefix}/platform/deleteMany`, controller.platform.deleteMany);
  router.get(`${prefix}/platform/checkName`, controller.platform.checkName);
};
