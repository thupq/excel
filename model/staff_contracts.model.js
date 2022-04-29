module.exports = (sequelize, Sequelize) => {
  const StaffContracts = sequelize.define("staff_contracts");
  StaffContracts.init({
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    system_code: {
      type: Sequelize.STRING
    },
    staff_id: {
      type: Sequelize.INTEGER
    },
    contract_type: {
      type: Sequelize.INTEGER
    },
    contract_no: {
      type: Sequelize.STRING
    },
    signer: {
      type: Sequelize.STRING
    },
    effective_date: {
      type: Sequelize.DATE
    },
    expired_date: {
      type: Sequelize.DATE
    },
    is_active: {
      type: Sequelize.INTEGER
    },
    created_time: {
      type: Sequelize.DATE
    },
    created_by: {
      type: Sequelize.STRING
    },
    updated_time: {
      type: Sequelize.DATE
    },
    updated_by: {
      type: Sequelize.STRING
    }
  }, { sequelize, freezeTableName: true});

  return StaffContracts;
};
