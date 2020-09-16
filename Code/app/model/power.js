'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const power = app.model.define('power', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true },
    _ID: { type: INTEGER, unique: true },
    PowerType: { type: STRING, unique: true },
  }, {
    paranoid: true,
    tableName: 'power',
    tableCnName: 'power',
  });

  power.associate = function() {
  };
  return power;
};
