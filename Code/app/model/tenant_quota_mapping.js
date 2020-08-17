'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const tenant_quota_mapping = app.model.define('tenant_quota_mapping', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    tenantId: { type: INTEGER, allowNull: false, cnName: '项目Id', comment: '项目Id' },
    type: { type: STRING, allowNull: true, cnName: '类型', comment: '类型' },
    quota: { type: INTEGER, allowNull: false, cnName: '数量限制', comment: '数量限制' },
    year: { type: INTEGER, allowNull: false, cnName: '年份', comment: '年份' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'tenant_quota_mapping',
    tableCnName: '项目资源年份数量限制',
  });

  tenant_quota_mapping.associate = function() {
    const ms = app.model.models;
    ms.tenant_quota_mapping.belongsTo(ms.tenant, { as: 'tenant', foreignKey: 'tenantId', constraint: false });
  };

  return tenant_quota_mapping;
};
