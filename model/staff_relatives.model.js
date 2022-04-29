module.exports = (sequelize, Sequelize) => {
  const StaffRelatives = sequelize.define("staff_relatives");
  StaffRelatives.init({
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    staff_id: {
      type: Sequelize.INTEGER
    },
    name: {
      type: Sequelize.STRING
    },
    date_of_birth: {
      type: Sequelize.DATE
    },
    relation: {
      type: Sequelize.INTEGER
    },
    is_dependant: {
      type: Sequelize.INTEGER
    },
    citizen_id_no: {
      type: Sequelize.STRING
    },
    pti_tax_code: {
      type: Sequelize.STRING
    },
    gender: {
      type: Sequelize.INTEGER
    },
    birth_certificate_no: {
      type: Sequelize.STRING
    },
    birth_certificate_book_no: {
      type: Sequelize.STRING
    },
    place_of_residence: {
      type: Sequelize.INTEGER
    },
    place_of_residence_detail: {
      type: Sequelize.STRING
    },
    effective_month: {
      type: Sequelize.STRING
    },
    expired_month: {
      type: Sequelize.STRING
    },
    is_active: {
      type: Sequelize.INTEGER
    },
    system_code: {
      type: Sequelize.STRING
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

  return StaffRelatives;
};
