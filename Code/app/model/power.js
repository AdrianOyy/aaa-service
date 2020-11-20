'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const power = app.model.define('power', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true },
    _ID: { type: INTEGER },
    PowerType: { type: STRING },
  }, {
    paranoid: true,
    tableName: 'power',
    tableCnName: 'power',
  });

  power.associate = function() {
  };
  return power;
};
