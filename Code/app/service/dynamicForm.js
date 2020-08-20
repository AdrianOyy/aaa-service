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
      fieldList = fieldList.toString().slice(0, -1);
      const basicFormSQL = `CREATE TABLE ${formKey} (${fieldList})`;
      return basicFormSQL;
    }

    async getChildTableSQLList(list) {
      const childeTableSQLList = [];
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
        fieldList = fieldList.toString().slice(0, -1);
        const childeTableSQL = `CREATE TABLE ${el.id} (${fieldList})`;
        childeTableSQLList.push(childeTableSQL);
      });
      return childeTableSQLList;
    }

    async getSQL(SQLList) {
      let res = '';
      SQLList.forEach(el => {
        res += el + ';';
      });
      return res;
    }
  };
};
