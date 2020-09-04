'use strict';

module.exports = app => {
  return class extends app.Service {
    /**
     *
     * @param {string} formKey parent table name
     * @param {object} parentData parent table data
     * @return {Promise<string>} insetSQL parent table's insert SQL
     */
    async getParentFormInsetSQL(formKey, parentData) {
      return getInsertSQL(formKey, parentData);
    }

    /**
     *
     * @param {string} childFormKey child table name
     * @param {object[]} childDataList child table data
     * @return {Promise<string[]>} insetSQL child table's insert SQL list
     */
    async getChildFormInsertSQLList(childFormKey, childDataList) {
      const SQLList = [];
      for (let i = 0; i < childDataList.length; i++) {
        SQLList.push(getInsertSQL(childFormKey, childDataList[i]));
      }
      return SQLList;
    }

    /**
     *
     * @param {string} formKey parent table name
     * @param {object} parentData parent table data
     * @return {Promise<string>} insetSQL parent table's insert SQL
     */
    async getParentFormUpdateSQL(formKey, parentData, formId) {
      return getUpdateSQL(formKey, parentData, formId);
    }

    /**
     *
     * @param {string} childFormKey child table name
     * @param {object[]} childDataList child table data
     * @return {Promise<string[]>} insetSQL child table's insert SQL list
     */
    async getChildFormUpdateSQLList(childFormKey, childDataList) {
      const SQLList = [];
      for (let i = 0; i < childDataList.length; i++) {
        console.log(childDataList[i]);
        // SQLList.push(getUpdateSQL(childFormKey, childDataList[i]));
      }
      return SQLList;
    }
  };
};

/**
 *
 * @param {string} formKey  table name
 * @param {object} data  table data
 * @return {Promise<string>} insetSQL table's insert SQL
 */
function getInsertSQL(formKey, data) {
  let fieldType = '';
  let fieldValue = '';
  for (const key in data) {
    fieldType += `\`${key}\`,`;
    fieldValue += !data[key] || !data[key].value ? 'null,' : `\'${data[key].value}\',`;
  }
  fieldType += '\`createdAt\`,\`updatedAt\`';
  fieldValue += `\'${getNow()}\',\'${getNow()}\'`;
  return `INSERT INTO ${formKey}(${fieldType}) VALUES (${fieldValue})`;
}

/**
 *
 * @param {string} formKey  table name
 * @param {object} data  table data
 * @return {Promise<string>} insetSQL table's insert SQL
 */
// eslint-disable-next-line no-unused-vars
function getUpdateSQL(formKey, data, formId) {
  let fieldValue = '';
  for (const key in data) {
    fieldValue += !data[key] || !data[key].value ? ` ${key} = null ` : ` ${key} = \'${data[key].value}\' `;
  }
  return `UPDATE  ${formKey} SET  ${fieldValue} WHERE ID = ${formId}`;
}

function getNow() {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;
  const date = new Date().getDate();
  const hour = new Date().getHours();
  const minute = new Date().getMinutes();
  const second = new Date().getSeconds();
  return year + '-' + month + '-' + date + ' ' + hour + ':' + minute + ':' + second;
}

