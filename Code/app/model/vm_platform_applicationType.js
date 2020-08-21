'use strict';

module.exports = app => {
  const { INTEGER, DATE } = app.Sequelize;

  const vm_platform_applicationType = app.model.define('vm_platform_applicationType', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    platformId: { type: INTEGER, allowNull: true, cnName: 'Platform Id', comment: 'Platform Id' },
    applicationTypeId: { type: INTEGER, allowNull: true, cnName: 'Application Type Id', comment: 'Application Type Id' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'vm_platform_applicationType',
    tableCnName: 'Type (Environment)',
  });

  vm_platform_applicationType.associate = function() {
    const ms = app.model.models;
    ms.vm_platform_applicationType.belongsTo(ms.vm_platform, { as: 'platform', foreignKey: 'platformId', constraint: false });
    ms.vm_platform_applicationType.belongsTo(ms.vm_applicationType, { as: 'applicationType', foreignKey: 'applicationTypeId', constraint: false });
  };

  return vm_platform_applicationType;
};
