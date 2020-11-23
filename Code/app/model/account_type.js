'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const account_type = app.model.define('account_type', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    name: { type: STRING(256), allowNull: false, cnName: '名称', comment: '名称' },
  }, {
    paranoid: true,
    tableName: 'account_type',
    tableCnName: 'account_type',
  });

  account_type.associate = function() {
    // const ms = app.model.models;
  };

  return account_type;
};
