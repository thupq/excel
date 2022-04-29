var db = require('../../config/database-config');

async function findByUsername(email) {
  // Use raw SQL queries to select all user
  return await db.db.sequelize.query('SELECT * FROM login where lower(email) = lower(:email) limit 1', {
    replacements: {email: email},
    type: db.db.sequelize.QueryTypes.SELECT
  });
}

module.exports = {
  findByUsername: findByUsername
}
