'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const equipType = app.model.define('equipType', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    Type: { type: STRING, cnName: 'Type' },
    Profiles: { type: STRING, cnName: 'Profiles' },
  }, {
    paranoid: true,
    tableName: 'equipType',
    tableCnName: '状态',
  });

  equipType.associate = function() {
    // const ms = app.model.models;
  };

  return equipType;
};
