'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const vm_cluster_dc_mapping = app.model.define('vm_cluster_applicationType', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    clusterId: { type: STRING(256), allowNull: true, cnName: 'VM Cluster Name', comment: 'VM Cluster Name' },
    clusterName: { type: STRING(256), allowNull: true, cnName: 'VM Cluster Name', comment: 'VM Cluster Name' },
    mappingType: { type: STRING(256), allowNull: true, cnName: 'Mapping Type', comment: 'Mapping Type' },
    cdcId: { type: INTEGER, allowNull: true, cnName: 'DC Id', comment: 'DC Id' },
    typeId: { type: INTEGER, allowNull: true, cnName: 'Type Id', comment: 'Type Id' },
    zoneId: { type: INTEGER, allowNull: true, cnName: 'Zone Id', comment: 'Zone Id' },
    usage: { type: STRING(256), allowNull: true, cnName: 'Cluster', comment: 'Cluster' },
    vCenter: { type: STRING(256), allowNull: false, cnName: 'vCenter', comment: 'vCenter' },
    applicationTypeId: { type: INTEGER, allowNull: true, cnName: 'Application Type Id', comment: 'Application Type Id' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'vm_cluster_dc_mapping',
    tableCnName: 'Cluster-DC-Mapping',
  });

  vm_cluster_dc_mapping.associate = function() {
    // const ms = app.model.models;
    // ms.vm_cluster_applicationType.belongsTo(ms.vm_applicationType, { as: 'applicationType', foreignKey: 'applicationTypeId', constraint: false });
  };

  return vm_cluster_dc_mapping;
};
