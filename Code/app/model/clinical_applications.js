'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const clinical_applications = app.model.define('clinical_applications', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true, cnName: 'ID' },
    name: { type: STRING(256), allowNull: false, cnName: '名称', comment: '名称' },
  }, {
    paranoid: true,
    tableName: 'clinical_applications',
    tableCnName: 'clinical_applications',
  });

  clinical_applications.associate = function() {
    // const ms = app.model.models;
  };

  return clinical_applications;
};
