var db = require('../../config/database-config');

async function findAll(searchObj, isCount, getAll) {

    if(searchObj.name) {
        searchObj.name = searchObj.name.trim().toLowerCase();
    }
    if(searchObj.staff_code) {
        searchObj.staff_code = searchObj.staff_code.trim().toLowerCase();
    }

    let sql = `select DISTINCT sc.id,
                    sc.contract_type,
                    sc.effective_date,
                    sc.expired_date,
                    sc.contract_no,
                    sc.signer,
                    cs.staff_id,
                    cs.id as staffid,
                    cs.name,
                    cs.work_permit_title,
                    cp.job_position, --vi tri cong viec
                    di.dict_name  as job_position_name,
                    dip.dict_name as job_position_name_parent

                from staff_contracts sc
                    join core_staff cs on sc.staff_id = cs.id
                    left join (
                        select DISTINCT ON (sp1.staff_id) *
                        from staff_positions sp1
                        where sp1.start_date = (
                            select max(start_date) from staff_positions sp2
                            where sp1.staff_id = sp2.staff_id
                        )
                    ) sp on cs.id = sp.staff_id 
                    left join core_positions cp on sp.position_id = cp.id
                    left join dict_items di on di.id = cp.job_position
                    left join dict_items dip on di.parent_id = dip.id
                where 1 = 1 and sc.is_active = 1  `;

    if (searchObj.name) {
        sql += `and (lower(cs.name) like '%${searchObj.name}%')`;
    }
    if (searchObj.staff_code) {
        sql += `and (lower(cs.staff_id) like '%${searchObj.staff_code}%')`;
    }
    if (searchObj.start_date) {
        sql += `and (sc.effective_date >= '${searchObj.start_date}')`;
    }
    if (searchObj.end_date) {
        sql += `and (sc.effective_date <= '${searchObj.end_date}')`;
    }
    // Chuc danh
    if (searchObj.staff_position_id) {
        sql += `and (dip.id = ${searchObj.staff_position_id})`;
    }
    // Vi tri cong viec
    if (searchObj.core_position_id) {
        sql += `and (cp.job_position = ${searchObj.core_position_id})`;
    }
    // Phong ban
    if (searchObj.core_department_id) {
        sql += `and (cp.dept_id = ${searchObj.core_department_id})`;
    }

    if (!isCount) {
        sql += ' order by cs.name';
    }

    // sql += ` and sc.is_active = 1 order by cs.name`;

    // sql += ' order by sc.updated_time desc';
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
        replacements: {},
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

async function findBySystemCode(system_code) {
    return await db.db.sequelize.query(`select * from staff_contracts where lower(system_code) = lower(:system_code)`,
        {
            replacements: {system_code: system_code},
            type: db.db.sequelize.QueryTypes.SELECT
        });
}


async function findAllByListCategoryId(categoryId) {
    let sql = `SELECT SC.*,
                      CS.NAME     AS FULL_NAME,
                      CS.STAFF_ID AS STAFF_CODE
               FROM STAFF_CONTRACTS SC
                        INNER JOIN CORE_STAFF CS ON SC.STAFF_ID = CS.ID
               WHERE SC.ID in (:categoryId)
                 AND SC.IS_ACTIVE = 1
               ORDER BY CS.NAME`;
    return await db.db.sequelize.query(sql, {
        replacements: {categoryId: categoryId},
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

module.exports = {
    findAll: findAll,
    findBySystemCode: findBySystemCode,
    findAllByListCategoryId: findAllByListCategoryId
}
