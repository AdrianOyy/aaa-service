'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const owa_webmail = app.model.define('owa_webmail', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    type: { type: STRING(256), allowNull: false, cnName: '名称', comment: '名称' },
  }, {
    paranoid: true,
    tableName: 'owa_webmail',
    tableCnName: 'owa_webmail',
  });

  owa_webmail.associate = function() {
    // const ms = app.model.models;
  };

  return owa_webmail;
};
