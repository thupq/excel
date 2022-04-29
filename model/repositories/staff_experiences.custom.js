var db = require('../../config/database-config');

async function findStaffExperiences(searchObj) {
    let sql = `select * from staff_experiences where is_active = 1 and staff_id = :staff_id `;

    // sql += ' order by sc.updated_time desc';
    if (!searchObj.size) {
        searchObj.size = 20;
    }
    if (!searchObj.page) {
        searchObj.page = 1;
    }
    sql += ` limit ${searchObj.size} offset ${(searchObj.page - 1) * searchObj.size}`;
    return await db.db.sequelize.query(sql, {
        replacements: {staff_id: searchObj.staff_id},
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

async function findBySystemCode(system_code) {
    return await db.db.sequelize.query(`select * from staff_experiences where lower(system_code) = lower(:system_code)`,
        {
            replacements: {system_code: system_code},
            type: db.db.sequelize.QueryTypes.SELECT
        });
}
async function findAllByListCategoryId(categoryId) {
    let sql = `SELECT SE.STAFF_ID,
                      SE.START_DATE,
                      SE.END_DATE,
                      SE.COMPANY,
                      SE.POSITION,
                      SE.SYSTEM_CODE,
                      CS.NAME     AS FULL_NAME,
                      CS.STAFF_ID AS STAFF_CODE
               FROM STAFF_EXPERIENCES SE
                        INNER JOIN CORE_STAFF CS ON SE.STAFF_ID = CS.ID
               WHERE CS.ID in (:categoryId)
                 AND SE.IS_ACTIVE = 1
               ORDER BY CS.NAME;`;
    return await db.db.sequelize.query(sql, {
        replacements: {categoryId: categoryId},
        type: db.db.sequelize.QueryTypes.SELECT
    });
}
module.exports = {
    findStaffExperiences: findStaffExperiences,
    findBySystemCode: findBySystemCode,
    findAllByListCategoryId: findAllByListCategoryId
}
