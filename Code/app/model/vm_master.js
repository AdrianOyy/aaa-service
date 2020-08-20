'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE, FLOAT } = app.Sequelize;

  const vm_master = app.model.define('vm_master', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    serialNumber: { type: STRING(256), allowNull: true, cnName: 'Serial Number', comment: 'Serial Number' },
    EAMAssetNumber: { type: STRING(256), allowNull: true, cnName: 'EAM Asset Number', comment: 'EAM Asset Number' },
    model: { type: STRING(256), allowNull: true, cnName: 'Model', comment: 'Model' },
    memory: { type: FLOAT, allowNull: true, cnName: 'Memory(GB)', comment: 'Memory(GB)' },
    numberOfCPU: { type: INTEGER, allowNull: true, cnName: 'Number of CPU', comment: 'Number of CPU' },
    CPUType: { type: STRING(256), allowNull: true, cnName: 'CPU Type', comment: 'CPU Type' },
    status: { type: STRING(256), allowNull: true, cnName: 'Status', comment: 'Status' },
    hostname: { type: STRING(256), allowNull: true, cnName: 'Hostname', comment: 'Hostname' },
    VMClusterId: { type: INTEGER, allowNull: true, cnName: 'VMCluster Id', comment: 'VMCluster Id' },
    VMClusterName: { type: STRING(256), allowNull: true, cnName: 'VMCluster Name', comment: 'VMCluster Name' },
    OS: { type: STRING(256), allowNull: true, cnName: 'OS', comment: 'OS' },
    serverRole: { type: STRING(256), allowNull: true, cnName: 'Server Role', comment: 'Server Role' },
    hostIP: { type: STRING(256), allowNull: true, cnName: 'Host IP', comment: 'Host IP' },
    ATLIP: { type: STRING(256), allowNull: true, cnName: 'ATL IP', comment: 'ATL IP' },
    hardwareMagementIP: { type: STRING(256), allowNull: true, cnName: 'Hardware Magement IP', comment: 'Hardware Magement IP' },
    magementHost: { type: STRING(256), allowNull: true, cnName: 'Magement Host', comment: 'Magement Host' },
    location: { type: STRING(256), allowNull: true, cnName: 'Location', comment: 'Location' },
    serverLocatedNetwork: { type: STRING(256), allowNull: true, cnName: 'Server Located Network', comment: 'Server Located Network' },
    remarks: { type: STRING(256), allowNull: true, cnName: 'Remarks', comment: 'Remarks' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'vm_master',
    tableCnName: 'vm master',
  });

  vm_master.associate = function() {
    const ms = app.model.models;
    ms.vm_master.belongsTo(ms.vm_cluster, { as: 'vm_cluster', foreignKey: 'VMClusterId', constraint: false });
  };

  return vm_master;
};
