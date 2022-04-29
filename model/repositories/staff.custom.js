var db = require('../../config/database-config');
const moment = require('moment');

async function findByStaffId(staff_code) {
    const conf = {
        replacements: {staff_code: staff_code},
        type: db.db.sequelize.QueryTypes.SELECT
    };
    return await db.db.sequelize.query('SELECT * FROM core_staff where lower(staff_id) = lower(:staff_code)', conf);
}

async function findByCitizenIdNo(citizen_id_no) {
    const conf = {
        replacements: {citizen_id_no: citizen_id_no},
        type: db.db.sequelize.QueryTypes.SELECT
    };
    return await db.db.sequelize.query('SELECT * FROM core_staff where citizen_id_no = :citizen_id_no', conf);
}

async function findByDictTypeName(name) {
    // Use raw SQL queries to select all user
    name = '%' + name + '%';
    return await db.db.sequelize.query('SELECT * FROM dict_types where lower(dict_type_name) like lower(:name) and is_active = 1'
        + ' order by updated_time desc', {
        replacements: {name: name},
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

async function selectNextStaffId() {
    const conf = {
        type: db.db.sequelize.QueryTypes.SELECT
    };
    return await db.db.sequelize.query(`SELECT nextval('core_staff_id_seq')`, conf);
}

async function searchAll(searchObj, isCount, getAll) {
    let sql = `select cs.*,
                      religion_items.dict_name as religion_name,
                      national_items.dict_name as national_name,
                      ethnic_items.dict_name   as ethnic_name,
                      graduated_items.dict_name as graduated_name
               from core_staff cs
                  left join staff_positions sp on cs.id = sp.staff_id and sp.roles = 1 
                  left join core_positions cp on sp.position_id = cp.id 
                  left join dict_items post_items on post_items.id = cp.job_position and post_items.is_active = '1' 
                  left join dict_items post_type on post_type.id = post_items.parent_id and post_type.is_active = '1'
                  left join dict_items religion_items on religion_items.id = cs.religion 
                  left join dict_items national_items on national_items.id = cs.nationality
                  left join dict_items ethnic_items on ethnic_items.id = cs.ethnic
                  left join dict_items graduated_items on graduated_items.id = cs.graduated
               where cs.is_active = 1 `;
    if (searchObj.name) {
        sql += ` and (lower(cs.name) like '%${searchObj.name.toLowerCase()}%')`;
    }
    if (searchObj.staffId) {
        sql += ` and (lower(cs.staff_id) like '%${searchObj.staffId.toLowerCase()}%')`;
    }
    if (searchObj.departmentId) {
        sql += ` and cp.dept_id = ${searchObj.departmentId}`;
    }
    if (searchObj.positionCateId) {
        sql += ` and post_type.id = ${searchObj.positionCateId}`;
    }
    if (searchObj.positionItemId) {
        sql += ` and post_items.id = ${searchObj.positionItemId}`;
    }
    if (searchObj.fromDate && searchObj.toDate) {
        sql += ` and (cs.date_of_employment <= $toDate and (cs.end_date_of_employment >= $fromDate or cs.end_date_of_employment is null))`;
    }
    sql += ' group by cs.id,religion_name,national_name,ethnic_name,graduated_name';
    if (!isCount) {
        sql += ' order by cs.updated_time desc';
    }
    if (!searchObj.size) {
        searchObj.size = 20;
    }
    if (!searchObj.page) {
        searchObj.page = 0;
    }
    if (!getAll) {
        if (!isCount) {
            sql += ` limit ${searchObj.size} offset ${(searchObj.page ? searchObj.page - 1 : 0) * searchObj.size}`;
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
        bind: {
            toDate: moment(searchObj.toDate).format("YYYY-MM-DD"),
            fromDate: moment(searchObj.fromDate).format("YYYY-MM-DD"),
        },
        type: db.db.sequelize.QueryTypes.SELECT
    });
}


async function searchAllExcel(searchObj) {
    let sql = `select cs.*,
                      religion_items.dict_name as religion_name,
                      national_items.dict_name as national_name,
                      ethnic_items.dict_name   as ethnic_name
               from core_staff cs
                   ${'left join staff_positions sp on cs.id = sp.staff_id and sp.roles = 1 left join core_positions cp on sp.position_id = cp.id left join dict_items post_items on post_items.id = cp.job_position ' +
                   'left join dict_types post_type on post_type.id = post_items.parent_id '} ${' left join dict_items religion_items on religion_items.id = cs.religion ' +
               'left join dict_items national_items on national_items.id = cs.nationality ' +
               'left join dict_items ethnic_items on ethnic_items.id = cs.ethnic '}
               where 1=1 `;
    if (searchObj.name) {
        sql += ` and (lower(cs.name) like '%${searchObj.name.toLowerCase()}%')`;
    }
    if (searchObj.staffId) {
        sql += ` and (lower(cs.staff_id) like '%${searchObj.staffId.toLowerCase()}%')`;
    }
    if (searchObj.departmentId) {
        sql += ` and cp.dept_id = ${searchObj.departmentId}`;
    }
    if (searchObj.positionCateId) {
        sql += ` and post_type.id = ${searchObj.positionCateId}`;
    }
    if (searchObj.positionItemId) {
        sql += ` and post_items.id = ${searchObj.positionItemId}`;
    }
    if (searchObj.fromDate && searchObj.toDate) {
        sql += ` and (cs.date_of_employment <= $toDate and (cs.end_date_of_employment >= $fromDate or cs.end_date_of_employment is null))`;
    }
    sql += ' group by cs.id,religion_name,national_name,ethnic_name';
    sql += ' order by cs.updated_time desc';

    return await db.db.sequelize.query(sql, {
        bind: {
            toDate: moment(searchObj.toDate).format("YYYY-MM-DD"),
            fromDate: moment(searchObj.fromDate).format("YYYY-MM-DD"),
        },
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

module.exports = {
    findByDictTypeName: findByDictTypeName,
    findByCitizenIdNo: findByCitizenIdNo,
    selectNextStaffId: selectNextStaffId,
    searchAll: searchAll,
    findByStaffId: findByStaffId,
    searchAllExcel: searchAllExcel
}
