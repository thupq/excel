module.exports = (sequelize, Sequelize) => {
  const DictTypes = sequelize.define("dict_types");
  DictTypes.init({
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    dict_type_name: {
      type: Sequelize.STRING
    },
    dict_name_value: {
      type: Sequelize.STRING
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

  return DictTypes;
};
