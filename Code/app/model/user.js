'use strict';

// user
module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const user = app.model.define('user', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    corpId: { type: STRING(128), allowNull: true, cnName: 'CORP ID', comment: 'CORP ID' },
    alias: { type: STRING(128), allowNull: true, cnName: 'Alias', comment: 'Alias' },
    surname: { type: STRING(128), allowNull: true, cnName: 'Surname', comment: 'Surname' },
    givenname: { type: STRING(128), allowNull: true, cnName: 'Given Name', comment: 'Given Name' },
    title: { type: STRING(128), allowNull: true, cnName: 'Title', comment: 'Title' },
    displayname: { type: STRING(128), allowNull: true, cnName: 'Display Name', comment: 'Display Name' },
    email: { type: STRING(128), allowNull: true, cnName: 'Email', comment: 'Email' },
    proxyAddresses: { type: STRING(256), allowNull: true, cnName: 'Proxy Addresses', comment: 'Proxy Addresses' },
    cluster: { type: STRING(128), allowNull: true, cnName: 'Cluster', comment: 'Cluster' },
    hospital: { type: STRING(128), allowNull: true, cnName: 'Hospital', comment: 'Hospital' },
    department: { type: STRING(128), allowNull: true, cnName: 'Department', comment: 'Department' },
    passwordLastSet: { type: DATE, allowNull: true, cnName: 'Password Last Set', comment: 'Password Last Set' },
    UACCode: { type: STRING(128), allowNull: true, cnName: 'UAC Code', comment: 'UAC Code' },
    UACDesc: { type: STRING(512), allowNull: true, cnName: 'UAC Desc', comment: 'UAC Desc' },
    createdAt: { type: DATE, allowNull: false, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: false, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'user',
    tableCnName: '用户',
  });

  user.associate = function() {
    // const ms = app.model.models;
  };

  return user;
};
