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
          fieldName: form.fieldName ? form.fieldName.value : null,
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
  };
};
