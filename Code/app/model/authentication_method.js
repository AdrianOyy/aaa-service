'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const authentication_method = app.model.define('authentication_method', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    type: { type: STRING(256), allowNull: false, cnName: '名称', comment: '名称' },
  }, {
    paranoid: true,
    tableName: 'authentication_method',
    tableCnName: 'authentication_method',
  });

  authentication_method.associate = function() {
    // const ms = app.model.models;
  };

  return authentication_method;
};
