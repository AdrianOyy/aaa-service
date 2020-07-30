'use strict';

module.exports = app => {
  const { INTEGER, DATE } = app.Sequelize;

  const assign = app.model.define('assign', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    tenant_group_mappingId: { type: INTEGER, allowNull: false, cnName: 'tenant-group关系表Id', comment: 'tenant-group关系表Id' },
    roleId: { type: INTEGER, allowNull: false, cnName: '权限Id', comment: '权限Id' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'assign',
    tableCnName: '用户组项目权限',
  });

  assign.associate = function() {
    const ms = app.model.models;
    ms.assign.belongsTo(ms.tenant_group_mapping, { as: 'tenant_group_mapping', foreignKey: 'tenant_group_mappingId', constraint: false });
    ms.assign.belongsTo(ms.role, { as: 'role', foreignKey: 'roleId', constraint: false });
  };

  return assign;
};
