'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const role = app.model.define('role', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    right: { type: STRING(256), allowNull: false, cnName: '权限', comment: '权限' },
  }, {
    paranoid: true,
    tableName: 'role',
    tableCnName: '角色',
  });

  // role.associate = function() {
  //   // const ms = app.model.models;
  // };

  return role;
};
