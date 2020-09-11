'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE, FLOAT } = app.Sequelize;

  const vm_guest = app.model.define('vm_guest', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    serialNumber: { type: STRING(256), allowNull: true, cnName: 'Serial Number', comment: 'Serial Number' },
    model: { type: STRING(256), allowNull: true, cnName: 'Model', comment: 'Model' },
    assignedMemory: { type: FLOAT, allowNull: true, cnName: 'Assigned Memory(GB)', comment: 'Assigned Memory(GB)' },
    assignedCPUCores: { type: INTEGER, allowNull: true, cnName: 'Assigned CPU Cores', comment: 'Assigned CPU Cores' },
    diskVolumeName: { type: STRING(256), allowNull: true, cnName: 'Disk Volume Name', comment: 'Disk Volume Name' },
    CSVName: { type: STRING(256), allowNull: true, cnName: 'CSV Name', comment: 'CSV Name' },
    diskSize: { type: INTEGER, allowNull: true, cnName: 'Disk Size', comment: 'Disk Size' },
    status: { type: STRING(256), allowNull: true, cnName: 'Status', comment: 'Status' },
    hostname: { type: STRING(256), allowNull: true, cnName: 'Hostname', comment: 'Hostname' },
    VMClusterId: { type: INTEGER, allowNull: true, cnName: 'VMCluster Id', comment: 'VMCluster Id' },
    VMClusterName: { type: STRING(256), allowNull: true, cnName: 'VMCluster Name', comment: 'VMCluster Name' },
    VMMasterId: { type: INTEGER, allowNull: true, cnName: 'VMMaster Id', comment: 'VMMaster Id' },
    VMMasterName: { type: STRING(256), allowNull: true, cnName: 'VMMaster Name', comment: 'VMMaster Name' },
    OS: { type: STRING(256), allowNull: true, cnName: 'OS', comment: 'OS' },
    serverRole: { type: STRING(256), allowNull: true, cnName: 'Server Role', comment: 'Server Role' },
    hostIP: { type: STRING(256), allowNull: true, cnName: 'Host IP', comment: 'Host IP' },
    ATLIP: { type: STRING(256), allowNull: true, cnName: 'ATL IP', comment: 'ATL IP' },
    magementHost: { type: STRING(256), allowNull: true, cnName: 'Magement Host', comment: 'Magement Host' },
    extraIPs: { type: STRING(256), allowNull: true, cnName: 'Extra IPs ', comment: 'Extra IPs ' },
    remarks: { type: STRING(256), allowNull: true, cnName: 'Remarks', comment: 'Remarks' },
    tenantId: { type: INTEGER, allowNull: false, cnName: '项目Id', comment: '项目Id' },
    projectCode: { type: STRING(256), allowNull: true, cnName: 'Project Code', comment: 'Project Code' },
    projectContact: { type: STRING(256), allowNull: true, cnName: 'Project Contact', comment: 'Project Contact' },
    projectManager: { type: STRING(256), allowNull: true, cnName: 'Project Manager', comment: 'Project Manager' },
    section: { type: STRING(256), allowNull: true, cnName: 'Section', comment: 'Section' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'vm_guest',
    tableCnName: 'vm guest',
  });

  vm_guest.associate = function() {
    const ms = app.model.models;
    ms.vm_guest.belongsTo(ms.vm_cluster, { as: 'vm_cluster', foreignKey: 'VMClusterId', constraint: false });
    ms.vm_guest.belongsTo(ms.vm_master, { as: 'vm_master', foreignKey: 'VMMasterId', constraint: false });
  };

  return vm_guest;
};
