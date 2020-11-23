'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const staff_type = app.model.define('staff_type', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    name: { type: STRING(256), allowNull: false, cnName: '名称', comment: '名称' },
  }, {
    paranoid: true,
    tableName: 'staff_type',
    tableCnName: 'staff_type',
  });

  staff_type.associate = function() {
    // const ms = app.model.models;
  };

  return staff_type;
};
