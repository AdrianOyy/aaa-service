'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const powerOutput = app.model.define('powerOutput', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true },
    _ID: { type: INTEGER, unique: true },
    PowerID: { type: INTEGER },
    OutletType: { type: STRING },
    InventoryID: { type: INTEGER },
  }, {
    paranoid: true,
    tableName: 'powerOutput',
    tableCnName: 'powerOutput',
  });

  powerOutput.associate = function() {
    const ms = app.model.models;
    ms.powerOutput.belongsTo(ms.power, { as: 'power', foreignKey: 'PowerID', targetKey: '_ID', constraint: false });
    ms.powerOutput.belongsTo(ms.inventory, { as: 'inventory', foreignKey: 'InventoryID', targetKey: '_ID', constraint: false });
  };
  return powerOutput;
};
