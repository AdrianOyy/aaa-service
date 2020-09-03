'use strict';

module.exports = app => {
  return class extends app.Service {
    /**
     * @param {Object[]} IPList IP list without hostname
     * @param {number} num number of requested IP
     * @returns {Object[]}
     */
    async getClosest(IPList, num) {
      const IPNumArr = [];
      for (let i = 0; i < IPList.length; i++) {
        IPNumArr.push(IP2Num(IPList[i].IP));
      }
      const distanceList = [];
      for (let i = 1; i < IPNumArr.length; i++) {
        distanceList.push(IPNumArr[i] - IPNumArr[i - 1]);
      }
      let startNum = 0;
      const windowWidth = num - 2;
      // 滑动窗口
      for (let i = 1; i < distanceList.length - windowWidth + 1; i++) {
        if (distanceList[i - 1] > distanceList[i + windowWidth - 1]) {
          startNum = i;
        }
      }
      const closestList = [];
      let front = startNum + num - distanceList.length - 1;
      if (front < 0) front = 0;
      for (let i = startNum - front; i < startNum + num - front; i++) {
        closestList.push(IPList[i]);
      }
      return closestList;
    }

    async assign(DC, requestNum) {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const IPList = await ctx.model.models.ip_assignment.findAll({
        where: {
          DCId: DC,
          hostname: { [Op.is]: null },
          networkType: { [Op.or]: [ 'Cat C - OS', 'Cat F - ATL' ] },
        },
        attributes: [ 'id', 'IP', 'networkType' ],
        order: [[ 'IP', 'ASC' ]],
      });
      if (IPList.length < requestNum * 2) return false;
      const CList = [];
      const FList = [];
      IPList.forEach(el => {
        if (el.networkType === 'Cat C - OS') {
          CList.push(el.dataValues);
        } else {
          FList.push(el.dataValues);
        }
      });
      if (CList.length < requestNum || FList.length < requestNum) return false;

      let Cres = [],
        Fres = [];

      if (CList.length === parseInt(requestNum)) {
        Cres = CList;
      } else if (parseInt(requestNum) === 1) {
        Cres = [ CList[0] ];
      } else {
        const closestList = await this.getClosest(CList, parseInt(requestNum));
        if (!closestList) return false;
        Cres = closestList;
      }
      if (FList.length === parseInt(requestNum)) {
        Fres = FList;
      } else if (parseInt(requestNum) === 1) {
        Fres = [ FList[0] ];
      } else {
        const closestList = await this.getClosest(FList, parseInt(requestNum));
        if (!closestList) return false;
        Fres = closestList;
      }
      return [ Cres, Fres ];
    }

    /**
     * @param {Object[]} vmList VM list
     * @return {Promise<Object[]>} typeCountList
     */
    async countByDC(vmList) {
      const map = new Map();
      vmList.forEach(el => {
        if (el.data_center && el.data_center.id) {
          if (!map.get(el.data_center.id)) {
            map.set(el.data_center.id, 1);
          } else {
            map.set(el.data_center.id, map.get(el.data_center.id) + 1);
          }
        }
      });
      const res = [];
      for (const [ k, v ] of map) {
        const model = {
          dataCenter: k,
          requestNum: v,
        };
        res.push(model);
      }
      return res;
    }
  };
};

/**
 * @param {string} IP IP address
 * @returns {number}
 */
function IP2Num(IP) {
  const IPArr = IP.split('.');
  return (
    parseInt(IPArr[0]) * Math.pow(255, 3) +
    parseInt(IPArr[1]) * Math.pow(255, 2) +
    parseInt(IPArr[2]) * Math.pow(255, 1) +
    parseInt(IPArr[3])
  );
}
