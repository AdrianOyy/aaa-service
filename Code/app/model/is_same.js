'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const is_same = app.model.define('is_same', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    name: { type: STRING(256), allowNull: false, cnName: '名称', comment: '名称' },
  }, {
    paranoid: true,
    tableName: 'is_same',
    tableCnName: 'is_same',
  });

  is_same.associate = function() {
    // const ms = app.model.models;
  };

  return is_same;
};
