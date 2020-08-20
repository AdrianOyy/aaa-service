'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const dynamicForm = app.model.define('dynamicForm', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    deploymentId: { type: INTEGER, allowNull: false, cnName: '流程部署id', comment: '流程部署id', unique: true },
    formKey: { type: STRING, allowNull: false, cnName: '动态表名', comment: '动态表名', unique: true },
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
    ms.dynamicForm.hasMany(ms.dynamicFormDetail, { as: 'dynamicFormDetail', foreignKey: 'dynamicFormId', constraint: false });
  };

  return dynamicForm;
};
