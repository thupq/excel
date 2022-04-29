var config = require('../config');
const Pool = require('pg').Pool

const pool = new Pool({
  user: config.db.username,
  host: config.db.host,
  database: config.db.dbName,
  password: config.db.password,
  port: 5432
})

const Sequelize = require('sequelize');
const sequelize = new Sequelize(
    config.db.dbName,
    config.db.username,
    config.db.password,
    {
      host: config.db.host,
      dialect: 'postgres',
      pool: {
        min: 0,
        max: 5,
        idle: 10000
      },
      define: {
        charset: 'utf8',
        timestamps: false
      },
      benchmark: false,
      logging: console.log
    }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Login = require("../model/login.model.js")(sequelize, Sequelize);
db.DictTypes = require("../model/dict_types.model.js")(sequelize, Sequelize);
db.DictItems = require("../model/dict_items.model.js")(sequelize, Sequelize);
db.StaffCertificates = require("../model/staff_certificates.model")(sequelize, Sequelize);
db.StaffExperiences = require("../model/staff_experiences.model")(sequelize, Sequelize);
db.StaffRelatives = require("../model/staff_relatives.model")(sequelize, Sequelize);
db.Staffs = require("../model/staff.model.js")(sequelize, Sequelize);
db.Departments = require("../model/department.model")(sequelize, Sequelize);
db.Positions = require("../model/position.model")(sequelize, Sequelize);
db.StaffContracts = require("../model/staff_contracts.model")(sequelize, Sequelize);
db.StaffPositions = require("../model/staff_positions.model")(sequelize, Sequelize);
db.CorePositions = require("../model/core_positions.model")(sequelize, Sequelize);
db.StrategicStaffing = require("../model/strategic_staffing.model")(sequelize, Sequelize);
db.RewardAndDiscipline = require("../model/reward_and_discipline.model")(sequelize, Sequelize);
db.Student = require("../model/student.model.js")(sequelize, Sequelize);

async function getNextSequence(sequenceName) {
  let seq = await db.sequelize.query(`SELECT nextval('${sequenceName}')`, {
    type: db.sequelize.QueryTypes.SELECT
  });
  return seq[0].nextval;
}

module.exports = {
  pool,
  db,
  getNextSequence
};
