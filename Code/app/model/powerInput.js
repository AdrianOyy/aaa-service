'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const powerInput = app.model.define('powerInput', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true },
    _ID: { type: INTEGER, unique: true },
    PowerID: { type: INTEGER },
    InputType: { type: STRING },
    InventoryID: { type: STRING },
    ServerID: { type: STRING },
  }, {
    paranoid: true,
    tableName: 'powerInput',
    tableCnName: 'powerInput',
  });

  powerInput.associate = function() {
    const ms = app.model.models;
    ms.powerInput.belongsTo(ms.power, { as: 'power', foreignKey: 'PowerID', targetKey: '_ID', constraint: false });
    ms.powerInput.belongsTo(ms.inventory, { as: 'inventory', foreignKey: 'InventoryID', targetKey: '_ID', constraint: false });
    ms.powerInput.belongsTo(ms.server, { as: 'server', foreignKey: 'ServerID', targetKey: '_ID', constraint: false });
  };
  return powerInput;
};
