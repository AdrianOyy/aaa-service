'use strict';
const ejsexcel = require('ejsexcel');

module.exports = app => {
  return class extends app.Service {
    /** get export excel file's buffer
     * get vm resource export file blob
     * @param {Buffer} template template file's buffer
     * @param {Object} data render data
     * @return {Promise<Buffer>} file buffer
     */
    async getExportExcelBuffer(template, data) {
      const buf = await ejsexcel.renderExcel(template, data);
      return buf;
    }
  };
};
