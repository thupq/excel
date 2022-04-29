module.exports = (sequelize, Sequelize) => {
  const Login = sequelize.define("login");
  Login.init({
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    login_type: {
      type: Sequelize.STRING
    },
    is_active: {
      type: Sequelize.BOOLEAN
    },
    created_at: {
      type: Sequelize.DATE
    },
    updated_at: {
      type: Sequelize.DATE
    }
  }, { sequelize, freezeTableName: true});

  return Login;
};
