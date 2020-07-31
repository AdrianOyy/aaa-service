'use strict';

// management (Project)
module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const management = app.model.define('management', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    tenantId: { type: INTEGER, allowNull: false, cnName: '项目Id', comment: '项目Id' },
    ad_groupId: { type: INTEGER, allowNull: false, cnName: '项目管理组Id', comment: '项目管理组Id' },
    supporter: { type: STRING(128), allowNull: true, cnName: 'Supporter', comment: 'Supporter' },
    resourcesQuota: { type: STRING(128), allowNull: true, cnName: 'Resources Quota', comment: 'Resources Quota' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'management',
    tableCnName: '项目管理组',
  });

  management.associate = function() {
    const ms = app.model.models;
    ms.management.belongsTo(ms.ad_group, { as: 'ad_group', foreignKey: 'ad_groupId', constraint: false });
    ms.management.belongsTo(ms.tenant, { as: 'tenant', foreignKey: 'tenantId', constraint: false });
  };

  return management;
};
