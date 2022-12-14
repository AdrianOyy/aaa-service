'use strict';

module.exports = app => {
  const { INTEGER, STRING, BOOLEAN, DATE } = app.Sequelize;

  const dynamicFormDetail = app.model.define('dynamicFormDetail', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    dynamicFormId: { type: INTEGER, allowNull: false, cnName: '动态表单id', comment: '动态表单id' },
    fieldName: { type: STRING, allowNull: false, cnName: '字段名', comment: '字段名' },
    fieldDisplayName: { type: STRING, allowNull: false, cnName: '字段显示名', comment: '字段显示名' },
    fieldType: { type: STRING, allowNull: false, cnName: '字段类型', comment: '字段类型' },
    inputType: { type: STRING, allowNull: false, cnName: '输入框类型', comment: '输入框类型' },
    showOnRequest: { type: BOOLEAN, allowNull: false, cnName: '申请时显示', comment: '申请时显示' },
    foreignTable: { type: STRING, allowNull: true, cnName: '关联表表名', comment: '关联表表名' },
    foreignKey: { type: STRING, allowNull: true, cnName: '关联字段', comment: '关联字段' },
    foreignDisplayKey: { type: STRING, allowNull: true, cnName: '显示字段', comment: '显示字段' },
    required: { type: BOOLEAN, allowNull: false, cnName: '必填字段', comment: '必填时段' },
    readable: { type: BOOLEAN, allowNull: false, cnName: '可读字段', comment: '可读时段' },
    writable: { type: BOOLEAN, allowNull: false, cnName: '可写字段', comment: '可写时段' },
    indexOf: { type: INTEGER, allowNull: true, defaultValue: 999, cnName: '排序序号', comment: '排序序号' },
    remark: { type: STRING, allowNull: true, cnName: '备注信息', comment: '备注信息' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'dynamicFormDetail',
    tableCnName: '动态表单详情',
  });

  dynamicFormDetail.associate = function() {
    const ms = app.model.models;
    ms.dynamicFormDetail.belongsTo(ms.dynamicForm, { as: 'dynamicForm', foreignKey: 'dynamicFormId', constraint: false });
  };

  return dynamicFormDetail;
};
