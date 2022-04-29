module.exports = (sequelize, Sequelize) => {
  const StaffExperiences = sequelize.define("staff_experiences");
  StaffExperiences.init({
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    staff_id: {
      type: Sequelize.INTEGER
    },
    start_date: {
      type: Sequelize.DATE
    },
    end_date: {
      type: Sequelize.DATE
    },
    company: {
      type: Sequelize.STRING
    },
    position: {
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

  return StaffExperiences;
};
