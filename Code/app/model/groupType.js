'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const groupType = app.model.define('groupType', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    adGroupId: { type: INTEGER, allowNull: false, cnName: 'AD group ID', comment: 'AD group ID' },
    type: { type: STRING(128), allowNull: false, cnName: '类型', comment: '类型' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'groupType',
    tableCnName: '组类型',
  });

  groupType.associate = function() {
    const ms = app.model.models;
    ms.groupType.belongsTo(ms.ad_group, { as: 'adGroup', foreignKey: 'adGroupId', constraint: false });
  };

  return groupType;
};
