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

  router.get(`${prefix}/group/list`, controller.group.list);

  router.get(`${prefix}/vm_location/detail`, controller.vmLocation.detail);
  router.post(`${prefix}/vm_location/create`, controller.vmLocation.create);

  router.get(`${prefix}/expiry/list`, controller.expiry.list);
  router.get(`${prefix}/expiry/detail`, controller.expiry.detail);
  router.post(`${prefix}/expiry/create`, controller.expiry.create);
  router.put(`${prefix}/expiry/update`, controller.expiry.update);
  router.delete(`${prefix}/expiry/delete`, controller.expiry.delete);
  router.delete(`${prefix}/expiry/deleteMany`, controller.expiry.deleteMany);
  router.get(`${prefix}/expiry/checkExist`, controller.expiry.checkExist);
  // router.get(`${prefix}/expiry/checkUser`, controller.expiry.checkUser);

  router.get(`${prefix}/tenant_quota_mapping/list`, controller.tenantQuotaMapping.list);
  router.get(`${prefix}/tenant_quota_mapping/detail`, controller.tenantQuotaMapping.detail);
  router.post(`${prefix}/tenant_quota_mapping/create`, controller.tenantQuotaMapping.create);
  router.put(`${prefix}/tenant_quota_mapping/update`, controller.tenantQuotaMapping.update);
  router.delete(`${prefix}/tenant_quota_mapping/delete`, controller.tenantQuotaMapping.delete);
  router.delete(`${prefix}/tenant_quota_mapping/deleteMany`, controller.tenantQuotaMapping.deleteMany);
  router.get(`${prefix}/tenant_quota_mapping/checkExist`, controller.tenantQuotaMapping.checkExist);
  router.get(`${prefix}/tenant_quota_mapping/checkRequest`, controller.tenantQuotaMapping.checkRequest);
  router.put(`${prefix}/tenant_quota_mapping/quotaDeduction`, controller.tenantQuotaMapping.quotaDeduction);
  router.delete(`${prefix}/tenant_quota_mapping/deleteHistory`, controller.tenantQuotaMapping.deleteHistory);

  router.get(`${prefix}/tenant/list`, controller.tenant.list);
  router.get(`${prefix}/tenant/detail`, controller.tenant.detail);
  router.put(`${prefix}/tenant/update`, controller.tenant.update);
  router.post(`${prefix}/tenant/create`, controller.tenant.create);
  router.delete(`${prefix}/tenant/deleteMany`, controller.tenant.deleteMany);
  router.get(`${prefix}/tenant/checkExist`, controller.tenant.checkExist);
  router.get(`${prefix}/tenant/getCps`, controller.tenant.getCps);
  router.get(`${prefix}/tenant/testCps`, controller.tenant.testCps);

  router.get(`${prefix}/user/list`, controller.user.list);
  router.get(`${prefix}/user/detail`, controller.user.detail);
  router.post(`${prefix}/user/login`, controller.user.login);
  router.post(`${prefix}/AAA/user/login`, controller.user.login);
  router.post(`${prefix}/user/findUser`, controller.user.findUser);
  router.post(`${prefix}/user/getUsersForGroup`, controller.user.getUsersForGroup);
  router.get(`${prefix}/user/findUserByTenant`, controller.user.findUserByTenant);


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
  router.get(`${prefix}/dynamicForm/getDetailByKey`, controller.dynamicForm.getDetailByKey);
  router.get(`${prefix}/dynamicForm/getDetailByVm`, controller.dynamicForm.getDetailByVm);
  router.get(`${prefix}/dynamicForm/getDetailByAM`, controller.dynamicForm.getDetailByAM);
  router.get(`${prefix}/dynamicForm/getDynamicForm`, controller.dynamicForm.getDynamicForm);
  router.get(`${prefix}/dynamicForm/verifyApplicationType`, controller.dynamicForm.verifyApplicationType);
  router.get(`${prefix}/dynamicForm/getDynamicFormDetail`, controller.dynamicForm.getDynamicFormDetail);
  router.post(`${prefix}/dynamicForm/checkTableExist`, controller.dynamicForm.checkTableExist);

  router.get(`${prefix}/platform/list`, controller.platform.list);
  router.get(`${prefix}/platform/detail`, controller.platform.detail);
  router.put(`${prefix}/platform/update`, controller.platform.update);
  router.post(`${prefix}/platform/create`, controller.platform.create);
  router.delete(`${prefix}/platform/deleteMany`, controller.platform.deleteMany);
  router.get(`${prefix}/platform/checkName`, controller.platform.checkName);
  router.get(`${prefix}/platform/listType`, controller.platform.listType);

  router.get(`${prefix}/vmCluster/list`, controller.vmCluster.list);
  router.post(`${prefix}/vmCluster/updateResources`, controller.vmCluster.updateResources);
  router.post(`${prefix}/vmCluster/createVMGuest`, controller.vmCluster.createVMGuest);

  router.get(`${prefix}/vmGuest/list`, controller.vmGuest.list);
  router.get(`${prefix}/vmGuest/detail`, controller.vmGuest.detail);
  router.put(`${prefix}/vmGuest/update`, controller.vmGuest.update);
  router.post(`${prefix}/vmGuest/create`, controller.vmGuest.create);
  router.delete(`${prefix}/vmGuest/deleteMany`, controller.vmGuest.deleteMany);
  router.get(`${prefix}/vmGuest/checkSerialNumber`, controller.vmGuest.checkSerialNumber);
  router.post(`${prefix}/vmGuest/export`, controller.vmGuest.export);

  router.get(`${prefix}/hostname/getReferenceList`, controller.hostname.getReferenceList);
  router.get(`${prefix}/hostname/getHostNameLastCharList`, controller.hostname.getHostNameLastCharList);
  router.get(`${prefix}/hostname/generateHostname`, controller.hostname.generateHostname);

  router.get(`${prefix}/ipAssign/list`, controller.ipAssign.list);
  router.get(`${prefix}/ipAssign/detail`, controller.ipAssign.detail);
  router.put(`${prefix}/ipAssign/update`, controller.ipAssign.update);
  router.post(`${prefix}/ipAssign/create`, controller.ipAssign.create);
  router.get(`${prefix}/ipAssign/getClosestIP`, controller.ipAssign.getClosestIP);
  router.delete(`${prefix}/ipAssign/deleteMany`, controller.ipAssign.deleteMany);
  router.get(`${prefix}/ipAssign/checkIpExist`, controller.ipAssign.checkIpExist);

  router.get(`${prefix}/dc/list`, controller.dc.list);

  router.post(`${prefix}/vm/preDefine`, controller.vm.preDefine);
  router.post(`${prefix}/vm/check`, controller.vm.check);
  router.post(`${prefix}/vm/getResource`, controller.vm.getResource);

  router.post(`${prefix}/vmlist/updateStatus`, controller.vmlist.updateStatus);
  router.post(`${prefix}/vmlist/checkStatus`, controller.vmlist.checkStatus);
  router.post(`${prefix}/vmlist/defindVMType`, controller.vmlist.defindVMType);

  router.get(`${prefix}/diyForm/list`, controller.diyForm.list);
  router.post(`${prefix}/diyForm/create`, controller.diyForm.create);
  router.post(`${prefix}/diyForm/update`, controller.diyForm.update);
  router.get(`${prefix}/diyForm/detail`, controller.diyForm.detail);

  router.get(`${prefix}/haDynamicForm/getInitData`, controller.haDynamicForm.getInitData);

  router.get(`${prefix}/inventory/list`, controller.inventory.list);
  router.get(`${prefix}/inventory/listStatus`, controller.inventory.listStatus);
  router.get(`${prefix}/inventory/listEquipType`, controller.inventory.listEquipType);
  router.get(`${prefix}/inventory/detail`, controller.inventory.detail);
  router.post(`${prefix}/inventory/create`, controller.inventory.create);
  router.put(`${prefix}/inventory/update`, controller.inventory.update);
  router.delete(`${prefix}/inventory/deleteMany`, controller.inventory.deleteMany);
  router.get(`${prefix}/inventory/checkIDExist`, controller.inventory.checkIDExist);

  router.get(`${prefix}/server/list`, controller.server.list);
  router.get(`${prefix}/server/detail`, controller.server.detail);
  router.post(`${prefix}/server/create`, controller.server.create);
  router.put(`${prefix}/server/update`, controller.server.update);
  router.delete(`${prefix}/server/deleteMany`, controller.server.deleteMany);
  router.get(`${prefix}/server/checkIDExist`, controller.server.checkIDExist);

  router.get(`${prefix}/inventoryLifeCycle/list`, controller.inventoryLifeCycle.list);
  router.get(`${prefix}/inventoryLifeCycle/detail`, controller.inventoryLifeCycle.detail);
  router.post(`${prefix}/inventoryLifeCycle/create`, controller.inventoryLifeCycle.create);
  router.put(`${prefix}/inventoryLifeCycle/update`, controller.inventoryLifeCycle.update);
  router.delete(`${prefix}/inventoryLifeCycle/deleteMany`, controller.inventoryLifeCycle.deleteMany);
  router.get(`${prefix}/inventoryLifeCycle/checkIDExist`, controller.inventoryLifeCycle.checkIDExist);
  router.get(`${prefix}/inventoryLifeCycle/listInventorys`, controller.inventoryLifeCycle.listInventorys);

  router.post(`${prefix}/workflow/create`, controller.workflow.create);
  router.get(`${prefix}/workflow/detail`, controller.workflow.detail);
  router.get(`${prefix}/workflow/createTable`, controller.workflow.createTable);
  router.post(`${prefix}/workflow/optionalApproval`, controller.workflow.optionalApproval);

  router.post(`${prefix}/accountManagement/userExistsMany`, controller.accountManagement.userExistsMany);
  router.post(`${prefix}/accountManagement/getUsersByEmails`, controller.accountManagement.getUsersByEmails);
  router.post(`${prefix}/accountManagement/findUsers`, controller.accountManagement.findUsers);
  router.post(`${prefix}/accountManagement/checkUsers`, controller.accountManagement.checkUsers);
  router.get(`${prefix}/accountManagement/getPublicKey`, controller.accountManagement.getPublicKey);
  router.post(`${prefix}/accountManagement/getDisplayName`, controller.accountManagement.getDisplayName);
  router.post(`${prefix}/accountManagement/testfindUsers`, controller.accountManagement.testfindUsers);

  router.get(`${prefix}/role/list`, controller.role.list);

  router.get(`${prefix}/procedure/call`, controller.procedure.call);

  router.post(`${prefix}/mail/sendMail`, controller.mail.sendMail);

  router.get('/test/test', controller.test.test);
};
