'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const vm_applicationType = app.model.define('vm_applicationType', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    name: { type: STRING(256), allowNull: true, cnName: 'name', comment: 'name' },
    code: { type: STRING(256), allowNull: true, cnName: 'code', comment: 'code' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'vm_applicationType',
    tableCnName: 'Application Type',
  });

  vm_applicationType.associate = function() {
    // const ms = app.model.models;
  };

  return vm_applicationType;
};
