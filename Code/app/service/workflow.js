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
      for (const form of formList) {
        const dynamicFormDetail = {
          fieldName: form.fieldName ? form.fieldName.value.toLowerCase() : null,
          fieldDisplayName: form.fieldDisplayName ? form.fieldDisplayName.value : null,
          fieldType: form.fieldType ? form.fieldType.value : null,
          inputType: form.inputType ? form.inputType.value : null,
          showOnRequest: form.showOnRequest.value === '1',
          foreignTable: form.foreignTable ? form.foreignTable.value : null,
          foreignKey: form.foreignKey ? form.foreignKey.value : null,
          indexOf: form.indexOf ? form.indexOf.value : null,
          remark: form.remark ? form.remark.value : null,
          foreignDisplayKey: form.foreignDisplayKey ? form.foreignDisplayKey.value : null,
          required: form.required.value === '1',
          readable: form.readable.value === '1',
          writable: form.writable.value === '1',
        };
        detailList.push(dynamicFormDetail);
      }
      return { dynamicFormModel, detailList };
    }

    async setUpdateType(parentData, startValues, deploymentId) {
      const { ctx } = this;
      const updateType = [];
      const dynamicForm = await ctx.model.models.dynamicForm.findOne({ where: { deploymentId } });
      const dynamicDetalList = await ctx.model.models.dynamicFormDetail.findAll({ where: { dynamicFormId: dynamicForm.id } });
      for (const dynamicDetail of dynamicDetalList) {
        if ((parentData[dynamicDetail.fieldName] && parentData[dynamicDetail.fieldName].value) || startValues[dynamicDetail.fieldName]) {
          if (parentData[dynamicDetail.fieldName].value !== startValues[dynamicDetail.fieldName]) {
            let cost = 'Corp Account Application';
            if (dynamicDetail.remark === 'Internet Account Application') {
              cost = 'Internet Account Application';
            } else if (dynamicDetail.remark === 'IBRA Account Application') {
              cost = 'IBRA Account Application';
            } else {
              cost = 'Corp Account Application';
            }
            if (updateType.indexOf(cost) === -1) {
              updateType.push(cost);
            }
          }
        }
      }
      if (updateType.indexOf('Corp Account Application') > -1) {
        updateType.push('Wireless LAN (WLAN) Application');
      }
      const data = updateType.join(',');
      return data;
    }

    async getIbra(parentData) {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      let data = [];
      const ibraGroupId = [];
      if (parentData.account_type && parentData.account_type.indexOf('IBRA Account Application') > -1) {
        const clinicalData = parentData.clinical_applications;
        const nonclinicalData = parentData.nonclinical_applications;
        if (clinicalData) {
          data = clinicalData.split('!@#$');
        }
        if (nonclinicalData) {
          data = data.concat(nonclinicalData.split('!@#$'));
        }
        const where = {
          name: { [Op.in]: data },
          manage_group_id: { [Op.in]: app.Sequelize.literal(`(select groupId from user_group_mapping where userId = ${ctx.authUser.id} and deletedAt is null)`) },
        };
        const clGroup = await ctx.model.models.clinical_group.findAll({ where });
        for (const cli of clGroup) {
          if (ibraGroupId.indexOf(cli.approval_group_id.toString()) === -1) {
            ibraGroupId.push(cli.approval_group_id.toString());
          }
        }
      }
      return ibraGroupId;
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
            indexOf: dydetail.indexOf,
            remark: dydetail.remark,
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
              indexOf: detail.indexOf,
              remark: detail.remark,
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
