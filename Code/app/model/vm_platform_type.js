'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const vm_platform_type = app.model.define('vm_platform_type', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    name: { type: STRING(256), allowNull: false, cnName: 'name', comment: 'name' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'vm_platform_type',
    tableCnName: 'Platform Type',
  });

  vm_platform_type.associate = function() {
    // const ms = app.model.models;
  };

  return vm_platform_type;
};
