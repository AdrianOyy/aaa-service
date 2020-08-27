'use strict';

const _ = require('lodash');

module.exports = app => {
  return class extends app.Service {
    async getCluserList(clusterList, vm, inList) {
      let clusterInList = [];
      for (const index in clusterList) {
        // eslint-disable-next-line no-undef
        const msg = getMsg(index);
        msg.cluser = clusterList[0];
        msg.diskfee = 0;
        const inClusters = inList.find(vm.cluser === msg.name);
        msg.FreeMemory = setDiskByMb(msg['Free Memory']);
        if (inClusters.length > 0) {
          for (const inCluster of inClusters) {
            msg['Number of CPU'] = msg['Number of CPU'] - inCluster.CPU_request_number;
            msg.FreeMemory = msg.FreeMemory - inCluster.RAM_request_number * 1024;
            msg.diskfee = msg.diskfee - inCluster.data_storage_request_number * 1024;
          }
        }
        if ((msg['Number of CPU'] * 2 * 0.8) < vm.CPU_request_number) {
          continue;
        }
        if (msg.FreeMemory * 0.8 < vm.RAM_request_number * 1024) {
          continue;
        }
        let diskfee = 0;
        let disktotal = 0;
        for (const disk of msg.Datastore) {
          disk.diskfee = setDiskByMb(disk.free);
          disk.disktotal = setDiskByMb(disk.total);
          diskfee += disk.diskfee;
          disktotal += disk.disktotal;
        }
        msg.diskfee += diskfee;
        if (msg.diskfee * 0.8 < vm.data_storage_request_number * 1024) {
          continue;
        }
        msg.disktotal = disktotal;
        clusterInList.push(msg);
      }
      clusterInList = _.orderBy(clusterInList, [ 'Number of CPU', 'FreeMemory', 'diskfee' ], [ 'desc', 'desc', 'desc' ]);
      return clusterInList[0].name;
    }

    async getFormDetailList(formKey, formId) {
      const { ctx } = this;
      const dynamicForm = await ctx.model.models.dynamicForm.findOne({ where: { formKey } });
      if (!dynamicForm) ctx.error();
      const sonForm = await ctx.model.models.dynamicForm.findOne({ where: { parentId: dynamicForm.id } });
      if (!sonForm) ctx.error();
      const SQL = `select * from ${sonForm.formKey} where parentId = ${formId}`;
      const [[ basicList ]] = await app.model.query(SQL);
      return basicList;
    }

    async getMsg(index) {
      const msg =
        [{
          Datastore: [
            {
              free: '1.05 TB',
              name: '02b_datastore1',
              total: '1.08 TB',
            },
            {
              free: '520.54 GB',
              name: '02CS_CSV01',
              total: '2.00 TB',
            },
            {
              free: '1.16 TB',
              name: '02CS_CSV02',
              total: '2.00 TB',
            },
            {
              free: '860.56 GB',
              name: '02CS_CSV03_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '789.57 GB',
              name: '02CS_CSV04_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '513.15 GB',
              name: '02CS_CSV05_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '518.79 GB',
              name: '02CS_CSV06_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '957.80 GB',
              name: '02CS_CSV07',
              total: '2.00 TB',
            },
            {
              free: '2.00 TB',
              name: '02CS_CSV08',
              total: '2.00 TB',
            },
            {
              free: '2.00 TB',
              name: '02CS_CSV09',
              total: '2.00 TB',
            },
            {
              free: '2.00 TB',
              name: '02CS_CSV10',
              total: '2.00 TB',
            },
          ],
          'Esxi Name': 'devesxi02b.corpdev.hadev.org.hk1',
          'Free Memory': '831467MB',
          'Number of CPU': 56,
          'Total Memory': '1047902MB',
        }, {
          Datastore: [
            {
              free: '1.05 TB',
              name: '02b_datastore1',
              total: '1.08 TB',
            },
            {
              free: '520.54 GB',
              name: '02CS_CSV01',
              total: '2.00 TB',
            },
            {
              free: '1.16 TB',
              name: '02CS_CSV02',
              total: '2.00 TB',
            },
            {
              free: '860.56 GB',
              name: '02CS_CSV03_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '789.57 GB',
              name: '02CS_CSV04_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '513.15 GB',
              name: '02CS_CSV05_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '518.79 GB',
              name: '02CS_CSV06_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '957.80 GB',
              name: '02CS_CSV07',
              total: '2.00 TB',
            },
            {
              free: '2.00 TB',
              name: '02CS_CSV08',
              total: '2.00 TB',
            },
            {
              free: '2.00 TB',
              name: '02CS_CSV09',
              total: '2.00 TB',
            },
            {
              free: '2.00 TB',
              name: '02CS_CSV10',
              total: '2.00 TB',
            },
          ],
          'Esxi Name': 'devesxi02b.corpdev.hadev.org.hk2',
          'Free Memory': '831467MB ',
          'Number of CPU': 56,
          'Total Memory': '1047902MB',
        }, {
          Datastore: [
            {
              free: '1.05 TB',
              name: '02b_datastore1',
              total: '1.08 TB',
            },
            {
              free: '520.54 GB',
              name: '02CS_CSV01',
              total: '2.00 TB',
            },
            {
              free: '1.16 TB',
              name: '02CS_CSV02',
              total: '2.00 TB',
            },
            {
              free: '860.56 GB',
              name: '02CS_CSV03_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '789.57 GB',
              name: '02CS_CSV04_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '513.15 GB',
              name: '02CS_CSV05_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '518.79 GB',
              name: '02CS_CSV06_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '957.80 GB',
              name: '02CS_CSV07',
              total: '2.00 TB',
            },
            {
              free: '2.00 TB',
              name: '02CS_CSV08',
              total: '2.00 TB',
            },
            {
              free: '2.00 TB',
              name: '02CS_CSV09',
              total: '2.00 TB',
            },
            {
              free: '2.00 TB',
              name: '02CS_CSV10',
              total: '2.00 TB',
            },
          ],
          'Esxi Name': 'devesxi02b.corpdev.hadev.org.hk3',
          'Free Memory': '831467MB ',
          'Number of CPU': 56,
          'Total Memory': '1047902MB',
        }, {
          Datastore: [
            {
              free: '1.05 TB',
              name: '02b_datastore1',
              total: '1.08 TB',
            },
            {
              free: '520.54 GB',
              name: '02CS_CSV01',
              total: '2.00 TB',
            },
            {
              free: '1.16 TB',
              name: '02CS_CSV02',
              total: '2.00 TB',
            },
            {
              free: '860.56 GB',
              name: '02CS_CSV03_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '789.57 GB',
              name: '02CS_CSV04_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '513.15 GB',
              name: '02CS_CSV05_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '518.79 GB',
              name: '02CS_CSV06_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '957.80 GB',
              name: '02CS_CSV07',
              total: '2.00 TB',
            },
            {
              free: '2.00 TB',
              name: '02CS_CSV08',
              total: '2.00 TB',
            },
            {
              free: '2.00 TB',
              name: '02CS_CSV09',
              total: '2.00 TB',
            },
            {
              free: '2.00 TB',
              name: '02CS_CSV10',
              total: '2.00 TB',
            },
          ],
          'Esxi Name': 'devesxi02b.corpdev.hadev.org.hk4',
          'Free Memory': '831467MB ',
          'Number of CPU': 56,
          'Total Memory': '1047902MB',
        }, {
          Datastore: [
            {
              free: '1.05 TB',
              name: '02b_datastore1',
              total: '1.08 TB',
            },
            {
              free: '520.54 GB',
              name: '02CS_CSV01',
              total: '2.00 TB',
            },
            {
              free: '1.16 TB',
              name: '02CS_CSV02',
              total: '2.00 TB',
            },
            {
              free: '860.56 GB',
              name: '02CS_CSV03_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '789.57 GB',
              name: '02CS_CSV04_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '513.15 GB',
              name: '02CS_CSV05_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '518.79 GB',
              name: '02CS_CSV06_Encrypted',
              total: '2.00 TB',
            },
            {
              free: '957.80 GB',
              name: '02CS_CSV07',
              total: '2.00 TB',
            },
            {
              free: '2.00 TB',
              name: '02CS_CSV08',
              total: '2.00 TB',
            },
            {
              free: '2.00 TB',
              name: '02CS_CSV09',
              total: '2.00 TB',
            },
            {
              free: '2.00 TB',
              name: '02CS_CSV10',
              total: '2.00 TB',
            },
          ],
          'Esxi Name': 'devesxi02b.corpdev.hadev.org.hk5',
          'Free Memory': '831467MB ',
          'Number of CPU': 56,
          'Total Memory': '1047902MB',
        }];
      return msg[index];
    }
  };
};

function setDiskByMb(free) {
  if (free.indexOf('TB') > -1) {
    return parseFloat(free.replace('TB').trim()) * 1024 * 1024;
  } else if (free.indexOf('GB') > -1) {
    return parseFloat(free.replace('GB').trim()) * 1024;
  } else if (free.indexOf('MB') > -1) {
    return parseInt(free.replace('MB').trim());
  }
  return 0;
}
