'use strict';

module.exports = app => {
  return class extends app.Service {
    /**
     *
     * @param {string} formKey parent table name
     * @param {object} parentData parent table data
     * @return {Promise<string>} insetSQL parent table's insert SQL
     */
    async getParentFormInsetSQL(formKey, version, parentData, userId) {
      return getInsertSQL(formKey, version, parentData, userId);
    }

    /**
     *
     * @param {string} childFormKey child table name
     * @param {object[]} childDataList child table data
     * @return {Promise<string[]>} insetSQL child table's insert SQL list
     */
    async getChildFormInsertSQLList(childFormKey, version, childDataList, userId) {
      const SQLList = [];
      for (let i = 0; i < childDataList.length; i++) {
        SQLList.push(getInsertSQL(childFormKey, version, childDataList[i], userId));
      }
      return SQLList;
    }

    async getChildFormTable(parentFormKey, version) {
      const sql = `SELECT * FROM dynamicForm where parentId=(SELECT id FROM dynamicForm WHERE version="${version}" AND formKey="${parentFormKey}");`;
      const [[ target ]] = await app.model.query(sql);
      return target;
    }

    async getDIYFormDetailByDateRange(formKey, startDay, endDay) {
      const latestVersion = await this.getLatestVersion(formKey);
      if (!latestVersion) return null;
      const childTable = await this.getChildFormTable(formKey, latestVersion);
      let parentSQL;
      if (startDay && !endDay) {
        parentSQL = `SELECT * FROM ${formKey}${latestVersion} WHERE createdAt >= "${startDay}" `;
      } else if (!startDay && endDay) {
        parentSQL = `SELECT * FROM ${formKey}${latestVersion} WHERE createdAt <= "${endDay}"`;
      } else if (!startDay && !endDay) {
        parentSQL = `SELECT * FROM ${formKey}${latestVersion}`;
      } else {
        parentSQL = `SELECT * FROM ${formKey}${latestVersion} WHERE createdAt BETWEEN "${startDay}" AND "${endDay}"`;
      }
      const [ parentDataList ] = await app.model.query(parentSQL);
      if (!parentDataList || !parentDataList.length) return null;
      if (childTable && childTable.formKey) {
        for (const parentData of parentDataList) {
          const parentId = parentData.id;
          const [ childDataList ] = await app.model.query(`SELECT * FROM ${childTable.formKey}${latestVersion} WHERE parentId=${parentId}`);
          if (childDataList && childDataList.length) {
            parentData.childDataList = childDataList;
          }
        }
      }
      return parentDataList;
    }

    /**
     * get dynamic form detail by pid
     * @param {String | Number} pid
     * @param {String} formKey
     * @param {String} childFormKey
     * @param {String} version
     * @return {Promise<{object}>}
     */
    async getDIYFormDetail(pid, formKey, childFormKey, version) {
      const parentSQL = `SELECT * FROM ${formKey}${version} WHERE pid = '${pid}'`;
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
      const whereSql = `pid = '${pid}'`;
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


    async getLatestVersion(formKey) {
      const sql = `SELECT version FROM dynamicForm WHERE formKey='${formKey}' ORDER BY version + 0 DESC LIMIT 1;`;
      const [[ target ]] = await app.model.query(sql);
      return target ? target.version : null;
    }

    /**
     * Get workflow table by form key and version
     * @param {String}formKey form key
     * @param {String} version version
     * @return {Promise<Array<Object>>} tableDetail table Detail
     */
    async getWorkflowTableDetail(formKey, version) {
      const SQL = `SELECT dynamicForm.id _id, dynamicForm.formKey _formKey, detail.* FROM dynamicForm LEFT JOIN dynamicFormDetail detail on dynamicForm.id = detail.dynamicFormId WHERE dynamicForm.formKey='${formKey}' AND dynamicForm.version='${version}'`;
      const [ detail ] = await app.model.query(SQL);
      return detail;
    }

    async getChildTableDetail(parentId, version) {
      const SQL = `SELECT dynamicForm.id _id, dynamicForm.formKey _formKey, detail.* FROM dynamicForm LEFT JOIN dynamicFormDetail detail on dynamicForm.id = detail.dynamicFormId WHERE dynamicForm.parentId='${parentId}' AND dynamicForm.version='${version}'`;
      const [ detail ] = await app.model.query(SQL);
      return detail;
    }

    async getForeignData(tableName) {
      const SQL = `SELECT * FROM ${tableName} WHERE deletedAt IS NULL`;
      const [ dataList ] = await app.model.query(SQL);
      return dataList;
    }

    async getForeignValue(data, map, datalist) {
      for (const key in data) {
        if (map.get(key) && map.get(key).foreignKey) {
          const foreignData = datalist.get(map.get(key).foreignTable);
          const target = foreignData.find(el => el[map.get(key).foreignKey] + '' === data[key] + '');
          data[key] = target;
        }
      }
    }

    /**
     * Get workflow information by formKey filter with date range
     * @param {String} formKey form key
     * @param { String | undefined | null } startTime start time
     * @param { String | undefined | null } endTime end time
     * @return {Promise<Object>} form information
     */
    async getWorkflowInformation(formKey, startTime, endTime) {
      const latestVersion = await this.getLatestVersion(formKey);
      if (!latestVersion) return null;
      const parentTable = await this.getWorkflowTableDetail(formKey, latestVersion);
      if (!parentTable || !parentTable.length) return null;
      const parentDataTableName = formKey + latestVersion + '';
      let childDataTableName = '';
      const childTable = await this.getChildTableDetail(parentTable[0]._id, latestVersion);
      const parentForeignTable = new Map();
      const childForeignTable = new Map();
      const foreignDataList = new Map();
      for (const table of parentTable) {
        if (table.foreignTable) {
          parentForeignTable.set(table.fieldName, {
            foreignKey: table.foreignKey,
            foreignTable: table.foreignTable,
            foreignDisplayKey: table.foreignDisplayKey,
          });
          if (!foreignDataList.has(table.foreignTable)) {
            const foreignData = await this.getForeignData(table.foreignTable);
            foreignDataList.set(table.foreignTable, foreignData);
          }
        }
      }
      if (childTable && childTable.length) {
        childDataTableName = childTable[0]._formKey + latestVersion + '';
        for (const table of childTable) {
          if (table.foreignTable) {
            childForeignTable.set(table.fieldName, {
              foreignKey: table.foreignKey,
              foreignTable: table.foreignTable,
              foreignDisplayKey: table.foreignDisplayKey,
            });
            if (!foreignDataList.has(table.foreignTable)) {
              const foreignData = await this.getForeignData(table.foreignTable);
              foreignDataList.set(table.foreignTable, foreignData);
            }
          }
        }
      }
      let parentSQL;
      if (startTime && !endTime) {
        parentSQL = `SELECT * FROM ${parentDataTableName} WHERE createdAt >= "${startTime}" `;
      } else if (!startTime && endTime) {
        parentSQL = `SELECT * FROM ${parentDataTableName} WHERE createdAt <= "${endTime}"`;
      } else if (!startTime && !endTime) {
        parentSQL = `SELECT * FROM ${parentDataTableName}`;
      } else {
        parentSQL = `SELECT * FROM ${parentDataTableName} WHERE createdAt BETWEEN "${startTime}" AND "${endTime}"`;
      }
      const [ parentDataList ] = await app.model.query(parentSQL);
      for (const parentData of parentDataList) {
        await this.getForeignValue(parentData, parentForeignTable, foreignDataList);
        const parentId = parentData.id;
        if (childDataTableName) {
          const [ childDataList ] = await app.model.query(`SELECT * FROM ${childDataTableName} WHERE parentId=${parentId}`);
          if (childDataList && childDataList.length) {
            for (const childData of childDataList) {
              await this.getForeignValue(childData, childForeignTable, foreignDataList);
            }
            parentData.childDataList = childDataList;
          }
        }
      }
      return parentDataList;
    }
  };
};

/**
 *
 * @param {string} formKey  table name
 * @param {object} data  table data
 * @return {Promise<string>} insetSQL table's insert SQL
 */
function getInsertSQL(formKey, version, data, userId) {
  let fieldType = '';
  let fieldValue = '';
  for (const key in data) {
    fieldType += `\`${key}\`,`;
    fieldValue += !data[key] || !data[key].value ? 'null,' : data[key].value !== '' ? `\'${data[key].value}\',` : 'null,';
  }
  fieldType += '\`createdAt\`,\`updatedAt\`,\`createBy\`,\`updateBy\`';
  fieldValue += `\'${getNow()}\',\'${getNow()}\',\'${userId}\',\'${userId}\'`;
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
    if (key !== 'id' && key !== 'checkState' && key !== 'checkName' && key !== 'createBy' && key !== 'updateBy') {
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

