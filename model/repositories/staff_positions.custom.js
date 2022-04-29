var db = require('../../config/database-config');
const config = require('../../config');

// sql template
const sqlTem = `select DISTINCT sp.id,
                    sp.system_code,
                    dia.dict_name as action_name,
                    dir.dict_name as reason_name,
                    dird.dict_name as reason_detail_name,
                    sp.description,
                    sp.start_date,
                    sp.end_date,
                    cs.staff_id as staff_code,
                    cs.id as staff_id,
                    cs.name,
                    cs.work_permit_title,
                    cp.dept_id,
                    di.dict_name  as work_position,
                    dip.dict_name as naming,
                    diat.dict_name as action_type_name,
                    sp.updated_time

                from staff_positions sp
                    join core_staff cs on sp.staff_id = cs.id
                    left join core_positions cp on sp.position_id = cp.id
                    left join dict_items di on di.id = cp.job_position -- vi tri cong viec
                    left join dict_items dip on dip.id = di.parent_id -- chuc danh
                    left join dict_items dird on dird.id = sp.reason_detail -- ly do chi tiet
                    left join dict_items dir on (dir.id = dird.parent_id or (sp.reason_detail is null and dir.id = sp.reason)) -- ly do
                    left join dict_items dia on (dia.id = dir.parent_id or (sp.reason is null and dia.id = sp.action)) -- bien dong
                    left join dict_items diat on diat.id = dia.parent_id -- loai bien dong
                where 1 = 1 and sp.is_active = 1`;

/**
 * Function search staff positions
 * @param {Object} searchObj object condition search
 * @param {Boolean} isCount check count
 * @param {Boolean} getAll check get all
 * @returns Array record staff position
 */
async function findAll(searchObj, isCount, getAll){
    if(searchObj.name) {
        searchObj.name = searchObj.name.trim().toLowerCase();
        if(!config.pattern.name_search.test(searchObj.name)) {
            if(isCount) return [{
                count: 0
            }];
            return [];
        }
    }
    if(searchObj.staff_code) {
        searchObj.staff_code = searchObj.staff_code.trim().toLowerCase();
        if(!config.pattern.code_search.test(searchObj.staff_code)) {
            if(isCount) return [{
                count:0
            }];
            return [];
        }
    }

    let sql = sqlTem;

    // Search
    if (searchObj.name) {
        sql += ` and (lower(cs.name) like '%${searchObj.name}%')`;
    }
    if (searchObj.staff_code) {
        sql += ` and (lower(cs.staff_id) like '%${searchObj.staff_code}%')`;
    }
    if (searchObj.staff_id) {
        sql += ` and (sp.staff_id = '${searchObj.staff_id}')`;
    }
    if (searchObj.time) {
        sql += ` and (sp.start_date <= '${searchObj.time}' and ( sp.end_date is null or sp.end_date >= '${searchObj.time}' ))`;
    }
    if (searchObj.action) {
        sql += ` and (sp.action = ${searchObj.action})`;
    }
    if (searchObj.action_type) {
        sql += ` and (diat.id = ${searchObj.action_type})`;
    }
    // Chuc danh
    if (searchObj.staff_title) {
        sql += `and (dip.id = ${searchObj.staff_title})`;
    }
    // Vi tri cong viec
    if (searchObj.job_position) {
        sql += ` and (cp.job_position = ${searchObj.job_position})`;
    }
    // Phong ban
    if (searchObj.dept_id) {
        sql += ` and (cp.dept_id = ${searchObj.dept_id})`;
    }

    if (!isCount || searchObj.excel) {
        sql += ' order by sp.updated_time desc';
    }

    // paging
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

    return await db.db.sequelize.query(sql, {
        replacements: {},
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

/**
 * Find record staff position by staff id
 * @param {String} staff_id 
 */
async function findByStaffId(staff_id){
    let sql = sqlTem;

    sql +=  ` and (sp.staff_id = '${staff_id}')`;

    return await db.db.sequelize.query(sql, {
        replacements: {},
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

/**
 * Find by system code
 * @param {String} system_code 
 * @returns Array record staff position
 */
async function findBySystemCode(system_code) {
    return await db.db.sequelize.query(`select * from staff_positions where lower(system_code) = lower(:system_code)`,
        {
            replacements: {
                system_code: system_code
            },
            type: db.db.sequelize.QueryTypes.SELECT
        });
}

/**
 * Find by list id
 * @param {Array} list_category_id 
 */
async function findByListCategory(list_category_id) {
    let sql = sqlTem;

    if(list_category_id.length > 0) {
        sql += ` and sp.id in (:category_id) `
    }
    return await db.db.sequelize.query(sql, {
        replacements: {
            category_id: list_category_id
        },
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

module.exports = {
    findAll: findAll,
    findByStaffId: findByStaffId,
    findBySystemCode: findBySystemCode,
    findByListCategory: findByListCategory
}