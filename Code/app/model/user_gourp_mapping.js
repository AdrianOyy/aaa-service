'use strict';

module.exports = app => {
  const { INTEGER, DATE } = app.Sequelize;

  const user_gourp_mapping = app.model.define('user_gourp_mapping', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    userId: { type: INTEGER, allowNull: false, cnName: '用户Id', comment: '用户Id' },
    groupId: { type: INTEGER, allowNull: false, cnName: 'AD Group Id', comment: 'AD Group Id' },
    createdAt: { type: DATE, allowNull: true, cnName: '创建时间', comment: '创建时间' },
    updatedAt: { type: DATE, allowNull: true, cnName: '更新时间', comment: '更新时间' },
  }, {
    paranoid: true,
    tableName: 'user_gourp_mapping',
    tableCnName: '用户项目组有效期',
  });

  user_gourp_mapping.associate = function() {
    const ms = app.model.models;
    ms.user_gourp_mapping.belongsTo(ms.ad_group, { as: 'ad_group', foreignKey: 'groupId', constraint: false });
    ms.user_gourp_mapping.belongsTo(ms.user, { as: 'user', foreignKey: 'userId', constraint: false });
  };

  return user_gourp_mapping;
};
