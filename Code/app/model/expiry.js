'use strict';

module.exports = app => {
  const { INTEGER, DATE } = app.Sequelize;

  const expiry = app.model.define('expiry', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    assignId: { type: INTEGER, allowNull: false, cnName: 'tenant-group关系表Id', comment: 'tenant-group关系表Id' },
    userId: { type: INTEGER, allowNull: false, cnName: '权限Id', comment: '权限Id' },
    expiryDate: { type: DATE, allowNull: true, cnName: '过期日期', comment: '过期日期' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'expiry',
    tableCnName: '用户组项目权限',
  });

  expiry.associate = function() {
    const ms = app.model.models;
    ms.expiry.belongsTo(ms.assign, { as: 'assign', foreignKey: 'assignId', constraint: false });
    ms.expiry.belongsTo(ms.user, { as: 'user', foreignKey: 'userId', constraint: false });
  };

  return expiry;
};
