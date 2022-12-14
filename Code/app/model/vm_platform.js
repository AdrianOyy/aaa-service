'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const vm_platform = app.model.define('vm_platform', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    name: { type: STRING(256), allowNull: false, cnName: 'name', comment: 'name' },
    typeId: { type: INTEGER, allowNull: true, cnName: 'Platform Type Id', comment: 'Platform Type Id' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'vm_platform',
    tableCnName: 'Platform',
  });

  vm_platform.associate = function() {
    const ms = app.model.models;
    ms.vm_platform.belongsTo(ms.vm_platform_type, { as: 'vm_platform_type', foreignKey: 'typeId', constraint: false });
  };

  return vm_platform;
};
