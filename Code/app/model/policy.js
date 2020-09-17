'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const policy = app.model.define('policy', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true },
    _ID: { type: INTEGER, unique: true },
    InventoryID: { type: INTEGER },
    DefGateway: { type: STRING },
    SubnetMask: { type: STRING },
    ConfigFile: { type: STRING },
    CurVer: { type: STRING },
    NxBtVer: { type: STRING },
    BlockDHCP: { type: STRING },
    MedicalNW: { type: STRING },
    NetworkApplied: { type: STRING },
    Group: { type: STRING },
  }, {
    paranoid: true,
    tableName: 'policy',
    tableCnName: 'policy',
  });

  policy.associate = function() {
    const ms = app.model.models;
    ms.policy.belongsTo(ms.inventory, { as: 'inventory', foreignKey: 'InventoryID', targetKey: '_ID', constraint: false });
  };
  return policy;
};
