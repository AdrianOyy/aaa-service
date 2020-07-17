'use strict';

// tenantsMapping
module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const tenantsMapping = app.model.define('tenantsMapping', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    project: { type: STRING(128), allowNull: true, cnName: '项目', comment: '项目' },
    managerADGroup: { type: STRING(128), allowNull: true, cnName: 'AD管理组', comment: 'AD管理组' },
    right: { type: STRING(128), allowNull: true, cnName: 'AD管理组', comment: 'AD管理组' },
    createdAt: { type: DATE, allowNull: false, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: false, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'tenantsMapping',
    tableCnName: '项目所属组',
  });

  tenantsMapping.associate = function() {
    // const ms = app.model.models;
  };

  return tenantsMapping;
};
