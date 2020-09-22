'use strict';

module.exports = app => {
  return class extends app.Controller {
    async create() {
      const { ctx } = this;
      const { parentFormKey, parentValues, selectChild, childValues, childFormKey, modelId, workflowName, childVersion } = ctx.request.body;
      let transaction;
      try {
        // 建立事务对象
        transaction = await this.ctx.model.transaction();
        // 生成dynamicForm
        const data = await this.ctx.service.workflow.setDynamic(parentFormKey, parentValues, modelId, null, workflowName, childVersion);
        console.log(data);
        // 生成dynamicFormDetail
        const dynamicForm = await ctx.model.models.dynamicForm.create(data.dynamicFormModel, { transaction });
        for (const detalModel of data.detailList) {
          detalModel.dynamicFormId = dynamicForm.id;
        }
        await ctx.model.models.dynamicFormDetail.bulkCreate(data.detailList, { transaction });
        // 生成childForm
        if (selectChild) {
          const childData = await this.ctx.service.workflow.setDynamic(childFormKey, childValues, modelId, dynamicForm.id, workflowName, 0);
          console.log(data);
          const childForm = await ctx.model.models.dynamicForm.create(childData.dynamicFormModel, { transaction });
          for (const detalModel of childData.detailList) {
            detalModel.dynamicFormId = childForm.id;
          }
          await ctx.model.models.dynamicFormDetail.bulkCreate(childData.detailList, { transaction });
        }
        await transaction.commit();
      } catch (err) {
        // 事务回滚
        console.log(err);
        await transaction.rollback();
        ctx.error();
      }
      ctx.success('success');
    }

    async detail() {
      const { ctx } = this;
      const { modelId } = ctx.request.query;
      const dynamicForm = await ctx.service.workflow.getVersion(modelId);
      console.log(dynamicForm);
      const data = { dynamicForm };
      if (dynamicForm) {
        const parentTableList = await ctx.model.models.dynamicFormDetail.findAll({ where: { dynamicFormId: dynamicForm.id } });
        data.parentTableList = parentTableList;
        const childDynamicForm = await ctx.model.models.dynamicForm.findOne({ where: { parentId: dynamicForm.id } });
        data.childDynamicForm = childDynamicForm;
        if (childDynamicForm) {
          const childTableList = await ctx.model.models.dynamicFormDetail.findAll({ where: { dynamicFormId: childDynamicForm.id } });
          data.childTableList = childTableList;
        }
      }
      ctx.success(data);
    }

    async createTable() {
      const { ctx } = this;
      // const { version, modelId, deploymentId } = ctx.request.body;
      const version = 12;
      const modelId = 297501;
      const deploymentId = 12342;
      const dynamicForm = await ctx.service.workflow.getVersion(modelId);
      // 获取最新 dynamicForm
      // 修改version
      dynamicForm.deploymentId = deploymentId;
      dynamicForm.version = version;
      dynamicForm.save();
      const childDynamicForm = await ctx.model.models.dynamicForm.findOne({ where: { parentId: dynamicForm.id } });
      // const dynamicForm = await ctx.model.models.dynamicForm.findOne({ where: { modelId: 297501 } });
      const basicFormFieldList = await ctx.model.models.dynamicFormDetail.findAll({ where: { dynamicFormId: dynamicForm.id } });
      const createBasicFormSQL = await ctx.service.dynamicForm.getBasicNewSQL(dynamicForm.formKey, basicFormFieldList, version);
      console.log(createBasicFormSQL);
      const SQLList = [ createBasicFormSQL ];
      // const childDynamicForm = await ctx.model.models.dynamicForm.findOne({ where: { parentId: dynamicForm.id } });
      if (childDynamicForm) {
        childDynamicForm.deploymentId = deploymentId;
        childDynamicForm.version = version;
        childDynamicForm.save();
        const childTableList = await ctx.model.models.dynamicFormDetail.findAll({ where: { dynamicFormId: childDynamicForm.id } });
        const createChildTableSQLList = await ctx.service.dynamicForm.getChildTableSQLChild(dynamicForm.formKey, childDynamicForm.formKey, childTableList, version);
        SQLList.push(createChildTableSQLList);
        console.log(createChildTableSQLList);
      }
      try {
        for (let i = 0; i < SQLList.length; i++) {
          await app.model.query(SQLList[i]);
        }
        // 强删除 version 为 -1 信息
        await ctx.model.models.dynamicForm.destroy({ where: { version: -1, modelId }, force: true });
        ctx.success();
      } catch (error) {
        ctx.error(error);
      }
      ctx.success();
    }
  };
};
