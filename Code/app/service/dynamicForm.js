'use strict';

module.exports = app => {
  return class extends app.Service {
    async getBasicSQL(formKey, list) {
      let fieldList = '`id` int unsigned not null auto_increment primary key, `pid` int,';
      list.forEach(el => {
        let fieldType = '';
        switch (el.type) {
          case 'string':
            fieldType = 'varchar(255)';
            break;
          case 'boolean':
            fieldType = 'tinyint';
            break;
          default:
            fieldType = 'int';
            break;
        }
        fieldList += `\`${el.id}\` ${fieldType},`;
      });
      fieldList += '`createdAt` datetime, `updatedAt` datetime, `deletedAt` datetime, `createBy` int, `updateBy` int, UNIQUE(pid)';
      const basicFormSQL = `CREATE TABLE ${formKey} (${fieldList})`;
      return basicFormSQL;
    }

    async getChildTableSQLList(parentFormKey, list) {
      const childTableSQLList = [];
      list.forEach(el => {
        let fieldList = '`id` int unsigned not null auto_increment primary key, `pid` int, `parentId` int,';
        for (const key in el.childTable) {
          let fieldType = '';
          switch (el.childTable[key]) {
            case 'string':
              fieldType = 'varchar(255)';
              break;
            case 'boolean':
              fieldType = 'tinyint';
              break;
            default:
              fieldType = 'int';
              break;
          }
          fieldList += `\`${key}\` ${fieldType},`;
        }
        fieldList += `\`createdAt\` datetime, \`updatedAt\` datetime, \`deletedAt\` datetime, \`createBy\` int, \`updateBy\` int,FOREIGN KEY(parentId) REFERENCES ${parentFormKey}(id) on delete cascade on update cascade`;
        const childTableSQL = `CREATE TABLE ${el.id} (${fieldList})`;
        childTableSQLList.push(childTableSQL);
      });
      return childTableSQLList;
    }

    async getBasicDynamicFormDetailData(dynamicFormId, list) {
      const dataList = getForeign(list, dynamicFormId);
      return dataList;
    }

    async getChildDynamicFormDetailData(childTableList, childDynamicFormList) {
      const childList = [];
      for (let i = 0; i < childTableList.length; i++) {
        for (let j = 0; j < childDynamicFormList.length; j++) {
          if (childDynamicFormList[j].formKey === childTableList[i].id) {
            const model = {
              id: childTableList[i].id,
              name: childTableList[i].name,
              type: childTableList[i].type,
              readable: childTableList[i].readable,
              writable: childTableList[i].writable,
              required: childTableList[i].required,
              childTable: childTableList[i].childTable,
              formProperty: childTableList[i].formProperty,
              dynamicFormId: childDynamicFormList[j].id,
            };
            childList.push(model);
            break;
          }
        }
      }
      const list = [];
      for (let i = 0; i < childList.length; i++) {
        const el = childList[i];
        for (const key in el.childTable) {
          const model = {
            id: key,
            dynamicFormId: el.dynamicFormId,
            name: el.childTable[key],
            type: 'string',
            readable: el.readable,
            writable: el.writable,
            required: el.required,
          };
          list.push(model);
        }
      }
      const dataList = getForeign(list);
      return dataList;
    }

    async getInsertSQL(dynmaic, filelist) {
      let fieldType = '';
      let fieldValue = '';
      for (const key in filelist) {
        fieldType += `\`${key}\`,`;
        fieldValue += `${filelist[key]},`;
      }
      fieldType += '\`createdAt\`,\`updatedAt\`';
      fieldValue += '\'2020-08-21\',\'2020-08-21\'';
      const basicFormSQL = `INSERT INTO ${dynmaic.formKey}(${fieldType}) VALUES (${fieldValue})`;
      return basicFormSQL;
    }

  };
};

function getForeign(list, dId) {
  const dataList = [];
  list.forEach(el => {
    const dynamicFormId = dId ? dId : el.dynamicFormId;
    const fieldName = el.id;
    const fieldType = el.type;
    const readable = el.readable;
    const writable = el.writable;
    const required = el.required;
    let inputType = 'text';
    let foreignTable = null;
    let foreignKey = null;
    let foreignDisplayKey = null;
    let showOnRequest = true;

    if (el.name) {
      if (el.name[el.name.length - 1] === '!') {
        showOnRequest = false;
      }
      const paramsList = el.name.split('#');
      if (paramsList.length > 2) return false;
      if (paramsList.length === 2) {
        let inputParams = paramsList[1].trim();
        if (inputParams[inputParams.length - 1] === '!') {
          showOnRequest = false;
          inputParams = inputParams.slice(0, -1);
        }
        inputType = inputParams.trim();
      }
      let foreign = paramsList[0].trim();
      if (foreign[0] === '$' && foreign[1] === '{' && foreign[foreign.length - 1] === '}') {
        foreign = foreign.slice(2, -1);
        const foreignList = foreign.split('|');
        foreignTable = foreignList[0].split('.')[0].trim();
        foreignKey = foreignList[0].split('.')[1].trim();
        if (foreignList.length > 1) {
          foreignDisplayKey = foreignList[1].trim();
        } else {
          foreignDisplayKey = foreignKey;
        }
      }
    }

    const model = {
      dynamicFormId,
      fieldName,
      fieldType,
      inputType,
      foreignTable,
      foreignKey,
      foreignDisplayKey,
      showOnRequest,
      readable,
      writable,
      required,
    };
    dataList.push(model);
  });
  return dataList;
}
