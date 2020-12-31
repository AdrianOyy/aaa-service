'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const account_type = app.model.define('account_type', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    type: { type: STRING(256), allowNull: false, cnName: '类型', comment: '类型' },
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
