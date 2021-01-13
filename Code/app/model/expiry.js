'use strict';

module.exports = app => {
  const { INTEGER, DATE, STRING } = app.Sequelize;

  const expiry = app.model.define('expiry', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    tenantId: { type: INTEGER, allowNull: false, cnName: 'tenant ID', comment: 'tenant ID' },
    userId: { type: INTEGER, allowNull: true, cnName: '用户Id', comment: '用户Id' },
    type: { type: STRING, allowNull: false, cnName: '撤权类型', comment: '撤权类型', defaultValue: 'tenant' },
    expiryDate: { type: DATE, allowNull: false, cnName: '过期日期', comment: '过期日期' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'expiry',
    tableCnName: 'tenant 撤权日期',
  });

  expiry.associate = function() {
    const ms = app.model.models;
    ms.expiry.belongsTo(ms.user, { as: 'user', foreignKey: 'userId', constraint: false });
    ms.expiry.belongsTo(ms.tenant, { as: 'tenant', foreignKey: 'tenantId', constraint: false });
  };

  return expiry;
};
