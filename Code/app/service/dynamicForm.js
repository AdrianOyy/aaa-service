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
      fieldList += 'UNIQUE(pid)';
      const basicFormSQL = `CREATE TABLE ${formKey} (${fieldList})`;
      return basicFormSQL;
    }

    async getChildTableSQLList(parentFormKey, list) {
      const childTableSQLList = [];
      list.forEach(el => {
        let fieldList = '`id` int unsigned not null auto_increment primary key, `pid` int,';
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
        fieldList += `FOREIGN KEY(pid) REFERENCES ${parentFormKey}(pid) on delete cascade on update cascade`;
        const childTableSQL = `CREATE TABLE ${el.id} (${fieldList})`;
        childTableSQLList.push(childTableSQL);
      });
      return childTableSQLList;
    }

    async getBasicDynamicFormDetailData(dynamicFormId, list) {
      const dataList = [];
      list.forEach(el => {
        const fieldName = el.id;
        const fieldType = el.type;
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
        };
        dataList.push(model);
      });

      return dataList;
    }

    async getChildDynamicFormDetailData(list) {

    }

  };
};
