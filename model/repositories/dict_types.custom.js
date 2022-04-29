
var db = require('../../config/database-config');

async function findByDictTypeName(name) {
  // Use raw SQL queries to select all user
  name = '%'+name+'%';
  return await db.db.sequelize.query('SELECT * FROM dict_types where lower(dict_type_name) like lower(:name) and is_active = 1'
      + ' order by updated_time desc', {
    replacements: {name: name},
    type: db.db.sequelize.QueryTypes.SELECT
  });
}

async function findByDictTypeNameExactly(name, id) {
  return await db.db.sequelize.query('SELECT * FROM dict_types '
      + ' where lower(dict_type_name) = lower(:name) '
      + ' and is_active = 1'
      + ' and (:id is null or id <> :id) ', {
    replacements: {
      name: name,
      id: id
    },
    type: db.db.sequelize.QueryTypes.SELECT
  });
}

async function findByDictNameValue(name) {
  return await db.db.sequelize.query(`SELECT * FROM dict_types 
       where lower(dict_name_value) = lower(:name) 
       and is_active = 1`, {
    replacements: {
      name: name
    },
    type: db.db.sequelize.QueryTypes.SELECT
  });
}

async function loadCategory(type, name, category_id, all_parent) {
  if(!all_parent) {
    all_parent = null;
  }
  if (type && type === '1') {
    return await db.db.sequelize.query(`SELECT di.* FROM dict_items di 
            inner join dict_types dt on dt.id = di.dict_type_id
            where dt.dict_type_name = :dict_type_name and di.is_active = '1'
            and (:all_parent = 1 or di.parent_id IS NULL) order by di.dict_name`, {
      replacements: {dict_type_name: name, all_parent: all_parent},
      type: db.db.sequelize.QueryTypes.SELECT
    });
  } else {
    // const data = await this.dictItemRepository.createQueryBuilder('di').where('di.parent_id = :category_id', { category_id: category_id }).getMany();
    return await db.db.sequelize.query(`SELECT di.* FROM dict_items di
            where di.parent_id = :category_id and di.is_active = '1' order by di.dict_name`, {
      replacements: {category_id: Number(category_id)},
      type: db.db.sequelize.QueryTypes.SELECT
    });
  }
}

async function findByListIds(ids, name) {

  if(!name) {
    name = '';
  }
  name = '%'+name.toUpperCase()+'%';
  return await db.db.sequelize.query(`
    select * from dict_types dt where is_active = '1' 
        and upper(dict_type_name) like :name
        ${ids.length > 0 ? 'and id in (:ids)' : ''}
    `, {
    replacements: {name: name, ids: ids},
    type: db.db.sequelize.QueryTypes.SELECT
  });
}

async function findDictTreeParent(id) {
  return await db.db.sequelize.query(`WITH RECURSIVE subordinates AS (
    SELECT *
    FROM dict_items
    WHERE id = :id
    UNION
    SELECT e.*
    FROM dict_items e
           INNER JOIN subordinates s ON s.parent_id = e.id
  )
                                      SELECT *
                                      FROM subordinates;`, {
    replacements: {id: id},
    type: db.db.sequelize.QueryTypes.SELECT
  })
}


module.exports = {
  findByDictTypeName: findByDictTypeName,
  findByDictTypeNameExactly: findByDictTypeNameExactly,
  loadCategory: loadCategory,
  findByListIds: findByListIds,
  findByDictNameValue: findByDictNameValue,
  findDictTreeParent: findDictTreeParent
}
