'use strict';
const { CREATE } = require('../constant/stepName');

module.exports = app => {
  return class extends app.Service {
    async getBasicSQL(formKey, list) {
      let fieldList = '`id` int unsigned not null auto_increment primary key, `pid` varchar(512),';
      list.forEach(el => {
        let fieldType = '';
        switch (el.type) {
          case 'string':
            fieldType = 'varchar(512)';
            break;
          case 'boolean':
            fieldType = 'tinyint';
            break;
          case 'long':
            fieldType = 'int';
            break;
          case 'date':
            fieldType = 'datetime';
            break;
          default:
            fieldType = 'varchar(512)';
            break;
        }
        fieldList += `\`${el.id.toLowerCase().replace(/\s+/g, '_')}\` ${fieldType},`;
      });
      fieldList += '`createdAt` datetime, `updatedAt` datetime, `deletedAt` datetime, `createBy` int, `updateBy` int, UNIQUE(pid)';
      const basicFormSQL = `CREATE TABLE IF NOT EXISTS ${formKey} (${fieldList})`;
      return basicFormSQL;
    }

    async getChildTableSQLList(parentFormKey, list) {
      const childTableSQLList = [];
      list.forEach(el => {
        let fieldList = '`id` int unsigned not null auto_increment primary key, `pid` varchar(512), `parentId` int unsigned,';
        for (const key in el.childTable) {
          let fieldType = '';
          switch (el.childTable[key]) {
            case 'string':
              fieldType = 'varchar(512)';
              break;
            case 'boolean':
              fieldType = 'tinyint';
              break;
            case 'long':
              fieldType = 'int';
              break;
            case 'date':
              fieldType = 'datetime';
              break;
            default:
              fieldType = 'varchar(512)';
              break;
          }
          fieldList += `\`${key.toLowerCase().replace(/\s+/g, '_')}\` ${fieldType},`;
        }
        fieldList += `\`createdAt\` datetime, \`updatedAt\` datetime, \`deletedAt\` datetime, \`createBy\` int, \`updateBy\` int,FOREIGN KEY(parentId) REFERENCES ${parentFormKey}(id) on delete cascade on update cascade`;
        const childTableSQL = `CREATE TABLE IF NOT EXISTS ${el.id} (${fieldList})`;
        childTableSQLList.push(childTableSQL);
      });
      return childTableSQLList;
    }

    async getBasicNewSQL(formKey, list, version) {
      let fieldList = '`id` int unsigned not null auto_increment primary key, `pid` varchar(512),';
      list.forEach(el => {
        let fieldType = '';
        switch (el.fieldType) {
          case 'string':
            fieldType = 'varchar(512)';
            break;
          case 'boolean':
            fieldType = 'tinyint';
            break;
          case 'int':
            fieldType = 'int';
            break;
          case 'date':
            fieldType = 'datetime';
            break;
          default:
            fieldType = 'varchar(512)';
            break;
        }
        fieldList += `\`${el.fieldName.toLowerCase().replace(/\s+/g, '_')}\` ${fieldType},`;
      });
      fieldList += '`createdAt` datetime, `updatedAt` datetime, `deletedAt` datetime, `createBy` int, `updateBy` int, UNIQUE(pid)';
      const basicFormSQL = `CREATE TABLE IF NOT EXISTS ${formKey}${version} (${fieldList})`;
      return basicFormSQL;
    }

    async getChildTableSQLChild(parentFormKey, childFormKey, list, version) {
      let fieldList = '`id` int unsigned not null auto_increment primary key, `pid` varchar(512), `parentId` int unsigned,';
      list.forEach(el => {
        let fieldType = '';
        switch (el.fieldType) {
          case 'string':
            fieldType = 'varchar(512)';
            break;
          case 'boolean':
            fieldType = 'tinyint';
            break;
          case 'int':
            fieldType = 'int';
            break;
          case 'date':
            fieldType = 'datetime';
            break;
          default:
            fieldType = 'varchar(512)';
            break;
        }
        fieldList += `\`${el.fieldName.toLowerCase().replace(/\s+/g, '_')}\` ${fieldType},`;
      });
      fieldList += `\`createdAt\` datetime, \`updatedAt\` datetime, \`deletedAt\` datetime, \`createBy\` int, \`updateBy\` int,FOREIGN KEY(parentId) REFERENCES ${parentFormKey}${version}(id) on delete cascade on update cascade`;
      const basicFormSQL = `CREATE TABLE IF NOT EXISTS ${childFormKey}${version} (${fieldList})`;
      return basicFormSQL;
    }

    async getBasicDynamicFormDetailData(dynamicFormId, list) {
      const dataList = addForeign(list, dynamicFormId);
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
      const dataList = addForeign(list);
      return dataList;
    }

    async getInsertSQL(dynmaic, filelist) {
      let fieldType = '';
      let fieldValue = '';
      for (const key in filelist) {
        fieldType += `\`${key}\`,`;
        fieldValue += !filelist[key] ? 'null,' : `\'${filelist[key]}\',`;
      }
      fieldType += '\`createdAt\`,\`updatedAt\`';
      fieldValue += '\'2020-08-21\',\'2020-08-21\'';
      const basicFormSQL = `INSERT INTO ${dynmaic}(${fieldType}) VALUES (${fieldValue})`;
      return basicFormSQL;
    }

    async getApplicationType(formKey, formId) {
      const { ctx } = this;

      // ????????????
      const dynamicForm = await ctx.model.models.dynamicForm.findOne({
        where: {
          formKey,
        },
      });
      if (dynamicForm) {
        const sonForm = await ctx.model.models.dynamicForm.findOne({ where: { parentId: dynamicForm.id } });
        if (sonForm) {
          const SQL = `SELECT * FROM ${sonForm.formKey} where parentId = ${formId}`;
          const [ basicForeign ] = await app.model.query(SQL);
          if (basicForeign) {
            return basicForeign;
          }
          return null;
        }
      }
      return null;
    }

    async getDynamicForm(params) {
      const { ctx } = this;
      const { formKey, version, deploymentId } = params;
      if (!formKey && !deploymentId) return false;
      // ????????????
      const dynamicForm = await ctx.model.models.dynamicForm.findOne({
        where: formKey ? { formKey, version } : { deploymentId, parentId: null },
        include: [
          {
            model: ctx.model.models.dynamicForm,
            as: 'childTable',
            include: {
              model: ctx.model.models.dynamicFormDetail,
              as: 'dynamicFormDetail',
            },
          },
          {
            model: ctx.model.models.dynamicFormDetail,
            as: 'dynamicFormDetail',
          },
        ],
      });
      return dynamicForm;
    }

    async getDynamicFormWithForeignTable(deploymentId, stepName) {
      const dynamicForm = await this.getDynamicForm({ deploymentId });
      if (!dynamicForm) return false;
      const { workflowName, formKey, dynamicFormDetail, childTable, version } = dynamicForm;
      let childFormKey = '';
      // ???????????????
      const parentFormDetail = [];
      for (let i = 0; i < dynamicFormDetail.length; i++) {
        let itemList = null;
        const el = dynamicFormDetail[i];
        if (el.foreignTable !== null && el.foreignTable !== '') {
          itemList = await this.getForeignData(el.foreignTable, stepName);
        }
        parentFormDetail.push(Object.assign(el.dataValues, { itemList, label: el.fieldDisplayName, type: el.inputType, labelField: el.foreignDisplayKey, valueField: el.foreignKey }));
      }
      // ???????????????
      const childFormDetail = [];
      if (childTable.length > 0) {
        childFormKey = childTable[0].formKey;
        for (let i = 0; i < childTable[0].dynamicFormDetail.length; i++) {
          let itemList = null;
          const el = childTable[0].dynamicFormDetail[i];
          if (el.foreignTable !== null && el.foreignTable !== '') {
            itemList = await this.getForeignData(el.foreignTable, stepName);
          }
          childFormDetail.push(Object.assign(el.dataValues, { itemList, label: el.fieldDisplayName, type: el.inputType, labelField: el.foreignDisplayKey, valueField: el.foreignKey }));
        }
      }

      return {
        workflowName,
        formKey,
        childFormKey,
        parentFormDetail,
        childFormDetail,
        version,
      };

    }

    // ?????????????????????????????????????????? id ????????????
    async getDetailByKey(formKey, version, formId) {
      // ????????????
      const dynamicForm = await this.getDynamicForm({ formKey, version });
      if (!dynamicForm) return false;

      // ???????????????
      const basicSQL = `SELECT * FROM ${dynamicForm.formKey}${version} where ${dynamicForm.formKey}${version}.id = ${formId} ;`;
      const [[ basicTable ]] = await app.model.query(basicSQL);
      if (!basicTable) return {};
      for (let i = 0; i < dynamicForm.dynamicFormDetail.length; i++) {
        const el = dynamicForm.dynamicFormDetail[i].dataValues;
        if (el.foreignTable && el.foreignKey && el.inputType !== 'checkbox' && el.inputType !== 'procedure') {
          const SQL = `SELECT * FROM \`${el.foreignTable}\` where ${el.foreignTable}.${el.foreignKey} = ${basicTable[el.fieldName]}`;
          const [[ basicForeign ]] = await app.model.query(SQL);
          basicTable[el.fieldName] = basicForeign;
        }
      }

      // ???????????????
      const { childTable } = dynamicForm;
      if (childTable.length > 0) {
        const el = childTable[0].dataValues;
        basicTable.childFormKey = el.formKey;
        const childSQL = `SELECT * FROM ${el.formKey}${version} where ${el.formKey}${version}.parentId = ${basicTable.id};`;
        const [ childList ] = await app.model.query(childSQL);
        for (let j = 0; j < childList.length; j++) {
          const child = childList[j];
          if (child) {
            for (let i = 0; i < el.dynamicFormDetail.length; i++) {
              const it = el.dynamicFormDetail[i].dataValues;
              if (it.foreignTable && it.foreignKey && it.inputType !== 'checkbox' && el.inputType !== 'procedure') {
                const SQL = `SELECT * FROM \`${it.foreignTable}\` where ${it.foreignTable}.${it.foreignKey} = ${child[it.fieldName]}`;
                const [[ basicForeign ]] = await app.model.query(SQL);
                child[it.fieldName] = basicForeign;
              }
            }
          }
        }
        basicTable.childTable = childList;
      }
      return basicTable;
    }

    // ???????????????????????????????????????????????????????????????
    async getForeignData(tableName, stepName) {
      const { ctx } = this;
      let foreignList = null;
      switch (tableName) {
        case 'tenant':
          stepName === CREATE ?
            foreignList = await ctx.service.tenant.getUserTenantList(ctx.authUser.id) :
            foreignList = await ctx.service.tenant.getAllTenant();
          break;
        default:
          foreignList = (await app.model.query(`SELECT * FROM \`${tableName}\` WHERE deletedAt IS NULL`))[0];
      }
      return foreignList;
    }

    // ???????????????????????????
    /**
     * @param { string[] } formKeyList startForm's parent and child's formKey list
     * @return {Promise<boolean>} isExist
     */
    async checkTableExist(formKeyList) {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const count = await ctx.model.models.dynamicForm.count({
        where: {
          formKey: { [Op.in]: formKeyList },
        },
      });
      return !!count;
    }

    async getChildFormKey(formKey, version) {
      const model = this.ctx.model.models;
      const res = await model.dynamicForm.findOne({
        where: {
          formKey,
          version,
        },
        include: {
          model: model.dynamicForm,
          required: true,
          as: 'childTable',
          attributes: [ 'id', 'formKey' ],
        },
      });
      return (res && res.childTable && res.childTable[0] && res.childTable[0].formKey) || false;
    }

    async getFormIdByPid(formKey, version, pid) {
      const SQL = `SELECT id FROM ${formKey}${version} WHERE pid='${pid}';`;
      const [[ res ]] = await app.model.query(SQL);
      return res ? res.id : false;
    }
  };
};

// ???????????????????????????????????????
function addForeign(list, dId) {
  const dataList = [];
  list.forEach(el => {
    const dynamicFormId = dId ? dId : el.dynamicFormId;
    const fieldName = el.id.toLowerCase().replace(/\s+/g, '_');
    const fieldDisplayName = el.id;
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
      if (el.name.trim()[el.name.length - 1] === '!') {
        showOnRequest = false;
        el.name = el.name.trim().slice(0, -1);
      }
      const paramsList = el.name.split('#');
      if (paramsList.length > 2) return false;
      if (paramsList.length === 2) {
        inputType = paramsList[1].trim();
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
      fieldDisplayName,
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

