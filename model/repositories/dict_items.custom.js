var db = require('../../config/database-config');

async function findByDictTypeId(dictTypeId, name) {
  if(!name) {
    name = null;
  }
  return await db.db.sequelize.query(''
      + ' SELECT di.*, dt.dict_name as parent_dict_value, dts.dict_type_name as parent_dict_type_name,'
      + ' dts.id as parent_type_id, dt.id as parent_id'
      + ' FROM dict_items di left join dict_items dt on di.parent_id = dt.id'
      + ' left join dict_types dts on dt.dict_type_id = dts.id'
      + ' where di.dict_type_id = :dictTypeId '
      + ' and di.is_active = \'1\''
      + ' and (:dict_name is null or lower(di.dict_name) = lower(:dict_name))'
      + ' order by di.updated_time desc', {
    nest: true,
    replacements: {
      dictTypeId: dictTypeId,
      dict_name: name
    },
    type: db.db.sequelize.QueryTypes.SELECT
  });
}

async function findByDictItemNameAndDictTypeId(name, dictTypeId, itemId, parentId){
  if(!name) {
    name = null;
  }
  return await db.db.sequelize.query(
      ` SELECT *
       FROM dict_items di 
       where di.dict_type_id = :dictTypeId 
       and di.is_active = '1'
       and lower(di.dict_name) = lower(:dict_name)
       and (:itemId is null or di.id <> :itemId)
       and (:parentId is null or parent_id = :parentId)`

      , {
    nest: true,
    replacements: {
      dictTypeId: dictTypeId,
      dict_name: name,
      itemId: itemId,
      parentId: parentId
    },
    type: db.db.sequelize.QueryTypes.SELECT
  });
}


async function findByListIds(ids, name) {
  //
  // if(!name) {
  //   name = '';
  // }
  // name = '%'+name.toUpperCase()+'%';
  return await db.db.sequelize.query(`
      select dt.dict_type_name, dt.dict_name_value, di.dict_name, di.dict_value,
             di_pt.dict_name as parent_name, di_pt.dict_value parent_value,
             dt_pt.dict_type_name as parent_type_name, dt_pt.dict_name_value as parent_type_value
      from dict_items di
               inner join dict_types dt on dt.id = di.dict_type_id
               left join dict_items di_pt on di_pt.id = di.parent_id
               left join dict_types dt_pt on di_pt.dict_type_id = dt_pt.id
    
    where di.is_active = '1' 
        ${ids.length > 0 ? 'and dt.id in (:ids)' : ''}
        order by dt.dict_type_name
    `, {
    replacements: {ids: ids},
    type: db.db.sequelize.QueryTypes.SELECT
  });
}

async function findByListItemIds(ids, name) {
  //
  // if(!name) {
  //   name = '';
  // }
  // name = '%'+name.toUpperCase()+'%';
  return await db.db.sequelize.query(`
      select dt.dict_type_name, dt.dict_name_value, di.dict_name, di.dict_value,
             di_pt.dict_name as parent_name, di_pt.dict_value parent_value,
             dt_pt.dict_type_name as parent_type_name, dt_pt.dict_name_value as parent_type_value
      from dict_items di
               inner join dict_types dt on dt.id = di.dict_type_id
               left join dict_items di_pt on di_pt.id = di.parent_id
               left join dict_types dt_pt on di_pt.dict_type_id = dt_pt.id
    
    where di.is_active = '1' 
        ${ids.length > 0 ? 'and di.id in (:ids)' : ''}
        order by dt.dict_type_name
    `, {
    replacements: {ids: ids},
    type: db.db.sequelize.QueryTypes.SELECT
  });
}

async function findByDictItemCode(dict_value) {
  return await db.db.sequelize.query(`
      select di.*
      from dict_items di
        where di.is_active = '1'
        and lower(di.dict_value) = lower(:dict_value) 
    `, {
    replacements: {dict_value: dict_value},
    type: db.db.sequelize.QueryTypes.SELECT
  });
}

async function findByDictTypeNamAndItemName(dictName, name) {
  if(!name) {
    name = null;
  }
  return await db.db.sequelize.query(`SELECT di.*
FROM dict_items di 
left join dict_types dts on di.dict_type_id =
 dts.id where dts.dict_type_name =:dictName  and di.is_active = '1' and (lower(di.dict_name) = lower(:dict_name)) order by di.updated_time desc;`, {
    nest: true,
    replacements: {
      dictName: dictName,
      dict_name: name
    },
    type: db.db.sequelize.QueryTypes.SELECT
  });
}


module.exports = {
  findByDictTypeId: findByDictTypeId,
  findByDictItemNameAndDictTypeId: findByDictItemNameAndDictTypeId,
  findByListIds: findByListIds,
  findByListItemIds: findByListItemIds,
  findByDictItemCode: findByDictItemCode,
  findByDictTypeNamAndItemName: findByDictTypeNamAndItemName
}
