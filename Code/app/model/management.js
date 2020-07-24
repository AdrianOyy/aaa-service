'use strict';

// management (Project)
module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const management = app.model.define('management', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    project: { type: STRING(128), allowNull: false, cnName: '项目', comment: '项目' },
    managerADGroup: { type: STRING(128), allowNull: false, cnName: 'AD管理组', comment: 'AD管理组' },
    supporter: { type: STRING(128), allowNull: true, cnName: 'Supporter', comment: 'Supporter' },
    resourcesQuota: { type: STRING(128), allowNull: true, cnName: 'Resources Quota', comment: 'Resources Quota' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'management',
    tableCnName: '项目管理组',
  });

  management.associate = function() {
    // const ms = app.model.models;
  };

  return management;
};
