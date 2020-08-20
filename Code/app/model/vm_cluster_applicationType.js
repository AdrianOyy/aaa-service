'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const vm_cluster_applicationType = app.model.define('vm_cluster_applicationType', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    cluster: { type: STRING(256), allowNull: true, cnName: 'Cluster', comment: 'Cluster' },
    applicationTypeId: { type: INTEGER, allowNull: true, cnName: 'Application Type Id', comment: 'Application Type Id' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'vm_cluster_applicationType',
    tableCnName: 'Cluster-Application Type Relationship',
  });

  vm_cluster_applicationType.associate = function() {
    const ms = app.model.models;
    ms.vm_cluster_applicationType.belongsTo(ms.vm_applicationType, { as: 'applicationType', foreignKey: 'applicationTypeId', constraint: false });
  };

  return vm_cluster_applicationType;
};
