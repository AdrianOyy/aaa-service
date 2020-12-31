'use strict';

module.exports = app => {
  return class Common extends app.Service {
    getDateRangeCondition(dateRangeString) {
      if (!dateRangeString) return undefined;
      try {
        console.log('111=========================111');
        console.log(111);
        console.log('111=========================111');
        const { Op } = app.Sequelize;
        const dataRange = JSON.parse(dateRangeString);
        console.log('222=========================222')
        console.log(222)
        console.log('222=========================222')
        let c1,
          c2;
        if (dataRange && dataRange.startDate) {
          c1 = new Date(dataRange.startDate) - 0;
          c1 = c1 - c1 % 8.64e7;
        }
        console.log('333=========================333');
        console.log(333);
        console.log('333=========================333');
        if (dataRange && dataRange.endDate) {
          c2 = new Date(dataRange.endDate) - 0;
          c2 = c2 - c2 % 8.64e7;
        }
        console.log('444=========================444');
        console.log(444);
        console.log('444=========================444');
        if (c1 && c2 && (c1 - c2 > 0)) {
          const c = c1;
          c1 = c2;
          c2 = c;
        }
        const c = [];
        console.log('555=========================555');
        console.log(555);
        console.log('555=========================555');
        if (c1) {
          c.push({ [Op.gte]: new Date(c1) });
        }
        if (c2) {
          c.push({ [Op.lt]: new Date(c2 - (-8.64e7)) });
        }
        console.log('c=========================c');
        console.log(c);
        console.log('c=========================c');
        console.log('!!c.length=========================!!c.length');
        console.log(!!c.length);
        console.log('!!c.length=========================!!c.length');
        return c.length ? { [Op.and]: c } : undefined;
      } catch (e) {
        console.log('e.message=========================e.message');
        console.log(e.message);
        console.log('e.message=========================e.message');
        return false;
      }
    }
  };
};
