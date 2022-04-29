var db = require('../../config/database-config');
const moment = require('moment');
const config = require('../../config');

async function findAll(searchObj, isCount, getAll) {
    let sql = `select ss.id,
                      ss.position_id,
                      ss.strategy,
                      ss.start_date,
                      ss.end_date,
                      cp.id as core_positions_id,
                      cp.dept_id,
                      cp.job_position,
                      cp.glone,
                      cp."level",
                      cp.coefficients_salary,
                      di.dict_name  as work_position,
                      dip.dict_name as naming,
                      ss.system_code
               from stategic_staffing ss         
                        join core_positions cp on cp.id = ss.position_id
                        left join dict_items di on cp.job_position = di.id --vi tri cong viec
                        left join dict_items dip on dip.id = di.parent_id --chuc danh
               where ss.is_active = 1 `;


    if (searchObj.time_working) {
        sql += `and (ss.start_date <= $startDate) and (ss.end_date >= $endDate)`;
    }
    if (searchObj.core_position_id) {
        sql += `and (cp.job_position = ${searchObj.core_position_id})`;
    }
    if (searchObj.name_position_id) {
        sql += `and (di.parent_id = ${searchObj.name_position_id}) `;
    }
    if (searchObj.core_department_id) {
        sql += `and (cp.dept_id = ${searchObj.core_department_id})`;
    }

    if (!isCount || searchObj.excel) {
        sql += ' order by ss.updated_time desc';
    }

    if(!searchObj.excel) {
        if (!searchObj.size) {
            searchObj.size = 20;
        }
        if (!searchObj.page) {
            searchObj.page = 1;
        }
        if (!getAll) {
            if (!isCount) {
                sql += ` limit ${searchObj.size} offset ${(searchObj.page - 1) * searchObj.size}`;
            } else {
                sql = `select count(*)
                       from (${sql}) a`
            }
        } else {
            if (isCount) {
                sql = `select count(*)
                       from (${sql}) a`
            }
        }
    }

    return await db.db.sequelize.query(sql, {
        bind: {
            startDate: moment(searchObj.time_working).format("YYYY-MM-DD"),
            endDate: moment(searchObj.time_working).format("YYYY-MM-DD"),
        },
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

async function totalEmployeeCurrent(dept_id, job_position) {
    if(!dept_id && !job_position) {
        return [{
            count: "0"
        }];
    }
    let sql = `select count(sp.id)
                from staff_positions sp
                        join core_positions cp on sp.position_id = cp.id
                        left join dict_items dia on dia.id = sp.action
                        left join dict_items diat on diat.id = dia.parent_id
                where 
                    cp.dept_id = :dept_id and cp.job_position = :job_position 
                    and (dia.dict_name <> '${config.DICT_ITEM_NAME.NGHI_VIEC}' and diat.dict_name = '${config.DICT_ITEM_NAME.BIEN_DONG_ANH_HUONG_QTCT}')
                    and ((sp.end_date is null) or (sp.end_date >= current_date))`;

    return await db.db.sequelize.query(sql, {
        replacements: {dept_id: dept_id, job_position: job_position},
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

async function strategicStaffCurrentWithPosition(dept_id, job_position) {
    let sql = `select ss.id, ss.position_id, ss.strategy, ss.start_date, ss.end_date, cp.dept_id, cp.job_position
               from stategic_staffing ss
                        join core_positions cp on cp.id = ss.position_id
                   and cp.dept_id = :dept_id and cp.job_position = :job_position `;

    sql += ` and ss.is_active = 1 order by ss.updated_time`;

    return await db.db.sequelize.query(sql, {
        replacements: {dept_id: dept_id, job_position: job_position},
        type: db.db.sequelize.QueryTypes.SELECT
    });
}


async function searchByListCategory(list_category_id) {
    let sql = `select ss.id,
                      ss.position_id,
                      ss.strategy,
                      ss.start_date,
                      ss.end_date,
                      cp.id as core_positions_id,
                      cp.dept_id,
                      cp.job_position,
                      cp.glone,
                      cp."level",
                      cp.coefficients_salary,
                      di.dict_name  as work_position,
                      dip.dict_name as naming,
                      ss.system_code
               from stategic_staffing ss
                        join core_positions cp on cp.id = ss.position_id
                        left join dict_items di on cp.job_position = di.id --vi tri cong viec
                        left join dict_items dip on dip.id = di.parent_id
               where ss.is_active = 1 `;
    if(list_category_id.length > 0) {
        sql += ` and ss.id in (:category_id) `
    }
    return await db.db.sequelize.query(sql, {
        replacements: {
            category_id: list_category_id
        },
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

async function findBySystemCode(system_code) {
    return await db.db.sequelize.query(`select * from stategic_staffing where lower(system_code) = lower(:system_code)`,
        {
            replacements: {system_code: system_code},
            type: db.db.sequelize.QueryTypes.SELECT
        });
}

async function updateLastStrategic(dept_id, position_id, start_date) {
    if(!dept_id && !position_id) {
        return ;
    }
    let sql = `
        update stategic_staffing set end_date = :start_date
                where id in (select distinct ss.id
               from stategic_staffing ss
                        join core_positions cp on cp.id = ss.position_id
                   and cp.dept_id = :dept_id and cp.job_position = :position_id)
    `;

    return await db.db.sequelize.query(sql,
        {
            replacements: {
                start_date: convertStringToDate(start_date),
                dept_id: dept_id,
                position_id: position_id

            },
            type: db.db.sequelize.QueryTypes.UPDATE
        });
}

function convertStringToDate(str) {
    let dates = str.split(/\//);
    if(dates.length === 3) {
        return dates[1] + '/' + dates[0] + '/' + dates[2];
    }
    return null;
}


module.exports = {
    findAll: findAll,
    strategicStaffCurrentWithPosition: strategicStaffCurrentWithPosition,
    totalEmployeeCurrent: totalEmployeeCurrent,
    searchByListCategory: searchByListCategory,
    findBySystemCode: findBySystemCode,
    updateLastStrategic: updateLastStrategic
}
