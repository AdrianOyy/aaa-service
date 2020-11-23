'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const non_clinical_applications = app.model.define('non_clinical_applications', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    name: { type: STRING(256), allowNull: false, cnName: '名称', comment: '名称' },
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
