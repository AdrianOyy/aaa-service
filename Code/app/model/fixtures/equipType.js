'use strict';
module.exports = [
  {
    model: 'equipType',
    data: {
      Type: 'EqNetwork',
      Profiles: 'Port Assignment,Equipment Port',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    model: 'equipType',
    data: {
      Type: 'EqUPS',
      Profiles: 'PowerOutput',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    model: 'equipType',
    data: {
      Type: 'EqPDU',
      Profiles: 'PowerOutput',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    model: 'equipType',
    data: {
      Type: 'EqATS',
      Profiles: 'PowerOutput',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    model: 'equipType',
    data: {
      Type: 'EqServer',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
];
