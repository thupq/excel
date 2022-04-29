var db = require('../../config/database-config');
const moment = require('moment');
const config = require('../../config');

const sqlTem = `select * from tbl_student st where 1 = 1 and st.is_active = 1`

async function findByStudentId(student_id) {
    const conf = {
        replacements: {student_id: student_id},
        type: db.db.sequelize.QueryTypes.SELECT
    };
    return await db.db.sequelize.query('SELECT * FROM tbl_student where student_id = :student_id', conf);
}

async function selectNextStudentId() {
    const conf = {
        type: db.db.sequelize.QueryTypes.SELECT
    };
    return await db.db.sequelize.query(`SELECT nextval('tbl_student_id_seq')`, conf);
}

/**
 * Function search reward and discipline
 * @param {Object} searchObj object condition search
 * @param {Boolean} isCount check count
 * @param {Boolean} getAll check get all
 * @returns Array record staff position
 */
 async function findAll(searchObj, isCount, getAll) {

    // if(searchObj.student_id) {
    //     searchObj.name = searchObj.name.trim().toLowerCase();
    //     if(!config.pattern.name_search.test(searchObj.name)) {
    //         if(isCount) return [{
    //             count: 0
    //         }];
    //         return [];
    //     }
    // }
    // if(searchObj.name) {
    //     searchObj.name = searchObj.name.trim().toLowerCase();
    //     if(!config.pattern.name_search.test(searchObj.name)) {
    //         if(isCount) return [{
    //             count: 0
    //         }];
    //         return [];
    //     }
    // }
    // if(searchObj.class_name) {
    //     searchObj.staff_code = searchObj.staff_code.trim().toLowerCase();
    //     if(!config.pattern.code_search.test(searchObj.staff_code)) {
    //         if(isCount) return [{
    //             count:0
    //         }];
    //         return [];
    //     }
    // }
    // if(searchObj.address) {
    //     searchObj.staff_code = searchObj.staff_code.trim().toLowerCase();
    //     if(!config.pattern.code_search.test(searchObj.staff_code)) {
    //         if(isCount) return [{
    //             count:0
    //         }];
    //         return [];
    //     }
    // }
    // if(searchObj.mobile_phone) {
    //     searchObj.staff_code = searchObj.staff_code.trim().toLowerCase();
    //     if(!config.pattern.code_search.test(searchObj.staff_code)) {
    //         if(isCount) return [{
    //             count:0
    //         }];
    //         return [];
    //     }
    // }

    let sql = sqlTem;

    // Search
    
    if (!!searchObj.name) {
        sql += ` and (lower(st.name) like '%${searchObj.name}%')`;
    }
    if (!!searchObj.student_id) {
        sql += ` and (lower(st.student_id) like '%${searchObj.student_id}%')`;
    }
    if(!!searchObj.class_name) {
        sql += ` and (st.class_name = '${searchObj.class_name}')`;
    }
    if(!!searchObj.address) {
        sql += ` and (lower(st.address) like '${searchObj.address}')`
    }
    if(!!searchObj.mobile_phone) {
        sql += ` and st.mobile_phone like '%${searchObj.mobile_phone}%'`
    }
    if(!!searchObj.gender) {
        sql += ` and st.gender = '${searchObj.gender}'`
    }

    if (!isCount || searchObj.excel) {
        sql += ' order by st.updated_time desc';
    }

    // paging
    if (!searchObj.size) {
        searchObj.size = 3;
    }
    if (!searchObj.page) {
        searchObj.page = 1;
    }

    if (!getAll) {
        if (!isCount) {
            sql += ` limit ${searchObj.size} offset ${(searchObj.page - 1) * searchObj.size}`;
        } else {
            sql = `select count(*) from (${sql}) a`
        }
    } else {
        if (isCount) {
            sql = `select count(*) from (${sql}) a`
        }
    }

    return await db.db.sequelize.query(sql, {
        replacements: {},
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

module.exports = {
    findByStudentId: findByStudentId,
    selectNextStudentId: selectNextStudentId,
    findAll: findAll
}