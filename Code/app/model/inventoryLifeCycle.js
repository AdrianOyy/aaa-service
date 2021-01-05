'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const inventoryLifeCycle = app.model.define('inventoryLifeCycle', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true },
    _ID: { type: STRING, unique: true },
    InventoryID: { type: STRING },
    AssetID: { type: STRING },
    RecordCreatedOn: { type: DATE },
    ActionType: { type: STRING },
    ActionDetails: { type: STRING },
    SuccessorInventoryID: { type: STRING },
    ActionDate: { type: DATE },
    RespStaff: { type: STRING },
    RespStaffDisplayName: { type: STRING },
    Reason: { type: STRING },
    CaseRef: { type: STRING },
  }, {
    paranoid: true,
    tableName: 'inventoryLifeCycle',
    tableCnName: 'inventoryLifeCycle',
  });

  inventoryLifeCycle.associate = function() {
    const ms = app.model.models;
    ms.inventoryLifeCycle.belongsTo(ms.inventory, { as: 'inventory', foreignKey: 'InventoryID', targetKey: '_ID', constraint: false });
  };
  return inventoryLifeCycle;
};
