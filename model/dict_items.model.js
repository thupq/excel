module.exports = (sequelize, Sequelize) => {
  const DictItems = sequelize.define("dict_items");
  DictItems.init({
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    dict_type_id: {
      type: Sequelize.INTEGER
    },
    dict_name: {
      type: Sequelize.STRING
    },
    dict_value: {
      type: Sequelize.STRING
    },
    parent_id: {
      type: Sequelize.INTEGER
    },
    additional_info: {
      type: Sequelize.STRING
    },
    is_active: {
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

  return DictItems;
};
