var db = require('../../config/database-config');

async function findMainDepartmentByStaffId(staffId) {
    const conf = {
        replacements: {staffId: staffId},
        type: db.db.sequelize.QueryTypes.SELECT
    };
    return await db.db.sequelize.query(`select *
                                                    from core_departments cd
                                                    where id in
                                                          (select cp.dept_id
                                                           from core_staff cs
                                                                    join staff_positions sp on cs.id = sp.staff_id and sp.roles = 1
                                                                    join core_positions cp on sp.position_id = cp.id
                                                           where cs.id = :staffId) limit 1`, conf);
}

async function findTreeDepartmentByDeptd(deptId) {
    return await db.db.sequelize.query(`WITH RECURSIVE subordinates AS (
        SELECT *
        FROM core_departments
        WHERE id = :id
        UNION
        SELECT e.*
        FROM core_departments e
                 INNER JOIN subordinates s ON s.parent_id = e.id
    )
                                                     SELECT *
                                                     FROM subordinates;`, {
        replacements: {id: deptId},
        type: db.db.sequelize.QueryTypes.SELECT
    })
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


async function findByLevel(level) {
  let sql = `select *
               from core_departments cp
               where cp.is_active = 1 and cp.level = :level`;

  return await db.db.sequelize.query(sql, {
    replacements: {
      level: level
    },
    type: db.db.sequelize.QueryTypes.SELECT
  });
}

async function findAllDepartment() {
    let sql = `select id, dep_code, dep_name, level, parent_id from core_departments cd where cd.is_active = 1 `;

    return await db.db.sequelize.query(sql, {
        bind: {},
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

async function findAllByDepName(name) {
    name = '%' + name + '%';
    let sql = `select id, dep_name, path from core_departments where is_active = 1 and path like '${name}'`;
    return await db.db.sequelize.query(sql, {
        bind: {},
        type: db.db.sequelize.QueryTypes.SELECT
    });
}

async function updatePathDept(id, path) {
    let sql = `update core_departments set path = '${path}' where id = ${id}`;
    return await db.db.sequelize.query(sql, {
        bind: {},
        type: db.db.sequelize.QueryTypes.UPDATE
    });
}



module.exports = {
    findByDictTypeName: findByDictTypeName,
    selectNextStaffId: selectNextStaffId,
    findTreeDepartmentByDeptd: findTreeDepartmentByDeptd,
    findMainDepartmentByStaffId: findMainDepartmentByStaffId,
    findByLevel: findByLevel,
    findAllDepartment: findAllDepartment,
    findAllByDepName: findAllByDepName,
    updatePathDept: updatePathDept,
}
