'use strict';
const path = require('path');
const fs = require('fs');
const templatePath = '../public/template';

module.exports = app => {
  return class extends app.Service {
    async getFileBlob(type, templateName, data) {
      const { ctx } = this;
      let template;
      let fileBlob;
      try {
        template = readTemplate(templateName);
        switch (type) {
          case 'VM':
            fileBlob = await ctx.service.vm.getExportExcelBuffer(template, data);
            break;
          default:
            fileBlob = null;
        }
        return fileBlob;
      } catch (error) {
        console.log('error ================= error');
        console.log(error.message);
        console.log('error ================= error');
        return null;
      }
    }
  };
};

function readTemplate(templateName) {
  const filePath = path.resolve(__dirname, templatePath, `${templateName}`);
  if (!fs.existsSync(filePath)) {
    throw new Error('Template is not exists!');
  }
  return fs.readFileSync(filePath);
}
