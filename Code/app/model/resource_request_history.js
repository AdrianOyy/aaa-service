'use strict';

module.exports = app => {
  const { INTEGER, DATE, STRING } = app.Sequelize;

  const resource_request_history = app.model.define('resource_request_history', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    workflowId: { type: STRING, allowNull: false, cnName: '流程ID', comment: '流程ID' },
    tenantQuotaMappingId: { type: INTEGER, allowNull: false, cnName: '项目资源年份数量限制Id', comment: '项目资源年份数量限制Id' },
    status: { type: STRING, allowNull: false, cnName: '状态', comment: '状态' },
    requestNum: { type: INTEGER, allowNull: false, cnName: '数量', comment: '数量' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'resource_request_history',
    tableCnName: '项目资源申请记录',
  });

  resource_request_history.associate = function() {
    const ms = app.model.models;
    ms.resource_request_history.belongsTo(ms.tenant_quota_mapping, {
      as: 'ms.tenant_quota_mapping',
      foreignKey: 'tenantQuotaMappingId',
      constraint: false,
    });
  };

  return resource_request_history;
};
