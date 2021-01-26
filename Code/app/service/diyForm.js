'use strict';

module.exports = app => {
  return class extends app.Service {
    /**
     *
     * @param {string} formKey parent table name
     * @param {object} parentData parent table data
     * @return {Promise<string>} insetSQL parent table's insert SQL
     */
    async getParentFormInsetSQL(formKey, version, parentData) {
      return getInsertSQL(formKey, version, parentData);
    }

    /**
     *
     * @param {string} childFormKey child table name
     * @param {object[]} childDataList child table data
     * @return {Promise<string[]>} insetSQL child table's insert SQL list
     */
    async getChildFormInsertSQLList(childFormKey, version, childDataList) {
      const SQLList = [];
      for (let i = 0; i < childDataList.length; i++) {
        SQLList.push(getInsertSQL(childFormKey, version, childDataList[i]));
      }
      return SQLList;
    }

    /**
    * get dynamic form detail by pid
    * @param {string | number} pid
    * @param {string} formKey
    * @param {string} childFormKey
    * @return {Promise<{object}>}
    */
    async getDIYFormDetail(pid, formKey, childFormKey, version) {
      const parentSQL = `SELECT * FROM ${formKey}${version} WHERE pid = ${pid}`;
      const [ parentDataList ] = await app.model.query(parentSQL);
      if (parentDataList.length === 0) return false;
      const parentData = parentDataList[0];
      const parentId = parentData.id;
      if (childFormKey) {
        const childSQL = `SELECT * FROM ${childFormKey}${version} WHERE parentId = ${parentId}`;
        const [ childDataList ] = await app.model.query(childSQL);
        const model = {
          parentData,
          childDataList,
        };
        return model;
      }
      const model = {
        parentData,
        childDataList: null,
      };
      return model;

    }

    /**
     *
     * @param {string} formKey parent table name
     * @param {object} parentData parent table data
     * @return {Promise<string>} insetSQL parent table's insert SQL
     */
    async getParentFormUpdateSQL(formKey, version, parentData, pid) {
      const whereSql = `pid = ${pid}`;
      return getUpdateSQL(formKey, version, parentData, whereSql);
    }

    /**
     *
     * @param {string} childFormKey child table name
     * @param {object[]} childDataList child table data
     * @return {Promise<string[]>} insetSQL child table's insert SQL list
     */
    async getChildFormUpdateSQLList(childFormKey, version, childDataList) {
      const SQLList = [];
      for (let i = 0; i < childDataList.length; i++) {
        const id = childDataList[i].id.value;
        const whereSql = `id = ${id}`;
        SQLList.push(getUpdateSQL(childFormKey, version, childDataList[i], whereSql));
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
function getInsertSQL(formKey, version, data) {
  let fieldType = '';
  let fieldValue = '';
  for (const key in data) {
    fieldType += `\`${key}\`,`;
    fieldValue += !data[key] || !data[key].value ? 'null,' : data[key].value !== '' ? `\'${data[key].value}\',` : 'null,';
  }
  fieldType += '\`createdAt\`,\`updatedAt\`';
  fieldValue += `\'${getNow()}\',\'${getNow()}\'`;
  return `INSERT INTO ${formKey}${version}(${fieldType}) VALUES (${fieldValue})`;
}

/**
 *
 * @param {string} formKey  table name
 * @param {object} data  table data
 * @return {Promise<string>} insetSQL table's insert SQL
 */
// eslint-disable-next-line no-unused-vars
function getUpdateSQL(formKey, version, data, where) {
  let fieldValue = '';
  for (const key in data) {
    if (key !== 'id' && key !== 'checkState' && key !== 'checkName') {
      if ((key === 'createdAt' || key === 'updatedAt') && data[key].value) {
        const [ date, time ] = data[key].value.split('T');
        const [ f ] = time.split('.');
        fieldValue += !data[key] || !data[key].value ? ` ${key} = null,` : data[key].value !== '' ? ` ${key} = '${date} ${f}',` : ` ${key} = null,`;
        continue;
      }
      fieldValue += !data[key] || !data[key].value ? ` ${key} = null,` : data[key].value !== '' ? ` ${key} = '${data[key].value}',` : ` ${key} = null,`;
    }
  }
  fieldValue = fieldValue.substring(0, fieldValue.length - 1);
  return `UPDATE  ${formKey}${version} SET  ${fieldValue} WHERE ${where}`;
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

