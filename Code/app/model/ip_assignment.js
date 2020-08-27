'use strict';

module.exports = app => {
  const { INTEGER, DATE, STRING } = app.Sequelize;

  const ip_assignment = app.model.define('ip_assignment', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    IP: { type: STRING, allowNull: false, cnName: 'IP', comment: 'IP' },
    DCId: { type: INTEGER, allowNull: false, cnName: '数据中心Id', comment: '数据中心Id' },
    hostname: { type: STRING, allowNull: true, cnName: '域名', comment: '域名' },
    projectTeam: { type: STRING, allowNull: true, cnName: '项目组', comment: '项目组' },
    networkType: { type: STRING, allowNull: true, cnName: '网络类型', comment: '网络类型' },
    IPPool: { type: STRING, allowNull: true, cnName: 'IP池', comment: 'IP池' },
    vlanId: { type: INTEGER, allowNull: true, cnName: 'vlanId', comment: 'vlanId' },
    assignedDate: { type: DATE, allowNull: true, cnName: '分配日期', comment: '分配日期' },
    remark: { type: STRING, allowNull: true, cnName: '备注', comment: '备注' },
  }, {
    paranoid: true,
    tableName: 'ip_assignment',
    tableCnName: 'IP 分配',
  });

  ip_assignment.associate = function() {
    const ms = app.model.models;
    ip_assignment.belongsTo(ms.vm_cdc, { as: 'DC', foreignKey: 'DCId', constraint: false });
  };

  return ip_assignment;
};
