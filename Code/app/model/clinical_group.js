'use strict';

module.exports = app => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const clinical_group = app.model.define('clinical_group', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    name: { type: STRING(256), allowNull: false, cnName: '名称', comment: '名称' },
    manage_group_id: { type: INTEGER, allowNull: false, cnName: '用户组Id', comment: '用户组Id' },
    approval_group_id: { type: INTEGER, allowNull: false, cnName: '用户组Id', comment: '用户组Id' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'clinical_group',
    tableCnName: '组关联',
  });

  clinical_group.associate = function() {
    const ms = app.model.models;
    ms.clinical_group.belongsTo(ms.ad_group, { as: 'clinical_group', foreignKey: 'manage_group_id', constraint: false });
    ms.clinical_group.belongsTo(ms.ad_group, { as: 'approval_group', foreignKey: 'approval_group_id', constraint: false });
  };

  return clinical_group;
};
