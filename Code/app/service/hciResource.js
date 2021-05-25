'use strict';

const _ = require('lodash');

module.exports = app => {
  return class extends app.Service {
    async getClusterByCenter(clusters, cdcId, applicationTypeId) {
      const { ctx } = this;
      const clusterCenter = [];
      for (const cluster of clusters) {
        const where = {
          clusterName: cluster,
          cdcId,
          applicationTypeId,
        };
        const center = await ctx.model.models.vm_cluster_dc_mapping.findOne({ where });
        if (center) {
          const data = {
            clusterName: cluster,
            vCenter: center.vCenter,
          };
          clusterCenter.push(data);
        }
      }
      return clusterCenter;
    }

    // preDefine 获取HCI List
    async getInHCIList(clusterNames, vm, inList) {
      let clusterInList = [];
      const hciList = await this.setHCI(clusterNames);
      // 保存 HCIList
      await this.saveHCI(hciList);
      for (const hci of hciList) {
        const inClusters = inList.filter(t => t.vm_cluster === hci.name);
        if (inClusters.length > 0) {
          for (const inCluster of inClusters) {
            hci.NoCPUUsed = hci.NoCPUUsed + parseInt(inCluster.cpu_request_number);
            hci.FreeMemory = hci.FreeMemory - parseInt(inCluster.ram_request_number) * 1024;
            hci.FreeDiskSize = hci.FreeDiskSize - parseInt(inCluster.data_storage_request_number) * 1024;
          }
        }
        if ((hci.TotalDiskSize * 0.2) > (hci.FreeDiskSize - vm.data_storage_request_number * 1024)) {
          continue;
        }
        if ((hci.TotalMemory * 0.2) > (hci.FreeMemory - vm.ram_request_number * 1024)) {
          continue;
        }
        if ((hci.NumberofCPU * 2.5 * 0.2) > (hci.NumberofCPU * 2.5 - vm.cpu_request_number - hci.NoCPUUsed)) {
          continue;
        }
        hci.orderByMemory = setFloat(hci.FreeMemory, hci.TotalMemory);
        hci.orderByCPU = setFloat(hci.NoCPUUsed, hci.NumberofCPU, 'CPU');
        hci.orderByRam = setFloat(hci.FreeDiskSize, hci.TotalDiskSize);
        clusterInList.push(hci);
      }
      if (clusterInList.length > 0) {
        clusterInList = _.orderBy(clusterInList, [ 'orderByCPU', 'orderByMemory', 'orderByRam' ], [ 'desc', 'desc', 'desc' ]);
        return clusterInList[0].ClusterName;
      }
      // data.pass = false;
      // data.message += 'not find cluser\n';
      return null;
    }

    // 获取HCI 处理
    async setHCI(names) {
      const cluserMasters = await this.getHCIAll(names);
      const hciList = [];
      for (const msg of cluserMasters) {
        if (msg) {
          // 循环 Master
          const data = {
            ClusterName: msg['Cluster Name'],
            totalVM: parseInt(msg['Total VM']),
            cpuResourceLeft: parseInt(msg['CPU Resource Left']),
            NoCPUUsed: parseInt(msg['No. of CPU Used']),
            NumberofCPU: parseInt(msg['Number of CPU']),
            FreeMemory: setDiskByMb(msg['Free Memory']),
            TotalMemory: setDiskByMb(msg['Total Memory']),
            FreeDiskSize: setDiskByMb(msg['Free Disk Size']),
            TotalDiskSize: setDiskByMb(msg['Total Disk Size']),
          };
          data.orderByMemory = setFloat(data.FreeMemory, data.TotalMemory);
          data.orderByCPU = setFloat(data.NoCPUUsed, data.NumberofCPU, 'CPU');
          data.orderByRam = setFloat(data.FreeDiskSize, data.TotalDiskSize);
          hciList.push(data);
        }
      }
      return hciList;
    }

    async setHCIByCheck(name, jobId) {
      const cluserMasters = await this.getHCIByCheck(jobId);
      const hciList = [];
      for (const msg of cluserMasters) {
        if (msg) {
          // 循环 Master
          const data = {
            ClusterName: msg['Cluster Name'],
            totalVM: parseInt(msg['Total VM']),
            cpuResourceLeft: parseInt(msg['CPU Resource Left']),
            NoCPUUsed: parseInt(msg['No. of CPU Used']),
            NumberofCPU: parseInt(msg['Number of CPU']),
            FreeMemory: setDiskByMb(msg['Free Memory']),
            TotalMemory: setDiskByMb(msg['Total Memory']),
            FreeDiskSize: setDiskByMb(msg['Free Disk Size']),
            TotalDiskSize: setDiskByMb(msg['Total Disk Size']),
          };
          data.orderByMemory = setFloat(data.FreeMemory, data.TotalMemory);
          data.orderByCPU = setFloat(data.NoCPUUsed, data.NumberofCPU, 'CPU');
          data.orderByRam = setFloat(data.FreeDiskSize, data.TotalDiskSize);
          if (msg['Cluster Name'] === name) {
            hciList.push(data);
          }
        }
      }
      return hciList;
    }

    async getHCIAll(names) {
      if (names && names.length > 0) {
        const vClusters = [];
        const vCenters = [];
        for (const name of names) {
          vClusters.push(name.clusterName);
          vCenters.push(name.vCenter);
        }
        const str = await this.getAnsibleHCI({ vClusters: vClusters.join(','), vSiteIPs: vCenters.join(',') });
        if (str) {
          const msgs = await this.JsonToHCI(str);
          const HCI = [];
          for (const msg of msgs) {
            HCI.push(setColoumn(msg));
          }
          return HCI;
        }
      }
      return [];
    }

    async getHCIByCheck(jobId) {
      if (jobId) {
        const str = await this.getAnsibleHCIByJobId(jobId);
        if (str) {
          const msgs = await this.JsonToHCI(str);
          const HCI = [];
          for (const msg of msgs) {
            HCI.push(setColoumn(msg));
          }
          return HCI;
        }
        return [];
      }
      return [];
    }

    async getAnsibleHCIByJobId(jobId) {
      const url = app.config.activiti.url + '/getHCIResource';
      const { ctx } = this;
      try {
        const token = await ctx.service.jwtUtils.getToken({
          content: { username: ctx.authUser.sAMAccountName },
          expiresIn: app.config.jwt.expiresIn,
        });
        const options = {
          method: 'GET',
          dataType: 'text',
          timeout: 1000 * 60,
          headers: { Authorization: 'Bearer ' + token },
          data: { job: jobId },
        };
        const hci = await ctx.service.syncActiviti.curl(url, options, ctx);
        return hci.data;
      } catch (err) {
        console.log(err);
        return null;
      }
    }

    async getAnsibleHCI(data) {
      const url = app.config.activiti.url + '/getAnsibleHCIResource';
      // action task
      const { ctx } = this;
      try {
        const token = await ctx.service.jwtUtils.getToken({
          content: { username: '' },
          expiresIn: app.config.jwt.expiresIn,
        });
        const options = {
          method: 'GET',
          dataType: 'text',
          timeout: 1000 * 60,
          headers: { Authorization: 'Bearer ' + token },
          data,
        };
        const hci = await ctx.service.syncActiviti.curl(url, options, ctx);
        return hci.data;
      } catch (err) {
        console.log(err);
        return null;
      }
    }

    async getAnsibleJobByHCI(data) {
      const url = app.config.activiti.url + '/getAnsibleJobByHCI';

      const { ctx } = this;
      try {
        const token = await ctx.service.jwtUtils.getToken({
          content: { username: ctx.authUser.sAMAccountName },
          expiresIn: app.config.jwt.expiresIn,
        });
        const options = {
          method: 'GET',
          timeout: 1000 * 60,
          headers: { Authorization: 'Bearer ' + token },
          data,
        };
        const job = await ctx.service.syncActiviti.curl(url, options, ctx);
        console.log(job);
        return job.data;
      } catch (err) {
        console.log(err);
        return '';
      }
    }

    // 解析HCI
    async JsonToHCI(str) {
      try {
        const start = 'ok: [localhost] => {';
        const end = 'PLAY';
        const startOf = str.indexOf(start);
        const endOf = str.indexOf(end, startOf);
        if (endOf === -1) {
          return [];
        }
        const msg = str.substring(startOf + start.length - 1, endOf);
        const msgJson = JSON.parse(msg);
        return msgJson.msg;
      } catch (err) {
        console.log('HCI解析失败');
        console.log('==============================');
        console.log(str);
        console.log('==============================');
        console.log(err);
        return [];
      }
    }

    // 保存HCI
    async saveHCI(clusters) {
      const { ctx } = this;
      try {
        // 建立事务对象
        for (const cluster of clusters) {
          const clusterFind = await ctx.model.models.vm_cluster.findOne({ where: { VMClusterName: cluster.ClusterName } });
          if (clusterFind) {
            clusterFind.totalMemory = parseFloat(parseFloat(cluster.TotalMemory / 1024).toFixed(2));
            clusterFind.totalNumbeOfCPU = parseInt(cluster.NumberofCPU);
            clusterFind.storagePoolSize = parseInt(cluster.TotalDiskSize / 1024);
            clusterFind.save();
            // await ctx.model.models.vm_cluster.update(clusterFind, { transaction });
          } else {
            const clusterModel = {
              totalMemory: parseFloat(parseFloat(cluster.TotalMemory / 1024)
                .toFixed(2)),
              totalNumbeOfCPU: parseInt(cluster.NumberofCPU),
              storagePoolSize: parseInt(cluster.TotalDiskSize / 1024),
              VMClusterName: cluster.ClusterName,
            };
            await ctx.model.models.vm_cluster.create(clusterModel);
          }
        }
      } catch (err) {
        // 事务回滚
        console.log(err);
        throw { status: 400, code: 'QUERY_PARAM_INVALID', message: 'save HCI error' };
      }
    }

    async getCheckHCI(vm, jobId) {
      console.log('====================Check VM Cluster BY HCI', new Date());
      const hciResult = {
        fieldName: 'vm_cluster',
        error: false,
        done: false,
        message: null,
      };
      const hciList = await this.setHCIByCheck(vm.vm_cluster, jobId);
      if (hciList.length > 0) {
        // 保存 HCIList
        await this.saveHCI(hciList);
        const hci = hciList[0];
        hciResult.done = true;
        if (hci.TotalDiskSize * 0.2 > hci.FreeDiskSize - vm.data_storage_request_number * 1024) {
          hciResult.error = true;
          hciResult.done = true;
          hciResult.message = ' vm_cluster data_storage_request_number beyond 80% ';
          return hciResult;
        }
        if (hci.TotalMemory * 0.2 > hci.FreeMemory - vm.ram_request_number * 1024) {
          hciResult.error = true;
          hciResult.done = true;
          hciResult.message = ' vm_cluster ram_request_number beyond 80% ';
          return hciResult;
        }
        if (hci.NumberofCPU * 2.5 * 0.2 > hci.NumberofCPU * 2.5 - vm.cpu_request_number - hci.NoCPUUsed) {
          hciResult.error = true;
          hciResult.done = true;
          hciResult.message = ' vm_cluster cpu beyond 80% ';
          return hciResult;
        }
      } else {
        hciResult.error = true;
        hciResult.message = ' vm_cluster can not be found ';
        return hciResult;
      }
      return hciResult;
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

// eslint-disable-next-line no-unused-vars
function setFloat(free, total, type) {
  if (type === 'CPU') {
    const float = parseFloat((((total * 2) - free) / (total * 2))).toFixed(2);
    return parseFloat(float);
  }
  const float = parseFloat((free / total)).toFixed(2);
  return parseFloat(float);
}

function setColoumn(msgs) {
  const data = {};
  for (const coloumn of msgs) {
    if (coloumn.indexOf(':') > -1) {
      const arr = coloumn.split(':');
      data[arr[0]] = arr[1].trim();
    }
  }
  return data;
}
