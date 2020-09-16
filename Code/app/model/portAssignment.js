'use strict';

module.exports = app => {
  const { INTEGER, STRING } = app.Sequelize;

  const portAssignment = app.model.define('portAssignment', {
    id: { type: INTEGER, autoIncrement: true, primaryKey: true },
    _ID: { type: STRING },
    EquipPortID: { type: INTEGER },
    Slot: { type: INTEGER },
    Port: { type: INTEGER },
    RequesterTeam: { type: STRING },
    PortUsage: { type: STRING },
    PortAssignStatus: { type: STRING },
    PortAssignDate: { type: STRING },
    PortAssignerDisplayName: { type: STRING },
    PortTeamingEquip: { type: STRING },
    PortTeamingEquipPort: { type: STRING },
    MoveInRef: { type: STRING },
    MachineIP: { type: STRING },
    MachineHostName: { type: STRING },
    PortAssignmentRemarks: { type: STRING },
    IPAddRef: { type: STRING },
  }, {
    paranoid: true,
    tableName: 'portAssignment',
    tableCnName: 'portAssignment',
  });

  portAssignment.associate = function() {
    const ms = app.model.models;
    ms.portAssignment.belongsTo(ms.equipmentPort, { as: 'equipmentPort', foreignKey: 'EquipPortID', targetKey: '_ID', constraint: false });
  };
  return portAssignment;
};
