'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const ad_group = app.model.define('ad_group', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    name: { type: STRING(256), allowNull: false, cnName: '名称', comment: '名称' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'ad_group',
    tableCnName: '用户组',
  });

  ad_group.associate = function() {
    const ms = app.model.models;
    // ad_group.hasMany(ms.tenant_group_mapping, { as: 'tenantGroupMapping', foreignKey: 'ad_groupId', constraint: false });
    ad_group.hasMany(ms.clinical_group, { as: 'clinicalGroupMapping', foreignKey: 'manage_group_id', constraint: false });
    ad_group.hasMany(ms.clinical_group, { as: 'approvalGroupMapping', foreignKey: 'approval_group_id', constraint: false });
    ad_group.hasMany(ms.groupType, { as: 'groupType', foreignKey: 'adGroupId', constraints: false });
  };

  return ad_group;
};
