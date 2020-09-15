'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const vm_type_zone_cdc = app.model.define('vm_type_zone_cdc', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    typeId: { type: INTEGER, allowNull: true, cnName: 'Type Id', comment: 'Type Id' },
    zoneId: { type: INTEGER, allowNull: true, cnName: 'Zone Id', comment: 'Zone Id' },
    CDCId: { type: INTEGER, allowNull: true, cnName: 'CDC Id', comment: 'CDC Id' },
    platformId: { type: INTEGER, allowNull: true, cnName: 'Platform Id', comment: 'Platform Id' },
    hostname_prefix: { type: STRING(256), allowNull: true, cnName: 'hostname prefix', comment: 'hostname prefix' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'vm_type_zone_cdc',
    tableCnName: 'Type(Environment)-Zone-CDC Relationship',
  });

  vm_type_zone_cdc.associate = function() {
    const ms = app.model.models;
    ms.vm_type_zone_cdc.belongsTo(ms.vm_type, { as: 'type', foreignKey: 'typeId', constraint: false });
    ms.vm_type_zone_cdc.belongsTo(ms.vm_cdc, { as: 'cdc', foreignKey: 'CDCId', constraint: false });
    ms.vm_type_zone_cdc.belongsTo(ms.vm_platform, { as: 'platform', foreignKey: 'platformId', constraint: false });
    ms.vm_type_zone_cdc.belongsTo(ms.vm_zone, { as: 'zone', foreignKey: 'zoneId', constraint: false });
  };

  return vm_type_zone_cdc;
};
