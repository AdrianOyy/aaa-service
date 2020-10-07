'use strict';

module.exports = app => {
  return class extends app.Service {
    async setDynamic(formKey, formList, modelId, parentId, workflowName, childVersion) {
      const dynamicFormModel = {
        modelId,
        workflowName,
        version: -1,
        childVersion,
        formKey,
        parentId,
      };
      const detailList = [];
      console.log(formList);
      for (const form of formList) {
        console.log(form);
        const dynamicFormDetail = {
          fieldName: form.fieldName ? form.fieldName.value.toLowerCase() : null,
          fieldDisplayName: form.fieldDisplayName ? form.fieldDisplayName.value : null,
          fieldType: form.fieldType ? form.fieldType.value : null,
          inputType: form.inputType ? form.inputType.value : null,
          showOnRequest: form.showOnRequest.value === '1',
          foreignTable: form.foreignTable ? form.foreignTable.value : null,
          foreignKey: form.foreignKey ? form.foreignKey.value : null,
          foreignDisplayKey: form.foreignDisplayKey ? form.foreignDisplayKey.value : null,
          required: form.required.value === '1',
          readable: form.readable.value === '1',
          writable: form.writable.value === '1',
        };
        detailList.push(dynamicFormDetail);
      }
      return { dynamicFormModel, detailList };
    }

    async getVersion(modelId) {
      const { ctx } = this;
      // 获取当前是否有测试版本
      let dynamicModle = null;
      const dynamicFormAll = await ctx.model.models.dynamicForm.findAll({ where: { modelId, version: -1, parentId: null }, order: [[ 'childVersion', 'DESC' ]] });
      if (dynamicFormAll.length > 0) {
        // eslint-disable-next-line no-unused-vars
        dynamicModle = dynamicFormAll[0];
      } else {
        const dynamicFormModelAll = await ctx.model.models.dynamicForm.findAll({ where: { modelId, parentId: null }, order: [[ 'version', 'DESC' ], [ 'childVersion', 'DESC' ]] });
        if (dynamicFormModelAll.length > 0) {
          dynamicModle = dynamicFormModelAll[0];
        }
      }
      return dynamicModle;
    }

    async setPubilshDynamicForm(dynamicModel, version, deploymentId) {
      const { ctx } = this;
      let isCreate = false;
      if (dynamicModel.version !== -1) {
        isCreate = true;
      }
      if (isCreate) {
        const dynamicDetails = await ctx.model.models.dynamicFormDetail.findAll({ where: { dynamicFormId: dynamicModel.id } });
        const childDynamic = await ctx.model.models.dynamicForm.findOne({ where: { parentId: dynamicModel.id } });
        const pmodel = {
          modelId: dynamicModel.modelId,
          deploymentId,
          workflowName: dynamicModel.workflowName,
          version,
          childVersion: '1',
          formKey: dynamicModel.formKey,
        };
        const newDynamic = await ctx.model.models.dynamicForm.create(pmodel);
        for (const dydetail of dynamicDetails) {
          const pdetail = {
            dynamicFormId: newDynamic.id,
            fieldName: dydetail.fieldName.toString().toLowerCase(),
            fieldDisplayName: dydetail.fieldDisplayName,
            fieldType: dydetail.fieldType,
            inputType: dydetail.inputType,
            showOnRequest: dydetail.showOnRequest,
            foreignTable: dydetail.foreignTable,
            foreignKey: dydetail.foreignKey,
            foreignDisplayKey: dydetail.foreignDisplayKey,
            required: dydetail.required,
            readable: dydetail.readable,
            writable: dydetail.writable,
          };
          await ctx.model.models.dynamicFormDetail.create(pdetail);
        }
        if (childDynamic) {
          const childDetails = await ctx.model.models.dynamicFormDetail.findAll({ where: { dynamicFormId: childDynamic.id } });
          const cmodel = {
            modelId: childDynamic.modelId,
            deploymentId,
            workflowName: childDynamic.workflowName,
            version,
            childVersion: '1',
            parentId: newDynamic.id,
            formKey: childDynamic.formKey,
          };
          const newChildDynamic = await ctx.model.models.dynamicForm.create(cmodel);
          for (const detail of childDetails) {
            const cdetail = {
              dynamicFormId: newChildDynamic.id,
              fieldName: detail.fieldName.toString().toLowerCase(),
              fieldDisplayName: detail.fieldDisplayName,
              fieldType: detail.fieldType,
              inputType: detail.inputType,
              showOnRequest: detail.showOnRequest,
              foreignTable: detail.foreignTable,
              foreignKey: detail.foreignKey,
              foreignDisplayKey: detail.foreignDisplayKey,
              required: detail.required,
              readable: detail.readable,
              writable: detail.writable,
            };
            await ctx.model.models.dynamicFormDetail.create(cdetail);
          }
        }
        return newDynamic;
      }
      dynamicModel.version = version;
      dynamicModel.deploymentId = deploymentId;
      dynamicModel.save();
      const childDynamic = await ctx.model.models.dynamicForm.findOne({ where: { parentId: dynamicModel.id } });
      if (childDynamic) {
        childDynamic.version = version;
        childDynamic.save();
      }
      return dynamicModel;
    }
  };
};
