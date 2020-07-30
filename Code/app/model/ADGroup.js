'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const ADGroup = app.model.define('ADGroup', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    name: { type: STRING(256), allowNull: false, cnName: '名称', comment: '名称' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'ADGroup',
    tableCnName: '用户组',
  });

  ADGroup.associate = function() {
    // const ms = app.model.models;
  };

  return ADGroup;
};
