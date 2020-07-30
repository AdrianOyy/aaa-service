'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const role = app.model.define('role', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    value: { type: STRING(256), allowNull: false, cnName: '权限', comment: '权限' },
    label: { type: STRING(128), allowNull: false, cnName: '标签', comment: '标签' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'role',
    tableCnName: '权限',
  });

  role.associate = function() {
    // const ms = app.model.models;
  };

  return role;
};
