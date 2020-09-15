'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE, FLOAT } = app.Sequelize;

  const vm_cluster = app.model.define('vm_cluster', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    totalMemory: { type: FLOAT, allowNull: true, cnName: 'Total Memory(GB)', comment: 'Total Memory(GB)' },
    totalNumbeOfCPU: { type: INTEGER, allowNull: true, cnName: 'Total Number of CPU', comment: 'Total Number of CPU' },
    storagePoolSize: { type: INTEGER, allowNull: true, cnName: 'Storage Pool Size', comment: 'Storage Pool Size' },
    freeTotalMemory: { type: FLOAT, allowNull: true, cnName: 'Free Total Memory(GB)', comment: 'Total Memory(GB)' },
    freeTotalNumbeOfCPU: { type: INTEGER, allowNull: true, cnName: 'Free Total Number of CPU', comment: 'Total Number of CPU' },
    freeStoragePoolSize: { type: INTEGER, allowNull: true, cnName: 'Free Storage Pool Size', comment: 'Storage Pool Size' },
    CSVName: { type: STRING(256), allowNull: true, cnName: 'CSV Name', comment: 'CSV Name' },
    CSVSize: { type: INTEGER, allowNull: true, cnName: 'CSV Size', comment: 'CSV Size' },
    status: { type: STRING(256), allowNull: true, cnName: 'Status', comment: 'Status' },
    VMMasterMemberHostnames: { type: STRING(256), allowNull: true, cnName: 'VM Master Member Hostnames', comment: 'VM Master Member Hostnames' },
    VMClusterName: { type: STRING(256), allowNull: true, cnName: 'VMCluster Name', comment: 'VMCluster Name' },
    OS: { type: STRING(256), allowNull: true, cnName: 'OS', comment: 'OS' },
    serverRole: { type: STRING(256), allowNull: true, cnName: 'Server Role', comment: 'Server Role' },
    magementHost: { type: STRING(256), allowNull: true, cnName: 'Magement Host', comment: 'Magement Host' },
    IPPools: { type: STRING(256), allowNull: true, cnName: 'IP Pools', comment: 'IP Pools' },
    remarks: { type: STRING(256), allowNull: true, cnName: 'Remarks', comment: 'Remarks' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'vm_cluster',
    tableCnName: 'vm cluster',
  });

  vm_cluster.associate = function() {
    // const ms = app.model.models;
  };

  return vm_cluster;
};
