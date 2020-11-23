'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const vm_cdc = app.model.define('vm_cdc', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    name: { type: STRING(256), allowNull: false, cnName: 'name', comment: 'name' },
  }, {
    paranoid: true,
    tableName: 'vm_cdc',
    tableCnName: 'CDC (Data Centre)',
  });

  vm_cdc.associate = function() {
    // const ms = app.model.models;
  };

  return vm_cdc;
};
