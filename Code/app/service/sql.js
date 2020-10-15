'use strict';

module.exports = app => {
  return class extends app.Service {
    /**
     * @param {string} SQLList SQL list which should add transaction function
     * @return Promise<object>} { success:boolean, idList: string|number[]};
     */
    async transaction(SQLList) {
      if (!SQLList) return { success: false, idList: [] };
      const idList = [];
      try {
        await app.model.query('START TRANSACTION;');
        for (let i = 0; i < SQLList.length; i++) {
          const [ id ] = await app.model.query(SQLList[i]);
          idList.push(id);
        }
        await app.model.query('COMMIT');
        return { success: true, idList };
      } catch (error) {
        console.log('error ================= error');
        console.log(error.message);
        console.log('error ================= error');
        await app.model.query('ROLLBACK');
        return { success: false, idList: [] };
      }
    }
  };
};
