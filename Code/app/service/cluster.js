'use strict';

const _ = require('lodash');

module.exports = app => {
  return class extends app.Service {
    async getInMasterList(clusterNames, vm, inList) {
      let clusterInList = [];
      const vmmList = await this.setVMMare(clusterNames);
      // 保存 VMMare
      await this.saveVMMare(vmmList);
      const rmaster = {
        vm_cluster: '',
        vm_master: '',
        csv: '',
      };
      for (const vmm of vmmList) {
        console.log(new Date() + ': getInMasterList vmm', vmm);
        if (!vmm.isRamCsv) {
          continue;
        }
        const inClusters = inList.filter(t => t.vm_cluster === vmm.ClusterName);
        if (inClusters.length > 0) {
          for (const inCluster of inClusters) {
            vmm.NoCPUUsed = vmm.NoCPUUsed + parseInt(inCluster.cpu_request_number);
            vmm.FreeMemory = vmm.FreeMemory - parseInt(inCluster.ram_request_number) * 1024;
            vmm.freeRam = vmm.freeRam - parseInt(inCluster.data_storage_request_number) * 1024;
          }
        }
        if ((vmm.totalRam * 0.2) > (vmm.freeRam - vm.data_storage_request_number * 1024)) {
          continue;
        }
        if ((vmm.TotalMemory * 0.2) > (vmm.FreeMemory - vm.ram_request_number * 1024)) {
          continue;
        }
        if ((vmm.NumberofCPU * 2.5 * 0.2) > (vmm.NumberofCPU * 2.5 - vm.cpu_request_number - vmm.NoCPUUsed)) {
          continue;
        }
        vmm.orderByMemory = setFloat(vmm.FreeMemory, vmm.TotalMemory);
        vmm.orderByCPU = setFloat(vmm.NoCPUUsed, vmm.NumberofCPU, 'CPU');
        vmm.orderByRam = setFloat(vmm.FreeDiskSize, vmm.TotalDiskSize);
        clusterInList.push(vmm);
      }
      console.log(new Date() + ': getInMasterList clusterInList.length ', clusterInList);
      if (clusterInList.length > 0) {
        clusterInList = _.orderBy(clusterInList, [ 'orderByCPU', 'orderByMemory', 'orderByRam' ], [ 'desc', 'desc', 'desc' ]);
        for (const cluster of clusterInList) {
          rmaster.vm_cluster = cluster.ClusterName;
          const masterList = _.orderBy(cluster.ESXiDetails, [ 'byCPU', 'byMemory' ], [ 'desc', 'desc' ]);
          const inClusters = inList.filter(t => t.vm_cluster === cluster.ClusterName);
          let isMaster = false;
          for (const master of masterList) {
            for (const inCluster of inClusters) {
              master.NoCPUUsed = master.NoCPUUsed + parseInt(inCluster.cpu_request_number);
              master.FreeMemory = master.FreeMemory - parseInt(inCluster.ram_request_number) * 1024;
            }
            if (master.TotalMemory * 0.2 > master.FreeMemory - vm.ram_request_number * 1024) {
              continue;
            }
            if (master.NumberofCPU * 2.5 * 0.2 > master.NumberofCPU * 2.5 - vm.cpu_request_number - master.NoCPUUsed) {
              continue;
            }
            rmaster.vm_master = master['Esxi Name'];
            isMaster = true;
            break;
          }
          console.log(new Date() + ': getInMasterList isMaster ' + isMaster);
          if (isMaster) {
            // 判断CSV
            const csvList = cluster.DatastoreDetails.filter(t => t.isCsv === true);
            const cList = _.orderBy(csvList, [ 'orderByCsv' ], [ 'desc' ]);
            console.log(new Date() + ': getInMasterList cList length ' + cList.length);
            if (cList.length > 0) {
              rmaster.csv = cList[0].name;
              break;
            } else {
              rmaster.vm_cluster = '';
              rmaster.vm_master = '';
              rmaster.csv = '';
            }
          } else {
            rmaster.vm_cluster = '';
            rmaster.vm_master = '';
            rmaster.csv = '';
          }
        }
        return rmaster;
      }
      // data.pass = false;
      // data.message += 'not find cluser\n';
      return null;
    }

    async checkClusterList(cdcid, application_type) {
      const { ctx } = this;
      const cluster = [];
      if (cdcid && application_type) {
        const typeClusters = await ctx.model.models.vm_cluster_applicationType.findAll({ where: { applicationTypeId: application_type } });
        // console.log(appCluster);
        // 根据 typeId 和 zoomId 获取 dc，根据dc获取 Cluster
        const dcClusters = await ctx.model.models.vm_cluster_dc_mapping.findAll({ where: { cdcid } });
        if (typeClusters.length > 0 && dcClusters.length > 0) {
          for (const dcCluster of dcClusters) {
            for (const typeclster of typeClusters) {
              if (typeclster.cluster === dcCluster.clusterName) {
                if (cluster.indexOf(dcCluster.clusterName) === -1) {
                  cluster.push(dcCluster.clusterName);
                }
              }
            }
          }
        }
      }
      return cluster;
    }

    async getClusterList(vmlist) {
      const { ctx } = this;
      const inCluster = [];
      const data = {
        pass: true,
        message: '',
      };
      try {
        for (const vm of vmlist) {
          const cluster = [];
          if (vm.data_center && vm.application_type) {
            // 根据applicationType 获取 Cluster
            const typeClusters = await ctx.model.models.vm_cluster_applicationType.findAll({ where: { applicationTypeId: vm.application_type.id } });
            // console.log(appCluster);
            // 根据 typeId 和 zoomId 获取 dc，根据dc获取 Cluster
            const dcClusters = await ctx.model.models.vm_cluster_dc_mapping.findAll({
              where: { cdcid: vm.data_center.id },
            });
            if (dcClusters.length > 0 && typeClusters.length > 0) {
              for (const dcCluster of dcClusters) {
                for (const typeclster of typeClusters) {
                  if (typeclster.cluster === dcCluster.clusterName) {
                    if (cluster.indexOf(dcCluster.clusterName) === -1) {
                      cluster.push(dcCluster.clusterName);
                    }
                  }
                }
              }
            }
            if (cluster) {

              if (vm.type === 'HCI') {
                // 获取ip信息
                const clusterall = await ctx.service.hciResource.getClusterByCenter(cluster, vm.data_center.id, vm.application_type.id);
                if (clusterall.length > 0) {
                  const clusterName = await ctx.service.hciResource.getInHCIList(clusterall, vm, inCluster, data);
                  // 保存名称
                  vm.vm_cluster = clusterName;
                  vm.vm_master = '';
                  vm.csv = '';
                  inCluster.push(vm);
                } else {
                  data.pass = false;
                  data.message += 'vm allaction: ' + vm.id + 'cluster not find vCenter \n';
                }
              } else if (vm.type === 'VMWare') {
                const masterList = await this.getInMasterList(cluster, vm, inCluster, data);
                // 保存名称
                if (masterList) {
                  vm.vm_cluster = masterList.vm_cluster;
                  vm.vm_master = masterList.vm_master;
                  vm.csv = masterList.csv;
                  inCluster.push(vm);
                } else {
                  data.pass = false;
                  data.message += 'cluster or master not find \n';
                }
              } else {
                data.pass = false;
                data.message += 'type error' + vm.id + 'cluster not find \n';
              }
            } else {
              data.pass = false;
              data.message += 'vm allaction: ' + vm.id + 'cluster not find \n';
            }
          } else {
            data.pass = false;
            data.message += ' network_zone or application_type is null \n';
          }
        }
      } catch (e) {
        data.pass = false;
        data.message += e.message;
      }
      return data;
    }

    // async getCheck(vm_cluster, vm_master, data_storage_request_number, ram_request_number, cpu_request_number, type) {
    //   const vm = {
    //     vm_cluster,
    //     vm_master,
    //     data_storage_request_number,
    //     ram_request_number,
    //     cpu_request_number,
    //   };
    //   if (type === 'HCI') {
    //     return this.getCheckHCI(vm);
    //   }
    //   return this.getCheckVMMare(vm);
    //
    // }
    async getCheck(vm_cluster, vm_master, data_storage_request_number, ram_request_number, cpu_request_number, type, jobId) {
      const { ctx } = this;
      const vm = {
        vm_cluster,
        vm_master,
        data_storage_request_number,
        ram_request_number,
        cpu_request_number,
      };
      if (type === 'HCI') {
        return await ctx.service.hciResource.getCheckHCI(vm, jobId);

      }
      return this.getCheckVMMare(vm, jobId);

    }

    async getCheckVMMare(vm, jobId) {
      console.log('====================Check VM Cluster', new Date());
      const vmResult = {
        fieldName: 'vm_cluster',
        error: false,
        done: false,
        message: null,
      };
      const vmmList = await this.setCheckVMMare(vm.vm_cluster, jobId);
      if (vmmList.length > 0) {
        // 保存 HCIList
        await this.saveVMMare(vmmList);
        const vmm = vmmList[0];
        vmResult.error = false;
        vmResult.done = true;
        vmResult.message = '';
        // if (vm.vm_cluster === 'devesxi02cs') {
        //   vmm = vmmList[1];
        // }
        if (vmm.totalRam * 0.2 > vmm.freeRam - vm.data_storage_request_number * 1024) {
          vmResult.error = true;
          vmResult.done = true;
          vmResult.message = ' vm_cluster data_storage_request_number beyond 80% ';
          return vmResult;
        }
        if (vmm.TotalMemory * 0.2 > vmm.FreeMemory - vm.ram_request_number * 1024) {
          vmResult.error = true;
          vmResult.done = true;
          vmResult.message = ' vm_cluster ram_request_number beyond 80% ';
          return vmResult;
        }
        if (vmm.NumberofCPU * 2.5 * 0.2 > vmm.NumberofCPU * 2.5 - vm.cpu_request_number - vmm.NoCPUUsed) {
          vmResult.error = true;
          vmResult.done = true;
          vmResult.message = ' vm_cluster cpu_request_number beyond 80% ';
          return vmResult;
        }
        // 判断VM MASTER
        const master = vmm.ESXiDetails.find(t => t['Esxi Name'] === vm.vm_master);
        if (master) {
          if (master.TotalMemory * 0.2 > master.FreeMemory - vm.ram_request_number * 1024) {
            vmResult.fieldName = 'vm_master';
            vmResult.error = true;
            vmResult.done = true;
            vmResult.message = ' vm_master ram_request_number beyond 80% ';
            return vmResult;
          }
          if (master.NumberofCPU * 2.5 * 0.2 > master.NumberofCPU * 2.5 - vm.cpu_request_number - master.NoCPUUsed) {
            vmResult.fieldName = 'vm_master';
            vmResult.error = true;
            vmResult.done = true;
            vmResult.message = ' vm_master cpu beyond 80% ';
            return vmResult;
          }
        } else {
          vmResult.fieldName = 'vm_master';
          vmResult.error = true;
          vmResult.done = true;
          vmResult.message = ' vm_master can not be found ';
          return vmResult;
        }
      } else {
        vmResult.error = true;
        vmResult.done = false;
        vmResult.message = ' vm_cluster can not be found ';
        return vmResult;
      }
      return vmResult;
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

    async saveVMMare(clusters) {
      const { ctx } = this;
      let transaction;
      try {
        // 建立事务对象
        transaction = await this.ctx.model.transaction();
        for (const cluster of clusters) {
          let clusterId = 0;
          const clusterFind = await ctx.model.models.vm_cluster.findOne({ where: { VMClusterName: cluster.ClusterName } });
          if (clusterFind) {
            clusterId = clusterFind.id;
            clusterFind.totalMemory = parseFloat(parseFloat(cluster.TotalMemory / 1024).toFixed(2));
            clusterFind.totalNumbeOfCPU = cluster.NumberofCPU;
            clusterFind.storagePoolSize = parseInt(cluster.totalRam / 1024);
            clusterFind.save({ transaction });
            // await ctx.model.models.vm_cluster.update(clusterFind, { transaction });
          } else {
            const clusterModel = {
              totalMemory: parseFloat(parseFloat(cluster.TotalMemory / 1024)
                .toFixed(2)),
              totalNumbeOfCPU: cluster.NumberofCPU,
              storagePoolSize: parseInt(cluster.totalRam / 1024),
              VMClusterName: cluster.ClusterName,
            };
            const clusterData = await ctx.model.models.vm_cluster.create(clusterModel, { transaction });
            // eslint-disable-next-line no-unused-vars
            clusterId = clusterData.id;
          }
          for (const master of cluster.ESXiDetails) {
            const masterFind = await ctx.model.models.vm_master.findOne({ where: { VMCMasterName: master['Esxi Name'] } });
            if (masterFind) {
              masterFind.numberOfCPU = master.NumberofCPU;
              masterFind.nmemory = parseFloat(master.TotalMemory / 1024).toFixed(2);
              masterFind.save({ transaction });
              // await ctx.model.models.vm_master.update(masterFind, { transaction });
            } else {
              const masterModel = {
                VMCMasterName: master['Esxi Name'],
                numberOfCPU: master.NumberofCPU,
                memory: parseFloat(master.TotalMemory / 1024)
                  .toFixed(2),
                VMClusterName: cluster.ClusterName,
                VMClusterId: clusterId,
              };
              await ctx.model.models.vm_master.create(masterModel, { transaction });
            }
          }
        }
        await transaction.commit();
      } catch (err) {
        // 事务回滚
        console.log(err);
        await transaction.rollback();
        throw { status: 400, code: 'QUERY_PARAM_INVALID', message: 'save VMMarem error' };
      }
    }

    // async checkVmCluserList(vmList) {
    //   const { ctx } = this;
    //
    // }
    async JsonToVMMarm(list, str, startIndex) {
      try {
        const start = 'ok: [localhost] => {';
        const end = 'TASK';
        const startOf = str.indexOf(start, startIndex);
        if (startOf !== -1) {
          let endOf = str.indexOf(end, startOf);
          if (endOf === -1) {
            endOf = str.indexOf('PLAY', startOf);
          }
          if (endOf === -1) {
            return list;
          }
          const msg = str.substring(startOf + start.length - 1, endOf);
          const msgJson = JSON.parse(msg);
          list.push(msgJson.msg);
          // 往下处理
          await this.JsonToVMMarm(list, str, startOf + start.length);
          return list;
        }
        return list;

      } catch (err) {
        console.log('VMMarm解析失败');
        console.log('==============================');
        console.log(str);
        console.log('==============================');
        console.log(err);
        return list;
      }
    }


    async setCheckVMMare(name, jobId) {
      const cluserMasters = await this.getVMMareByCheck(name, jobId);
      for (const msg of cluserMasters) {
        if (msg) {
          // 循环 Master
          let FreeMemory = 0;
          let NoCPUUsed = 0;
          let NumberofCPU = 0;
          let TotalMemory = 0;
          for (const master of msg.ESXiDetails) {
            const free = setDiskByMb(master['Free Memory']);
            const total = setDiskByMb(master['Total Memory']);
            FreeMemory += free;
            NoCPUUsed += master['No. of CPU Used'];
            NumberofCPU += master['Number of CPU'];
            TotalMemory += total;
            master.FreeMemory = free;
            master.NoCPUUsed = master['No. of CPU Used'];
            master.NumberofCPU = master['Number of CPU'];
            master.TotalMemory = total;
            master.byMemory = setFloat(free, total);
            master.byCPU = setFloat(master['No. of CPU Used'], master['Number of CPU'], 'CPU');
          }
          msg.FreeMemory = FreeMemory;
          msg.NoCPUUsed = NoCPUUsed;
          msg.NumberofCPU = NumberofCPU;
          msg.TotalMemory = TotalMemory;
          msg.orderByMemory = setFloat(FreeMemory, TotalMemory);
          msg.orderByCPU = setFloat(NoCPUUsed, NumberofCPU, 'CPU');
          // 循环硬盘
          let freeRam = 0;
          let totalRam = 0;
          let isRamCsv = false;
          for (const ram of msg.DatastoreDetails) {
            // 判断硬盘信息
            const freeRamData = setDiskByMb(ram.free);
            const totalRamData = setDiskByMb(ram.total);
            if (ram.name.indexOf('Encrypted') === -1) {
              if ((totalRamData * 0.2) < (freeRamData - (150 * 1024))) {
                isRamCsv = true;
                ram.isCsv = true;
              } else {
                ram.isCsv = false;
              }
              ram.orderByCsv = setFloat(freeRamData, totalRamData);
              freeRam += freeRamData;
              totalRam += totalRamData;
            } else {
              ram.isCsv = false;
              ram.orderByCsv = setFloat(freeRamData, totalRamData);
            }
          }
          msg.isRamCsv = isRamCsv;
          msg.freeRam = freeRam;
          msg.totalRam = totalRam;
          msg.orderByRam = setFloat(freeRam, totalRam);
        }
      }
      return cluserMasters;
    }


    async setVMMare(names) {
      console.log('====================Get VM Cluster By Anb', new Date());
      const cluserMasters = await this.getVMMareAll(names);
      console.log('====================Get VM Cluster By Anb End', new Date());
      for (const msg of cluserMasters) {
        if (msg) {
          // 循环 Master
          let FreeMemory = 0;
          let NoCPUUsed = 0;
          let NumberofCPU = 0;
          let TotalMemory = 0;
          for (const master of msg.ESXiDetails) {
            const free = setDiskByMb(master['Free Memory']);
            const total = setDiskByMb(master['Total Memory']);
            FreeMemory += free;
            NoCPUUsed += master['No. of CPU Used'];
            NumberofCPU += master['Number of CPU'];
            TotalMemory += total;
            master.FreeMemory = free;
            master.NoCPUUsed = master['No. of CPU Used'];
            master.NumberofCPU = master['Number of CPU'];
            master.TotalMemory = total;
            master.byMemory = setFloat(free, total);
            master.byCPU = setFloat(master['No. of CPU Used'], master['Number of CPU'], 'CPU');
          }
          msg.FreeMemory = FreeMemory;
          msg.NoCPUUsed = NoCPUUsed;
          msg.NumberofCPU = NumberofCPU;
          msg.TotalMemory = TotalMemory;
          msg.orderByMemory = setFloat(FreeMemory, TotalMemory);
          msg.orderByCPU = setFloat(NoCPUUsed, NumberofCPU, 'CPU');
          // 循环硬盘
          let freeRam = 0;
          let totalRam = 0;
          let isRamCsv = false;
          for (const ram of msg.DatastoreDetails) {
            // 判断硬盘信息
            const freeRamData = setDiskByMb(ram.free);
            const totalRamData = setDiskByMb(ram.total);
            if (ram.name.indexOf('Encrypted') === -1) {
              if ((totalRamData * 0.2) < (freeRamData - (150 * 1024))) {
                isRamCsv = true;
                ram.isCsv = true;
              } else {
                ram.isCsv = false;
              }
              ram.orderByCsv = setFloat(freeRamData, totalRamData);
              freeRam += freeRamData;
              totalRam += totalRamData;
            } else {
              ram.isCsv = false;
              ram.orderByCsv = setFloat(freeRamData, totalRamData);
            }
          }
          msg.isRamCsv = isRamCsv;
          msg.freeRam = freeRam;
          msg.totalRam = totalRam;
          msg.orderByRam = setFloat(freeRam, totalRam);
        }
      }
      console.log('====================Set VM Cluster End', new Date());
      return cluserMasters;
    }

    async getVMMareByCheck(name, jobId) {
      if (jobId) {
        const str = await this.getAnsibleVMWareByJobId(jobId);
        if (str) {
          const msgs = await this.JsonToVMMarm([], str, 0);
          const masters = [];
          const msg = msgs.filter(t => t['Cluster Name'].trim() === name);
          if (msg.length > 0) {
            const master = {
              ClusterName: name,
              ESXiDetails: [],
              DatastoreDetails: [],
            };
            const msg = msgs.filter(t => t['Cluster Name'].trim() === name);
            for (const detail of msg) {
              if (detail['ESXi Details']) {
                master.ESXiDetails = detail['ESXi Details'];
              }
              if (detail['Datastore Details']) {
                master.DatastoreDetails = detail['Datastore Details'];
              }
            }
            masters.push(master);
          }
          return masters;
        }
        return [];
      }
      return [];
    }


    async getVMMareAll(names) {
      console.log(names);
      if (names && names.length > 0) {
        const name = names.join();
        const str = await this.getAnsibleVMWare({ vClusters: name });
        if (str) {
          const msgs = await this.JsonToVMMarm([], str, 0);
          const masters = [];
          for (const name of names) {
            const msg = msgs.filter(t => t['Cluster Name'].trim() === name);
            if (msg.length > 0) {
              const master = {
                ClusterName: name,
                ESXiDetails: [],
                DatastoreDetails: [],
              };
              const msg = msgs.filter(t => t['Cluster Name'].trim() === name);
              for (const detail of msg) {
                if (detail['ESXi Details']) {
                  master.ESXiDetails = detail['ESXi Details'];
                }
                if (detail['Datastore Details']) {
                  master.DatastoreDetails = detail['Datastore Details'];
                }
              }
              masters.push(master);
            }
          }
          return masters;
        }
      }
      return [];
    }

    async getAnsibleJob(data) {
      const url = app.config.activiti.url + '/getAnsibleJob';

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
          data,
        };
        const job = await ctx.service.syncActiviti.curl(url, options, ctx);
        return job.data;
      } catch (err) {
        console.log(err);
        return '';
      }
    }

    async getAnsibleVMWareByJobId(jobId) {
      const url = app.config.activiti.url + '/getVMWareResource';
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

    async getAnsibleVMWare(data) {
      const url = app.config.activiti.url + '/getAnsibleVMWareResource';
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
