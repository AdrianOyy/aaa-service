'use strict';

module.exports = app => {
  const { INTEGER, DATE } = app.Sequelize;

  const userTenantMapping = app.model.define('userTenantMapping', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    userId: { type: INTEGER, allowNull: false, cnName: '用户Id', comment: '用户Id' },
    userTenantMappingId: { type: INTEGER, allowNull: false, cnName: '项目用户组权限Id', comment: '项目用户组权限Id' },
    expireDate: { type: DATE, allowNull: false, cnName: '过期日期', comment: '过期日期' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'userTenantMapping',
    tableCnName: '用户项目组有效期',
  });

  userTenantMapping.associate = function() {
    const ms = app.model.models;
    ms.userTenantMapping.belongsTo(ms.userTenantMapping, { as: 'userTenantMapping', foreignKey: 'userTenantMappingId', constraint: false });
    ms.userTenantMapping.belongsTo(ms.user, { as: 'user', foreignKey: 'userId', constraint: false });
  };

  return userTenantMapping;
};
