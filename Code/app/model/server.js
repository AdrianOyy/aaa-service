'use strict';

module.exports = app => {
  const { INTEGER, STRING, FLOAT, DATE } = app.Sequelize;

  const server = app.model.define('server', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true },
    _ID: { type: STRING, unique: true },
    UnitCode: { type: STRING },
    EquipID: { type: INTEGER },
    AssetID: { type: STRING },
    ModelCode: { type: STRING },
    ModelDesc: { type: STRING },
    ClosetID: { type: STRING },
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
    tableName: 'server',
    tableCnName: '服务',
  });

  server.associate = function() {
    const ms = app.model.models;
    ms.server.belongsTo(ms.inventoryStatus, { as: 'status', foreignKey: 'Status', constraint: false });
    ms.server.belongsTo(ms.equipType, { as: 'equipType', foreignKey: 'EquipType', constraint: false });
    ms.server.hasMany(ms.policy, { as: 'policy', foreignKey: 'ServerID', sourceKey: '_ID', constraint: false });
    ms.server.hasMany(ms.equipmentPort, { as: 'equipPort', foreignKey: 'ServerID', sourceKey: '_ID', constraint: false });
    ms.server.hasMany(ms.powerInput, { as: 'powerInput', foreignKey: 'ServerID', sourceKey: '_ID', constraint: false });
    ms.server.hasMany(ms.powerOutput, { as: 'powerOutput', foreignKey: 'ServerID', sourceKey: '_ID', constraint: false });
  };
  return server;
};
