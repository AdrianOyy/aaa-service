'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const inventoryStatus = app.model.define('inventoryStatus', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    ServiceStatus: { type: STRING, cnName: 'ServiceStatus' },
  }, {
    paranoid: true,
    tableName: 'inventoryStatus',
    tableCnName: '状态',
  });

  inventoryStatus.associate = function() {
    // const ms = app.model.models;
  };

  return inventoryStatus;
};
