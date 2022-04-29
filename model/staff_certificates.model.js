module.exports = (sequelize, Sequelize) => {
  const StaffCertificates = sequelize.define("staff_certificates");
  StaffCertificates.init({
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    staff_id: {
      type: Sequelize.INTEGER
    },
    training_place: {
      type: Sequelize.STRING
    },
    type: {
      type: Sequelize.INTEGER
    },
    major: {
      type: Sequelize.STRING
    },
    specialist: {
      type: Sequelize.STRING
    },
    classification: {
      type: Sequelize.INTEGER
    },
    graduation_date: {
      type: Sequelize.DATE
    },
    certificate: {
      type: Sequelize.STRING
    },
    date_of_issue: {
      type: Sequelize.DATE
    },
    expired_date: {
      type: Sequelize.DATE
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

  return StaffCertificates;
};
