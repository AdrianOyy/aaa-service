'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const tenant = app.model.define('tenant', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    name: { type: STRING(256), allowNull: false, cnName: '名称', comment: '名称' },
    code: { type: STRING(256), allowNull: false, cnName: '代号', comment: '代号', unique: true },
    manager_group_id: { type: INTEGER, allowNull: false, cnName: '管理组Id', comment: '管理组Id' },
    supporter_group_id: { type: INTEGER, allowNull: false, cnName: '代理组Id', comment: '代理组Id' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'tenant',
    tableCnName: '项目',
  });

  tenant.associate = function() {
    const ms = app.model.models;
    tenant.belongsTo(ms.ad_group, { as: 'manager_group', foreignKey: 'manager_group_id', constraint: false });
    tenant.belongsTo(ms.ad_group, { as: 'supporter_group', foreignKey: 'supporter_group_id', constraint: false });
    tenant.hasMany(ms.tenant_quota_mapping, { as: 'quota', foreignKey: 'tenantId', constraints: false });
  };

  return tenant;
};
