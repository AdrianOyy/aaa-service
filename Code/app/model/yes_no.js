'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const yes_no = app.model.define('yes_no', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    name: { type: STRING(256), allowNull: false, cnName: '名称', comment: '名称' },
  }, {
    paranoid: true,
    tableName: 'yes_no',
    tableCnName: 'yes_no',
  });

  yes_no.associate = function() {
    // const ms = app.model.models;
  };

  return yes_no;
};
