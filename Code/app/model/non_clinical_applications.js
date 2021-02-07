'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const non_clinical_applications = app.model.define('non_clinical_applications', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    type: { type: STRING(256), allowNull: false, cnName: '名称', comment: '名称' },
    code: { type: STRING(256), allowNull: false, cnName: '编号', comment: '编号' },
  }, {
    paranoid: true,
    tableName: 'non_clinical_applications',
    tableCnName: 'non_clinical_applications',
  });

  non_clinical_applications.associate = function() {
    // const ms = app.model.models;
  };

  return non_clinical_applications;
};
