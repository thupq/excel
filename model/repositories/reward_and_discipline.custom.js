var db = require('../../config/database-config');
const config = require('../../config');

const sqlTem = `select DISTINCT rad.*,
                    cs.name as staff_name,
                    cs.staff_id as staff_code,
                    dia.dict_name as reward_type_name,
                    did.dict_name as discipline_type_name
                from reward_and_discipline rad
                    join core_staff cs on cs.id = rad.staff_id and cs.is_active = 1
                    left join dict_items dia on dia.id = rad.reward_type and dia.is_active = '1'
                    left join dict_items did on did.id = rad.discipline_type and did.is_active = '1' 
                where 1 = 1 and rad.is_active = 1`

/**
 * Function search reward and discipline
 * @param {Object} searchObj object condition search
 * @param {Boolean} isCount check count
 * @param {Boolean} getAll check get all
 * @returns Array record staff position
 */
async function findAll(searchObj, isCount, getAll) {
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

    if(searchObj.decision_no) {
        searchObj.decision_no = searchObj.decision_no.trim().toLowerCase();
    }

    let sql = sqlTem;

    // Search
    if (!!searchObj.name) {
        sql += ` and (lower(cs.name) like '%${searchObj.name}%')`;
    }
    if (!!searchObj.staff_code) {
        sql += ` and (lower(cs.staff_id) like '%${searchObj.staff_code}%')`;
    }
    if(!!searchObj.type) {
        sql += ` and (rad.type = ${searchObj.type})`;
    }
    if(!!searchObj.decision_no) {
        sql += ` and (lower(rad.decision_no) like '%${searchObj.decision_no}%')`
    }
    if(!!searchObj.start_date) {
        sql += ` and rad.effective_date >= '${searchObj.start_date}'`
    }
    if(!!searchObj.end_date) {
        sql += ` and rad.effective_date <= '${searchObj.end_date}'`
    }

    if (!isCount || searchObj.excel) {
        sql += ' order by rad.updated_time desc';
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
 * Find by list id
 * @param {*} list_category_id 
 */
async function findByListCategory(list_category_id) {
    let sql = sqlTem;

    if(list_category_id.length > 0) {
        sql += ` and rad.id in (:category_id) `
    }
    return await db.db.sequelize.query(sql, {
        replacements: {
            category_id: list_category_id
        },
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

/**
 * Find by system code
 * @param {String} system_code 
 * @returns Array record reward and discipline
 */
async function findBySystemCode(system_code) {
    return await db.db.sequelize.query(`select * from reward_and_discipline where lower(system_code) = lower(:system_code)`,
        {
            replacements: {
                system_code: system_code
            },
            type: db.db.sequelize.QueryTypes.SELECT
        });
}

module.exports = {
    findAll: findAll,
    findByListCategory: findByListCategory,
    findBySystemCode: findBySystemCode
}