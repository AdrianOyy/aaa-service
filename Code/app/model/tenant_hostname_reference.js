'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const tenant_hostname_reference = app.model.define('tenant_hostname_reference', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    tenantCode: { type: STRING(256), allowNull: false, cnName: '项目Id', comment: '项目Id' },
    windows_vm_hostname_reference: { type: STRING, allowNull: false, cnName: '用户组Id', comment: '用户组Id' },
  }, {
    paranoid: true,
    tableName: 'tenant_hostname_reference',
    tableCnName: '项目域名关联',
  });

  tenant_hostname_reference.associate = function() {
    const ms = app.model.models;
    ms.tenant_hostname_reference.belongsTo(ms.tenant, { as: 'tenant', foreignKey: 'tenantCode', targetKey: 'code', constraint: false });
  };

  return tenant_hostname_reference;
};
