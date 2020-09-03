'use strict';

const _ = require('lodash');
const axios = require('axios');

module.exports = app => {
  return class extends app.Service {
    async getInCluserList(clusterNames, vm, inList, data) {
      let clusterInList = [];
      const hciList = await this.getHCIAll(clusterNames);
      // 保存 HCIList
      await this.saveHCI(hciList);
      for (const hci of hciList) {
        const inClusters = inList.filter(t => t.vm_cluster === hci.name);
        if (inClusters.length > 0) {
          for (const inCluster of inClusters) {
            hci.NoCPUUsed = hci.NoCPUUsed + inCluster.cpu_request_number;
            hci.FreeMemory = hci.FreeMemory - inCluster.ram_request_number * 1024;
            hci.FreeDiskSize = hci.FreeDiskSize - inCluster.data_storage_request_number * 1024;
          }
        }
        if (hci.TotalDiskSize * 0.2 < hci.FreeDiskSize - vm.data_storage_request_number * 1024) {
          continue;
        }
        if (hci.TotalMemory * 0.2 < hci.FreeMemory - vm.ram_request_number * 1024) {
          continue;
        }
        if (hci.NumberofCPU * 2 * 0.2 < hci.NumberofCPU * 2 - vm.cpu_request_number - hci.NoCPUUsed) {
          continue;
        }
        hci.orderByMemory = setFloat(hci.FreeMemory, hci.TotalMemory);
        hci.orderByCPU = setFloat(hci.NoCPUUsed, hci.NumberofCPU, 'CPU');
        hci.orderByRam = setFloat(hci.FreeDiskSize, hci.TotalDiskSize);
        clusterInList.push(hci);
      }
      if (clusterInList.length > 0) {
        clusterInList = _.orderBy(clusterInList, [ 'orderByCPU', 'orderByMemory', 'orderByRam' ], [ 'desc', 'desc', 'desc' ]);
        return clusterInList;
      }
      data.pass = false;
      data.message += 'not find cluser/n';
      return null;
    }

    async getInMasterList(clusterNames, vm, inList, data) {
      let clusterInList = [];
      const vmmList = await this.getVMMareAll(clusterNames);
      // 保存 VMMare
      await this.saveVMMare(vmmList);
      const rmaster = {
        vm_cluster: '',
        vm_master: '',
      };
      for (const vmm of vmmList) {
        const inClusters = inList.filter(t => t.vm_cluster === vmm.ClusterName);
        if (inClusters.length > 0) {
          for (const inCluster of inClusters) {
            vmm.NoCPUUsed = vmm.NoCPUUsed + inCluster.cpu_request_number;
            vmm.FreeMemory = vmm.FreeMemory - inCluster.ram_request_number * 1024;
            vmm.freeRam = vmm.freeRam - inCluster.data_storage_request_number * 1024;
          }
        }
        if (vmm.totalRam * 0.2 < vmm.freeRam - vm.data_storage_request_number * 1024) {
          continue;
        }
        if (vmm.TotalMemory * 0.2 < vmm.FreeMemory - vm.ram_request_number * 1024) {
          continue;
        }
        if (vmm.NumberofCPU * 2 * 0.2 < vmm.NumberofCPU * 2 - vm.cpu_request_number - vmm.NoCPUUsed) {
          continue;
        }
        vmm.orderByMemory = setFloat(vmm.FreeMemory, vmm.TotalMemory);
        vmm.orderByCPU = setFloat(vmm.NoCPUUsed, vmm.NumberofCPU, 'CPU');
        vmm.orderByRam = setFloat(vmm.FreeDiskSize, vmm.TotalDiskSize);
        clusterInList.push(vmm);
      }
      if (clusterInList.length > 0) {
        clusterInList = _.orderBy(clusterInList, [ 'orderByCPU', 'orderByMemory', 'orderByRam' ], [ 'desc', 'desc', 'desc' ]);
        for (const cluster of clusterInList) {
          rmaster.vm_cluster = cluster.ClusterName;
          const masterList = _.orderBy(cluster.ESXiDetails, [ 'byCPU', 'byMemory' ], [ 'desc', 'desc' ]);
          const inClusters = inList.filter(t => t.vm_cluster === cluster.ClusterName);
          let isMaster = false;
          for (const master of masterList) {
            for (const inCluster of inClusters) {
              master.NoCPUUsed = master.NoCPUUsed + inCluster.cpu_request_number;
              master.FreeMemory = master.FreeMemory - inCluster.ram_request_number * 1024;
            }
            if (master.TotalMemory * 0.2 < master.FreeMemory - vm.ram_request_number * 1024) {
              continue;
            }
            if (master.NumberofCPU * 2 * 0.2 < master.NumberofCPU * 2 - vm.cpu_request_number - master.NoCPUUsed) {
              continue;
            }
            rmaster.vm_master = master['Esxi Name'];
            isMaster = true;
            break;
          }
          if (isMaster) {
            break;
          }
        }
        return rmaster;
      }
      data.pass = false;
      data.message += 'not find cluser/n';
      return null;
    }

    async getClusterList(vmlist) {
      const { ctx } = this;
      const { Op } = app.Sequelize;
      const inCluster = [];
      const data = {
        pass: true,
        message: '',
      };
      try {
        for (const vm of vmlist) {
          const cluster = [];
          if (vm.network_zone && vm.application_type) {
            // 根据applicationType 获取 Cluster
            const typeClusters = await ctx.model.models.vm_cluster_applicationType.findAll({ where: { applicationTypeId: vm.application_type.id } });
            // console.log(appCluster);
            // 根据 typeId 和 zoomId 获取 dc，根据dc获取 Cluster
            const dcClusters = await ctx.model.models.vm_cluster_dc_mapping.findAll({
              where: { cdcid: { [Op.in]: app.Sequelize.literal(`(select cdcid from vm_type_zone_cdc where typeId = ${vm.environment_type.id} and zoneId = ${vm.network_zone.id})`) } },
            });
            for (const typeCluster of typeClusters) {
              cluster.push(typeCluster.cluster);
            }
            for (const dcCluster of dcClusters) {
              if (cluster.indexOf(dcCluster.clusterName) === -1) {
                cluster.push(dcCluster.clusterName);
              }
            }
            if (cluster) {
              if (vm.type === 'HCI') {
                const clusterName = await this.getInCluserList(cluster, vm, inCluster, data);
                // 保存名称
                vm.vm_cluster = clusterName;
                inCluster.push(vm);
              } else if (vm.type === 'VMMaster') {
                const masterList = await this.getInMasterList(cluster, vm, inCluster, data);
                // 保存名称
                if (masterList) {
                  vm.vm_cluster = masterList.cluster;
                  vm.master = masterList.master;
                  inCluster.push(vm);
                } else {
                  data.pass = false;
                  data.message += 'master cluster not find/n';
                }
              } else {
                data.pass = false;
                data.message += 'type error' + vm.id + 'cluster not find/n';
              }
            } else {
              data.pass = false;
              data.message += 'vm allaction: ' + vm.id + 'cluster not find/n';
            }
          } else {
            data.pass = false;
            data.message += 'network_zone or application_type is null/n';
          }
        }
      } catch (e) {
        data.pass = false;
        data.message += e.message;
      }
      return data;
    }

    async getCheck(vm_cluster, vm_master, data_storage_request_number, ram_request_number, cpu_request_number, type) {
      const vm = {
        vm_cluster,
        vm_master,
        data_storage_request_number,
        ram_request_number,
        cpu_request_number,
      };
      if (type === 'HCI') {
        return this.getCheckHCI(vm);
      }
      return this.getCheckVMMare(vm);

    }

    async getCheckHCI(vm) {
      const hciList = await this.getHCIAll([ vm.vm_cluster ]);
      const hciResult = {
        fieldName: 'vm_cluster',
        error: false,
        message: null,
      };
      if (hciList.length > 0) {
        // 保存 HCIList
        await this.saveHCI(hciList);
        const hci = hciList[0];
        if (hci.TotalDiskSize * 0.2 < hci.FreeDiskSize - vm.data_storage_request_number * 1024) {
          hciResult.error = true;
          hciResult.message = ' vm_cluster data_storage_request_number beyond 80% ';
          return hciResult;
        }
        if (hci.TotalMemory * 0.2 < hci.FreeMemory - vm.ram_request_number * 1024) {
          hciResult.error = true;
          hciResult.message = ' vm_cluster ram_request_number beyond 80% ';
          return hciResult;
        }
        if (hci.NumberofCPU * 2 * 0.2 < hci.NumberofCPU * 2 - vm.cpu_request_number - hci.NoCPUUsed) {
          hciResult.error = true;
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

    async getCheckVMMare(vm) {
      const vmResult = {
        fieldName: 'vm_cluster',
        error: false,
        message: null,
      };
      const vmmList = await this.getVMMareAll([ vm.vm_cluster ]);
      if (vmmList.length > 0) {
        // 保存 HCIList
        await this.saveVMMare(vmmList);
        const vmm = vmmList[0];
        if (vmm.totalRam * 0.2 < vmm.freeRam - vm.data_storage_request_number * 1024) {
          vmResult.error = true;
          vmResult.message = ' vm_cluster data_storage_request_number beyond 80% ';
          return vmResult;
        }
        if (vmm.TotalMemory * 0.2 < vmm.FreeMemory - vm.ram_request_number * 1024) {
          vmResult.error = true;
          vmResult.message = ' vm_cluster data_storage_request_number beyond 80% ';
          return vmResult;
        }
        if (vmm.NumberofCPU * 2 * 0.2 < vmm.NumberofCPU * 2 - vm.cpu_request_number - vmm.NoCPUUsed) {
          vmResult.error = true;
          vmResult.message = ' vm_cluster data_storage_request_number beyond 80% ';
          return vmResult;
        }
        // 判断VM MASTER
        const master = vmm.ESXiDetails.find(t => t['Esxi Name'] === vm.vm_master);
        if (master) {
          if (master.TotalMemory * 0.2 < master.FreeMemory - vm.ram_request_number * 1024) {
            vmResult.fieldName = 'vm_master';
            vmResult.error = true;
            vmResult.message = ' vm_master ram_request_number beyond 80% ';
            return vmResult;
          }
          if (master.NumberofCPU * 2 * 0.2 < master.NumberofCPU * 2 - vm.cpu_request_number - master.NoCPUUsed) {
            vmResult.fieldName = 'vm_master';
            vmResult.error = true;
            vmResult.message = ' vm_master cpu beyond 80% ';
            return vmResult;
          }
        } else {
          vmResult.fieldName = 'vm_master';
          vmResult.error = true;
          vmResult.message = ' vm_cluster can not be found ';
          return vmResult;
        }
      } else {
        vmResult.error = true;
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
          console.log(clusterFind);
          if (clusterFind) {
            clusterId = clusterFind.id;
            clusterFind.totalMemory = parseFloat(cluster.TotalMemory / 1024).toFixed(2);
            clusterFind.totalNumbeOfCPU = cluster.NumberofCPU;
            clusterFind.storagePoolSize = parseInt(cluster.totalRam / 1024);
            clusterFind.save({ transaction });
            // await ctx.model.models.vm_cluster.update(clusterFind, { transaction });
          } else {
            const clusterModel = {
              totalMemory: parseFloat(cluster.TotalMemory / 1024)
                .toFixed(2),
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

    async saveHCI(clusters) {
      const { ctx } = this;
      let transaction;
      try {
        // 建立事务对象
        transaction = await this.ctx.model.transaction();
        for (const cluster of clusters) {
          const clusterFind = await ctx.model.models.vm_cluster.findOne({ where: { VMClusterName: cluster.ClusterName } });
          if (clusterFind) {
            clusterFind.totalMemory = parseFloat(cluster.TotalMemory / 1024)
              .toFixed(2);
            clusterFind.totalNumbeOfCPU = cluster.NumberofCPU;
            clusterFind.storagePoolSize = parseInt(cluster.TotalDiskSize / 1024);
            clusterFind.save({ transaction });
            // await ctx.model.models.vm_cluster.update(clusterFind, { transaction });
          } else {
            const clusterModel = {
              totalMemory: parseFloat(cluster.TotalMemory / 1024)
                .toFixed(2),
              totalNumbeOfCPU: cluster.NumberofCPU,
              storagePoolSize: parseInt(cluster.TotalDiskSize / 1024),
              VMClusterName: cluster.ClusterName,
            };
            await ctx.model.models.vm_cluster.create(clusterModel, { transaction });
          }
        }
        await transaction.commit();
      } catch (err) {
        // 事务回滚
        console.log(err);
        await transaction.rollback();
        throw { status: 400, code: 'QUERY_PARAM_INVALID', message: 'save HCI error' };
      }
    }

    // async checkVmCluserList(vmList) {
    //   const { ctx } = this;
    //
    // }
    async JsonToVMMarm(list, str, startIndex) {
      const start = 'ok: [localhost] =>';
      const end = 'TASK';
      const endAll = 'PLAY';
      let isAll = false;
      const startOf = str.indexOf(start, startIndex);
      let endOf = str.indexOf(end, startOf);
      if (endOf === -1) {
        endOf = str.indexOf(endAll, startOf);
        isAll = true;
      }
      const msg = str.substring(startOf + start.length, endOf);
      const msgJson = JSON.parse(msg);
      list.push(msgJson.msg);
      if (!isAll) {
        await this.JsonToMaster(list, str, startOf + start.length);
      }
      return list;
    }

    async JsonToHCI(str) {
      const start = 'ok: [localhost] => {';
      const end = 'PLAY';
      const startOf = str.indexOf(start);
      const endOf = str.indexOf(end, startOf);
      const msg = str.substring(startOf + start.length - 1, endOf);
      const msgJson = JSON.parse(msg);
      return msgJson.msg;
    }

    async setVMMare(names) {
      const cluserMasters = await this.getVMMareAll(names);
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
          for (const ram of msg.DatastoreDetails) {
            freeRam += setDiskByMb(ram.free);
            totalRam += setDiskByMb(ram.total);
          }
          msg.freeRam = freeRam;
          msg.totalRam = totalRam;
          msg.orderByRam = setFloat(freeRam, totalRam);
        }
      }
      return cluserMasters;
    }

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

    async getHCIAll(names) {
      const name = names.join();
      const str = await this.getAnsibleHCI({ vClusters: name });
      const msgs = await this.JsonToHCI(str);
      const HCI = [];
      for (const msg of msgs) {
        HCI.push(setColoumn(msg));
      }
      return HCI;
    }


    async getVMMareAll(names) {
      const name = names.join();
      const str = await this.getAnsibleVMWare({ vClusters: name });
      const msgs = await this.JsonToVMMarm([], str, 0);
      const masters = [];
      for (const name of names) {
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

    async getHCI() {
      const msg = 'PLAY [Get HCI Cluster Resources Info] ******************************************\n' +
        '\n' +
        'TASK [Get target HCI Cluster Resources Info] ***********************************\n' +
        'changed: [localhost] => (item=[\'160.85.116.3\', \'WTSTNHC03CS\'])\n' +
        'changed: [localhost] => (item=[\'160.85.116.13\', \'WTSTNHC02CS\'])\n' +
        '\n' +
        'TASK [set_fact] ****************************************************************\n' +
        'ok: [localhost] => (item=None)\n' +
        'ok: [localhost] => (item=None)\n' +
        'ok: [localhost]\n' +
        '\n' +
        'TASK [Print out HCI details] ***************************************************\n' +
        'ok: [localhost] => {\n' +
        '    "msg": [\n' +
        '        [\n' +
        '            "Cluster Name: WTSTNHC03CS",\n' +
        '            "8 nodes cluster",\n' +
        '            "WTSTNHC03A  normal",\n' +
        '            "WTSTNHC03B  normal",\n' +
        '            "WTSTNHC03C  normal",\n' +
        '            "WTSTNHC03D  normal",\n' +
        '            "WTSTNHC03E  normal",\n' +
        '            "WTSTNHC03F  normal",\n' +
        '            "WTSTNHC03G  normal",\n' +
        '            "WTSTNHC03H  normal",\n' +
        '            "Total VM: 146",\n' +
        '            "CPU Resource Left: 28",\n' +
        '            "No. of CPU Used: 356",\n' +
        '            "Number of CPU: 384",\n' +
        '            "Free Memory: 1197.7763671875GB",\n' +
        '            "Total Memory: 2395.587890625GB",\n' +
        '            "Free Disk Size: 62258.90625GB",\n' +
        '            "Total Disk Size: 93147.1875GB"\n' +
        '        ],\n' +
        '        [\n' +
        '            "Cluster Name: WTSTNHC02CS",\n' +
        '            "8 nodes cluster",\n' +
        '            "WTSTNHC02A  normal",\n' +
        '            "WTSTNHC02B  normal",\n' +
        '            "WTSTNHC02C  normal",\n' +
        '            "WTSTNHC02D  normal",\n' +
        '            "WTSTNHC02E  normal",\n' +
        '            "WTSTNHC02F  normal",\n' +
        '            "WTSTNHC02G  normal",\n' +
        '            "WTSTNHC02H  normal",\n' +
        '            "Total VM: 35",\n' +
        '            "CPU Resource Left: 178",\n' +
        '            "No. of CPU Used: 142",\n' +
        '            "Number of CPU: 320",\n' +
        '            "Free Memory: 1094.666015625GB",\n' +
        '            "Total Memory: 2395.587890625GB",\n' +
        '            "Free Disk Size: 69330.9375GB",\n' +
        '            "Total Disk Size: 93147.1875GB"\n' +
        '        ]\n' +
        '    ]\n' +
        '}\n' +
        '\n' +
        'PLAY RECAP *********************************************************************\n' +
        'localhost                  : ok=3    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0 \n';
      return msg;
    }

    async getAnsibleHCI(params, options) {
      const url = app.config.activiti.url;
      const hci = await axios
        .get(url + '/getAnsibleHCIResource', params, options)
        .then(function(response) {
          return new Promise(resolve => {
            resolve(response.data);
          });
        }).catch(function(error) {
          console.log(error);
        });
      return hci;
    }

    async getAnsibleVMWare(params, options) {
      const url = app.config.activiti.url;
      const hci = await axios
        .get(url + '/getAnsibleVMWareResource', params, options)
        .then(function(response) {
          return new Promise(resolve => {
            resolve(response.data);
          });
        }).catch(function(error) {
          console.log(error);
        });
      return hci;
    }

    async getVMMare() {
      const msg = 'SSH password: \n' +
        'BECOME password[defaults to SSH password]: \n' +
        'Vault password: \n' +
        '\n' +
        'PLAY [Get the VM list from vCenter] ********************************************\n' +
        '\n' +
        'TASK [Gathering Facts] *********************************************************\n' +
        'ok: [localhost]\n' +
        '\n' +
        'TASK [include_tasks] ***********************************************************\n' +
        '. . . . . .\n' +
        '. . . . . .\n' +
        '. . . . . . \n' +
        'TASK [Try to merge list] *******************************************************\n' +
        'ok: [localhost]\n' +
        '\n' +
        'TASK [Print out the ESXi details in devesxi02cs] *******************************\n' +
        'ok: [localhost] => {\n' +
        '        "msg": {\n' +
        '        "Cluster Name": "devesxi02cs", \n' +
        '        "ESXi Details": [\n' +
        '            {\n' +
        '                "Esxi Name": "devesxi02a.corpdev.hadev.org.hk", \n' +
        '                "Free Memory": "7924.03GB ", \n' +
        '                "No. of CPU Used": 44, \n' +
        '                "Number of CPU": 78, \n' +
        '                "Total Memory": "10233.42GB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "Esxi Name": "devesxi02b.corpdev.hadev.org.hk", \n' +
        '                "Free Memory": "8114.45GB ", \n' +
        '                "No. of CPU Used": 47, \n' +
        '                "Number of CPU": 56, \n' +
        '                "Total Memory": "10233.42GB"\n' +
        '            }\n' +
        '        ]\n' +
        '    }\n' +
        '}\n' +
        'TASK [Print out the datastore details in devesxi02cs] **************************\n' +
        'ok: [localhost] => {\n' +
        '    "msg": {\n' +
        '        "Cluster Name": "devesxi02cs", \n' +
        '        "Datastore Details": [\n' +
        '            {\n' +
        '                "free": "517.12 GB", \n' +
        '                "name": "02CS_CSV01", \n' +
        '                "total": "2.00 TB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "free": "1.13 TB", \n' +
        '                "name": "02CS_CSV02", \n' +
        '                "total": "2.00 TB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "free": "861.41 GB", \n' +
        '                "name": "02CS_CSV03_Encrypted", \n' +
        '                "total": "2.00 TB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "free": "789.55 GB", \n' +
        '                "name": "02CS_CSV04_Encrypted", \n' +
        '                "total": "2.00 TB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "free": "514.26 GB", \n' +
        '                "name": "02CS_CSV05_Encrypted", \n' +
        '                "total": "2.00 TB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "free": "351.39 GB", \n' +
        '                "name": "02CS_CSV06_Encrypted", \n' +
        '                "total": "2.00 TB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "free": "952.03 GB", \n' +
        '                "name": "02CS_CSV07", \n' +
        '                "total": "2.00 TB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "free": "2.00 TB", \n' +
        '                "name": "02CS_CSV08", \n' +
        '                "total": "2.00 TB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "free": "1.96 TB", \n' +
        '                "name": "02CS_CSV09", \n' +
        '                "total": "2.00 TB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "free": "2.00 TB", \n' +
        '                "name": "02CS_CSV10", \n' +
        '                "total": "2.00 TB"\n' +
        '            }\n' +
        '        ]\n' +
        '    }\n' +
        '}\n' +
        'TASK [Set Cluster Name] ********************************************************\n' +
        'ok: [localhost]\n' +
        '\n' +
        'TASK [Get the vCenter cluster Info] ********************************************\n' +
        'ok: [localhost -> localhost]\n' +
        '. . . . .  .\n' +
        '. . . . . .\n' +
        '. . . . . .\n' +
        'TASK [Try to merge list] *******************************************************\n' +
        'ok: [localhost]\n' +
        '\n' +
        'TASK [Print out the ESXi details in  devesxi03cs] ******************************\n' +
        'ok: [localhost] => {\n' +
        '    "msg": {\n' +
        '        "Cluster Name": " devesxi03cs", \n' +
        '        "ESXi Details": [\n' +
        '            {\n' +
        '                "Esxi Name": "devesxi03a.corpdev.hadev.org.hk", \n' +
        '                "Free Memory": "8109.22GB ", \n' +
        '                "No. of CPU Used": 49, \n' +
        '                "Number of CPU": 56, \n' +
        '                "Total Memory": "10235.92GB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "Esxi Name": "devesxi03b.corpdev.hadev.org.hk", \n' +
        '                "Free Memory": "8438.87GB ", \n' +
        '                "No. of CPU Used": 38, \n' +
        '                "Number of CPU": 56, \n' +
        '                "Total Memory": "10235.92GB"\n' +
        '            }\n' +
        '        ]\n' +
        '    }\n' +
        '}\n' +
        '\n' +
        'TASK [Print out the datastore details in  devesxi03cs] *************************\n' +
        'ok: [localhost] => {\n' +
        '    "msg": {\n' +
        '        "Cluster Name": " devesxi03cs", \n' +
        '        "Datastore Details": [\n' +
        '            {\n' +
        '                "free": "720.49 GB", \n' +
        '                "name": "03CS_CSV01", \n' +
        '                "total": "2.00 TB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "free": "625.80 GB", \n' +
        '                "name": "03CS_CSV02", \n' +
        '                "total": "2.00 TB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "free": "648.13 GB", \n' +
        '                "name": "03CS_CSV03", \n' +
        '                "total": "2.00 TB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "free": "1.72 TB", \n' +
        '                "name": "03CS_CSV04_Encrypted", \n' +
        '                "total": "2.00 TB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "free": "1.16 TB", \n' +
        '                "name": "03CS_CSV05_Encrypted", \n' +
        '                "total": "2.00 TB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "free": "663.79 GB", \n' +
        '                "name": "03CS_CSV06", \n' +
        '                "total": "2.00 TB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "free": "2.00 TB", \n' +
        '                "name": "03CS_CSV07", \n' +
        '                "total": "2.00 TB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "free": "2.00 TB", \n' +
        '                "name": "03CS_CSV08", \n' +
        '                "total": "2.00 TB"\n' +
        '            }, \n' +
        '            {\n' +
        '                "free": "2.00 TB", \n' +
        '                "name": "03CS_CSV09", \n' +
        '                "total": "2.00 TB"\n' +
        '            }\n' +
        '        ]\n' +
        '    }\n' +
        '\n' +
        '}\n' +
        '\n' +
        'PLAY RECAP *********************************************************************\n' +
        'localhost                  : ok=31   changed=0    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   \n';
      // console.log(msg);
      return msg;
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
