'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const apply_for_internet = app.model.define('apply_for_internet', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    name: { type: STRING(256), allowNull: false, cnName: '名称', comment: '名称' },
  }, {
    paranoid: true,
    tableName: 'apply_for_internet',
    tableCnName: 'apply_for_internet',
  });

  apply_for_internet.associate = function() {
    // const ms = app.model.models;
  };

  return apply_for_internet;
};
