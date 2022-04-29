var db = require('../../config/database-config');

async function getPositionById(positionId) {
    const conf = {
        replacements: {positionId: positionId},
        type: db.db.sequelize.QueryTypes.SELECT
    };
    return await db.db.sequelize.query(`select di.*, cp.glone, cp.level from core_positions cp join dict_items di on di.id = cp.job_position where cp.id=:positionId limit 1`, conf);
}


module.exports = {
    getPositionById: getPositionById,
}
