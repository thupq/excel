var db = require('../../config/database-config');
const moment = require('moment');

async function findAll(searchObj, isCount, getAll) {

    let sql = `select cp.id         as core_positions_id,
                    cp.system_code,
                      cp.dept_id,
                      cp.job_position,
                      cp.glone,
                      cp."level",
                      cp.coefficients_salary,
                      cp.effective_date,
                      cp.expired_date,
                      di.dict_name  as work_position,
                      dip.dict_name as naming
               from core_positions cp
                        left join dict_items di on cp.job_position = di.id --vi tri cong viec
                        left join dict_items dip on dip.id = di.parent_id --chuc danh
                        join dict_types dt on dt.id = di.dict_type_id
               where cp.is_active = 1 and di.is_active = '1' and dt.is_active = 1 `;


    if (searchObj.time_working) {
        sql += `and ((cp.effective_date <= $effectiveDate) and (cp.expired_date >= $expiredDate)`;
        sql += ` or (cp.effective_date <= $effectiveDate) and (cp.expired_date is null)) `;
    }
    if (searchObj.core_position_id) {
        sql += `and (cp.job_position = ${searchObj.core_position_id}) `;
    }
    if (searchObj.name_position_id) {
        sql += `and (di.parent_id = ${searchObj.name_position_id}) `;
    }
    if (searchObj.core_department_id) {
        sql += `and (cp.dept_id = ${searchObj.core_department_id}) `;
    }

    if (!isCount || searchObj.excel) {
        sql += ' order by cp.updated_time desc';
    }

    if(!searchObj.excel) {
        if (!searchObj.size) {
            searchObj.size = 20;
        }
        if (!searchObj.page) {
            searchObj.page = 1;
        }

        if (!isCount) {
            sql += ` limit ${searchObj.size} offset ${(searchObj.page - 1) * searchObj.size}`;
        } else {
            sql = `select count(*)
                   from (${sql}) a`
        }
    }

    return await db.db.sequelize.query(sql, {
        bind: {
            effectiveDate: moment(searchObj.time_working).format("YYYY-MM-DD"),
            expiredDate: moment(searchObj.time_working).format("YYYY-MM-DD"),
        },
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

async function searchByListCategory(list_category_id) {
    let sql = `select cp.id         as core_positions_id,
                      cp.dept_id,
                      cp.job_position,
                      cp.glone,
                      cp."level",
                      cp.coefficients_salary,
                      cp.effective_date,
                      cp.expired_date,
                      di.dict_name  as work_position,
                      dip.dict_name as naming,
                      cp.system_code
               from core_positions cp
                        left join dict_items di on cp.job_position = di.id --vi tri cong viec
                        left join dict_items dip on dip.id = di.parent_id --chuc danh
               where cp.is_active = 1 `;
    if(list_category_id.length > 0) {
        sql += ` and cp.id in (:category_id) `
    }
    return await db.db.sequelize.query(sql, {
        replacements: {
            category_id: list_category_id
        },
        type: db.db.sequelize.QueryTypes.SELECT
    });
}


async function findByLevel(level) {
    let sql = `select *
               from core_positions cp
               where cp.is_active = 1 and cp.level = :level`;

    return await db.db.sequelize.query(sql, {
        replacements: {
            level: level
        },
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

async function findBySystemCode(system_code) {
    return await db.db.sequelize.query(`select * from core_positions where lower(system_code) = lower(:system_code)`,
        {
            replacements: {system_code: system_code},
            type: db.db.sequelize.QueryTypes.SELECT
        });
}

async function searchByJobPosition(list_category_id) {
    return await db.db.sequelize.query(`select * from core_positions where job_position in (:category_id) and is_active = 1`,
        {
            replacements: {category_id: list_category_id},
            type: db.db.sequelize.QueryTypes.SELECT
        });
}

module.exports = {
    findAll: findAll,
    searchByListCategory: searchByListCategory,
    findByLevel: findByLevel,
    findBySystemCode: findBySystemCode,
    searchByJobPosition: searchByJobPosition,
}
