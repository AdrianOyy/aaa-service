'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const vm_location = app.model.define('vm_location', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    code: { type: STRING(256), allowNull: false, cnName: 'code', comment: 'code' },
    name: { type: STRING(256), allowNull: false, cnName: '名称', comment: '名称' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'vm_location',
    tableCnName: 'vm信息',
  });

  vm_location.associate = function() {
    // const ms = app.model.models;
  };

  return vm_location;
};
