'use strict';

module.exports = app => {
  const { INTEGER, DATE } = app.Sequelize;

  const tenantMapping = app.model.define('tenantMapping', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    tenantId: { type: INTEGER, allowNull: false, cnName: '项目Id', comment: '项目Id' },
    ADGroupId: { type: INTEGER, allowNull: false, cnName: '用户组Id', comment: '用户组Id' },
    roleId: { type: INTEGER, allowNull: false, cnName: '权限Id', comment: '权限Id' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'tenantMapping',
    tableCnName: '项目用户组权限',
  });

  tenantMapping.associate = function() {
    const ms = app.model.models;
    ms.tenantMapping.belongsTo(ms.tenant, { as: 'tenant', foreignKey: 'tenantId', constraint: false });
    ms.tenantMapping.belongsTo(ms.ADGroup, { as: 'ADGroup', foreignKey: 'ADGroupId', constraint: false });
    ms.tenantMapping.belongsTo(ms.role, { as: 'role', foreignKey: 'roleId', constraint: false });
  };

  return tenantMapping;
};
