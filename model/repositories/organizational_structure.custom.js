var db = require('../../config/database-config');
const moment = require('moment');

async function findStructureWidthDepartment(searchObj) {
    let sql = `select cp.id as core_position_id, di.dict_type_id, di.dict_name, di.dict_value, sp.roles as staff_position_role, sp.start_date, sp.end_date,
                      cs.id as core_staff_id, cs.staff_id, cs.name, dic.dict_name as note_name, dic.id as note_id
               from core_positions cp
                        join dict_items di on cp.job_position = di.id
                        join dict_types dt on dt.id = di.dict_type_id
                        join staff_positions sp on sp.position_id = cp.id
                        join dict_items dic on dic.id = sp.action
                        join core_staff cs on cs.id = sp.staff_id
               where (cp.is_active = 1 and di.is_active = '1' and dt.is_active = 1 and sp.is_active = 1 and cs.is_active = 1) `;


    if (searchObj.time_working) {
        sql += ` and (sp.start_date <= $startDate) and (sp.end_date is null or sp.end_date >= $startDate)`;
    }
    if (searchObj.core_department_id) {
        sql += ` and (cp.dept_id = ${searchObj.core_department_id})`;
    }

    return await db.db.sequelize.query(sql, {
        bind: {
            startDate: moment(searchObj.time_working).format("YYYY-MM-DD"),
        },
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

async function findTreeDepartmentChildByDeptId(id) {
    return await db.db.sequelize.query(`WITH RECURSIVE subordinates AS (
        SELECT *
        FROM core_departments
        WHERE  id = :id
        UNION
        SELECT e.*
        FROM core_departments e
                 INNER JOIN subordinates s ON s.id = e.parent_id
    )
                                        SELECT *
                                        FROM subordinates`, {
        replacements: {id: id},
        type: db.db.sequelize.QueryTypes.SELECT
    })
}


module.exports = {
    findStructureWidthDepartment: findStructureWidthDepartment,
    findTreeDepartmentChildByDeptId: findTreeDepartmentChildByDeptId
}
