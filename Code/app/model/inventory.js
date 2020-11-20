'use strict';

module.exports = app => {
  const { INTEGER, STRING, FLOAT, DATE } = app.Sequelize;

  const inventory = app.model.define('inventory', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true },
    _ID: { type: INTEGER },
    UnitCode: { type: STRING },
    EquipID: { type: INTEGER },
    AssetID: { type: INTEGER },
    ModelCode: { type: STRING },
    ModelDesc: { type: STRING },
    ClosetID: { type: INTEGER },
    Rack: { type: STRING },
    RLU: { type: STRING },
    ItemOwner: { type: STRING },
    ProjectOwner: { type: STRING },
    Status: { type: INTEGER },
    Remark: { type: STRING },
    EquipType: { type: INTEGER },
    UnitNo: { type: STRING, comment: 'standard name' },
    DisplayName: { type: STRING },
    PortQty: { type: FLOAT },
    EAMNew: { type: DATE },
    EAMUpdate: { type: DATE },
    ReqNo: { type: STRING },
    TargetDate: { type: DATE },
    DOB: { type: DATE },
    DeliveryNoteNo: { type: STRING },
    DeliveryDate: { type: DATE },
    DeliveryNoteReceivedDate: { type: DATE },
    ContractNo: { type: STRING },
    MaintID: { type: STRING },
  }, {
    paranoid: true,
    tableName: 'inventory',
    tableCnName: '状态',
  });

  inventory.associate = function() {
    const ms = app.model.models;
    ms.inventory.belongsTo(ms.inventoryStatus, { as: 'status', foreignKey: 'Status', constraint: false });
    ms.inventory.belongsTo(ms.equipType, { as: 'equipType', foreignKey: 'EquipType', constraint: false });
    ms.inventory.hasMany(ms.policy, { as: 'policy', foreignKey: 'InventoryID', sourceKey: '_ID', constraint: false });
    ms.inventory.hasMany(ms.equipmentPort, { as: 'equipPort', foreignKey: 'InventoryID', sourceKey: '_ID', constraint: false });
    ms.inventory.hasMany(ms.powerInput, { as: 'powerInput', foreignKey: 'InventoryID', sourceKey: '_ID', constraint: false });
    ms.inventory.hasMany(ms.powerOutput, { as: 'powerOutput', foreignKey: 'InventoryID', sourceKey: '_ID', constraint: false });
  };
  return inventory;
};
