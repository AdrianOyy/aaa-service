'use strict';
const dayjs = require('dayjs');

module.exports = app => {
  return class extends app.Controller {
    async test() {
      const { ctx } = this;
      const vmList = await ctx.model.models.vm_guest.findAll();
      const dataList = [];
      vmList.forEach(el => {
        const model = Object.assign(el.dataValues, {
          createdAt: dayjs(el.createdAt).format('DD-MMM-YYYY HH:mm'),
          updatedAt: dayjs(el.updatedAt).format('DD-MMM-YYYY HH:mm'),
        });
        dataList.push(model);
      });
      const data = {
        len: vmList.length,
        dataList,
      };
      const buffer = await ctx.service.file.getFileBlob('VM', 'VM.xlsx', data);
      ctx.set('Content-Type', 'application/octet-stream');
      ctx.body = buffer;
    }
  };
};
