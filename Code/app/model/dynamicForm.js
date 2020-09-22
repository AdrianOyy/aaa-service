'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const dynamicForm = app.model.define('dynamicForm', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    modelId: { type: INTEGER, allowNull: true, cnName: '模型id', comment: '模型id' },
    deploymentId: { type: INTEGER, allowNull: true, cnName: '流程部署id', comment: '流程部署id' },
    workflowName: { type: STRING, allowNull: false, cnName: '流程名称', comment: '流程名称' },
    version: { type: STRING, allowNull: false, cnName: '版本', comment: '版本' },
    childVersion: { type: STRING, allowNull: false, cnName: '子版本', comment: '子版本' },
    formKey: { type: STRING, allowNull: false, cnName: '动态表名', comment: '动态表名' },
    parentId: { type: STRING, allowNull: true, cnName: '父表id', comment: '父表id' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'dynamicForm',
    tableCnName: '动态表单',
  });

  dynamicForm.associate = function() {
    const ms = app.model.models;
    ms.dynamicForm.hasMany(ms.dynamicForm, { as: 'childTable', foreignKey: 'parentId', constraints: false });
    ms.dynamicForm.hasMany(ms.dynamicFormDetail, { as: 'dynamicFormDetail', foreignKey: 'dynamicFormId', constraint: false });
  };

  return dynamicForm;
};
