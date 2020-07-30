'use strict';

module.exports = app => {
  const { INTEGER, DATE } = app.Sequelize;

  const tenant_group_mapping = app.model.define('tenant_group_mapping', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    tenantId: { type: INTEGER, allowNull: false, cnName: '项目Id', comment: '项目Id' },
    adGroupId: { type: INTEGER, allowNull: false, cnName: '用户组Id', comment: '用户组Id' },
    roleId: { type: INTEGER, allowNull: false, cnName: '权限Id', comment: '权限Id' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'tenant_group_mapping',
    tableCnName: '项目用户组权限',
  });

  tenant_group_mapping.associate = function() {
    const ms = app.model.models;
    ms.tenant_group_mapping.belongsTo(ms.tenant, { as: 'tenant', foreignKey: 'tenantId', constraint: false });
    ms.tenant_group_mapping.belongsTo(ms.ad_group, { as: 'ad_group', foreignKey: 'ad_groupId', constraint: false });
    ms.tenant_group_mapping.belongsTo(ms.role, { as: 'role', foreignKey: 'roleId', constraint: false });
  };

  return tenant_group_mapping;
};
