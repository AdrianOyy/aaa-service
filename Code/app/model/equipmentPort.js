'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const equipmentPort = app.model.define('equipmentPort', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true },
    _ID: { type: INTEGER, unique: true },
    InventoryID: { type: INTEGER },
    SlotID: { type: STRING },
    PortID: { type: STRING },
    PortType: { type: STRING },
    OutletID: { type: STRING },
    Remark: { type: STRING },
    PortStatus: { type: STRING },
    PortSecurity: { type: STRING },
    Polarity: { type: STRING },
    PortSpeed: { type: STRING },
    Duplex: { type: STRING },
    VLanID: { type: STRING },
    PortPolicyType: { type: STRING },
    PortPolicy: { type: STRING },
    ConnectingInventory: { type: STRING },
  }, {
    paranoid: true,
    tableName: 'equipmentPort',
    tableCnName: 'equipmentPort',
  });

  equipmentPort.associate = function() {
    const ms = app.model.models;
    ms.equipmentPort.hasOne(ms.portAssignment, { as: 'portAssignment', foreignKey: 'EquipPortID', sourceKey: '_ID', constraint: false });
  };
  return equipmentPort;
};
