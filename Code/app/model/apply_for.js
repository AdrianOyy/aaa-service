'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const apply_for = app.model.define('apply_for', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    type: { type: STRING(256), allowNull: false, cnName: '名称', comment: '名称' },
  }, {
    paranoid: true,
    tableName: 'apply_for',
    tableCnName: 'apply_for',
  });

  apply_for.associate = function() {
    // const ms = app.model.models;
  };

  return apply_for;
};
