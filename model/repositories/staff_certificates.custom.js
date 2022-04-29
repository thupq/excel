var db = require('../../config/database-config');

async function findStaffCertificates(searchObj) {
    let sql = `select sc.id as id, sc.training_place as training_place, sc.certificate as certificate, 
    sc.classification as classification, sc.date_of_issue as date_of_issue, sc.expired_date as expired_date,
    sc.graduation_date as graduation_date, sc.is_active as is_active, sc.major as major, sc.specialist as specialist,
    di.dict_name as major_name, di2.dict_name as specialist_name, classification_items.dict_name as classification_name from staff_certificates sc
    left join dict_items di on sc.major = di.id::varchar
    left join dict_items di2 on sc.specialist = di2.id::varchar
    left join dict_items classification_items on sc.classification = classification_items.id
    where sc.is_active = 1 and sc.staff_id = :staff_id order by sc.updated_time desc`;

    // sql += ' order by sc.updated_time desc';
    // if (!searchObj.size) {
    //     searchObj.size = 20;
    // }
    // if (!searchObj.page) {
    //     searchObj.page = 1;
    // }
    if (searchObj.size && searchObj.page) {
        sql += ` limit ${searchObj.size} offset ${(searchObj.page - 1) * searchObj.size}`;
    }
    return await db.db.sequelize.query(sql, {
        replacements: {staff_id: searchObj.staff_id},
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

async function findBySystemCode(system_code) {
    return await db.db.sequelize.query(`select * from staff_certificates where lower(system_code) = lower(:system_code)`,
        {
        replacements: {system_code: system_code},
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

async function findAllByListCategoryId(categoryId) {
    let sql = `SELECT SC.ID,
                      SC.STAFF_ID,
                      SC.TYPE,
                      SC.TRAINING_PLACE,
                      SC.MAJOR,
                      SC.SPECIALIST,
                      SC.CLASSIFICATION,
                      SC.GRADUATION_DATE,
                      SC.CERTIFICATE,
                      SC.DATE_OF_ISSUE,
                      SC.EXPIRED_DATE,
                      SC.SYSTEM_CODE,
                      CS.NAME as full_name,
                      CS.STAFF_ID as staff_code
               FROM STAFF_CERTIFICATES SC
                        INNER JOIN CORE_STAFF CS ON SC.STAFF_ID = CS.ID
               WHERE CS.ID in (:categoryId)
                 AND SC.IS_ACTIVE = 1
               ORDER BY CS.NAME;`;
    return await db.db.sequelize.query(sql, {
        replacements: {categoryId: categoryId},
        type: db.db.sequelize.QueryTypes.SELECT
    });
}
module.exports = {
    findStaffCertificates: findStaffCertificates,
    findBySystemCode: findBySystemCode,
    findAllByListCategoryId: findAllByListCategoryId
}
