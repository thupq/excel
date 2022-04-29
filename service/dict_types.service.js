const db = require("../config/database-config");
let config = require('../config');
const {now} = require("moment");
let dictTypeRepo = require('../model/repositories/dict_types.custom');
let dictItemRepo = require('../model/repositories/dict_items.custom');
const Excel = require('exceljs');
const path = require('path');
var fs = require('fs');
const dictTypeDto = require('../model/dto/dict_types.dto');
const dictItemsDto = require('../model/dto/dict_items.dto');

function findAll(req, res) {
    var search = req.query['search'];
    if (search === null || search === undefined) {
        search = '';
    }
    dictTypeRepo.findByDictTypeName(search)
        .then(result => {
            config.response(res, result, config.httpStatus.success, req.__('system.success'));
        })
        .catch(error => {
            config.logError(error, req);
            config.response(res, error, config.httpStatus.badRequest, req.__('system.error'));
        });

}

async function create(req, res) {
    var body = req.body;
    let id = await db.getNextSequence('dict_types_id_seq');
    body.is_active = config.active.true;
    body.id = id;
    body.dict_name_value = config.prefix_system_code.dict_type + body.id//config.normalize(body.dict_type_name);
    config.audit(body, req, false);
    let existed = await dictTypeRepo.findByDictTypeNameExactly(body.dict_type_name, null);
    if (existed && existed.length > 0) {
        config.response(res, null, config.httpStatus.badRequest, req.__('dict_type.created.duplicated'));
        return;
    }
    db.db.DictTypes.create(body).then(result => {
        config.response(res, result, config.httpStatus.success, req.__('dict_type.created.success'));
    }).catch(error => {
        config.logError(error, req);
        config.response(res, error, config.httpStatus.badRequest, req.__('dict_type.created.failed'));
    });
}

async function update(req, res) {
    var body = req.body;
    let id = req.params['id'];
    if (id) {
        body.id = id;
        let existed = await dictTypeRepo.findByDictTypeNameExactly(body.dict_type_name, body.id);
        if (existed && existed.length > 0) {
            config.response(res, null, config.httpStatus.badRequest, req.__('dict_type.created.duplicated'));
            return;
        }
        db.db.DictTypes.findOne(
            {
                where: {
                    id: body.id
                },
                raw: true
            }).then(result => {
            if (!result) {
                config.response(res, null, config.httpStatus.badRequest, req.__('dict_type.update.not_found'));
                return;
            }
            // result.dict_name_value = config.normalize(body.dict_type_name);
            result.dict_type_name = body.dict_type_name;
            config.audit(result, req, true);
            db.db.DictTypes.update(result,
                {
                    where: {id: body.id},
                })
                .then(updated => {
                    config.response(res, result, config.httpStatus.success, req.__('dict_type.update.success'));
                }).catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('dict_type.update.failed'));
            });
        })
            .catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('dict_type.update.failed'));
            });
    } else {
        config.response(res, error, config.httpStatus.badRequest, req.__('dict_type.update.failed'));
    }
}

function findOne(req, res) {
    let id = req.params['id'];
    let search = req.query['search'];
    if (id) {
        db.db.DictTypes.findOne(
            {
                where: {
                    id: id
                },
                raw: true
            })
            .then(result => {
                if(!result) {
                    config.response(res, {}, config.httpStatus.success, req.__('dict_types.findOne.not_found'));
                    return;
                }
                dictItemRepo.findByDictTypeId(result.id, search)
                    .then(datas => {
                        result.dict_items = datas;
                        config.response(res, result, config.httpStatus.success, req.__('system.success'));
                    }).catch(errs => {
                    config.logError(errs, req);
                    result.dict_items = [];
                    config.response(res, result, config.httpStatus.success, req.__('system.success'));
                })
            })
            .catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('system.error'));
            })
    } else {
        config.response(res, null, config.httpStatus.badRequest, req.__('dict_type.find.failed'));
    }

}

function deleteDict(req, res) {
    let id = req.params['id'];
    if (id) {
        db.db.DictTypes.findOne(
            {
                where: {
                    id: id
                },
                raw: true
            }).then(result => {
            if (!result) {
                config.response(res, null, config.httpStatus.badRequest, req.__('dict_type.delete.not_found'));
                return;
            }
            result.is_active = config.active.false;
            config.audit(result, req, true);
            db.db.DictTypes.update(result,
                {
                    where: {id: id},
                })
                .then(updated => {
                    config.response(res, result, config.httpStatus.success, req.__('dict_type.delete.success'));
                }).catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('system.error'));
            });
        })
            .catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('system.error'));
            });
    } else {
        config.response(res, error, config.httpStatus.badRequest, req.__('dict_type.find.failed'));
    }
}

function deleteDicts(req, res) {
    let ids = req.body['list_category_id'];
    if (ids && ids.length > 0) {

        db.db.DictTypes.update(
            {
                updated_time: now(),
                updated_by: req.user.email.email,
                is_active: config.active.false
            },
            {
                where: {
                    id: {
                        [db.db.Sequelize.Op.in]: ids
                    },
                },
            })
            .then(result => {
                config.response(res, result, config.httpStatus.success, req.__('dict_type.delete.success'));
            }).catch(error => {
            config.response(res, error, config.httpStatus.badRequest, req.__('system.error'));
        });

    } else {
        config.response(res, error, config.httpStatus.badRequest, req.__('dict_type.find.failed'));
    }
}


/** create item **/

async function createItem(req, res) {
    try {
        let id = req.params['id'];
        let body = req.body;
        const idItem = await db.getNextSequence('dict_items_id_seq');
        console.log(idItem);
        body.id = idItem;
        body.dict_type_id = Number(id);
        body.is_active = '1';
        body.dict_value = config.prefix_system_code.dict_item + body.id;//config.normalize(body.dict_name) + "_" + body.dict_type_id,
        config.audit(body, req, false);
        let existed = await dictItemRepo.findByDictItemNameAndDictTypeId(config.normalize2(body.dict_name), body.dict_type_id, null, body.parent_id);
        if (existed && existed.length > 0) {
            config.response(res, null, config.httpStatus.badRequest, req.__('dict_item.create.duplicated'));
            return;
        }
        db.db.DictItems.create(body)
            .then(result => {
                config.response(res, result, config.httpStatus.success, req.__('dict_item.create.success'));
            })
            .catch(error => {
                config.logError(error, req);
                config.response(res, error, config.httpStatus.badRequest, req.__('dict_item.create.fail'));

            });
    } catch (e) {
        console.error(e);
    }
}

async function updateItem(req, res) {
    let id = req.params['id'];
    let itemId = req.params['item_id'];
    let body = req.body;
    body.dict_type_id = Number(id);
    body.is_active = config.active.true;

    let existed = await dictItemRepo.findByDictItemNameAndDictTypeId(config.normalize2(body.dict_name), body.dict_type_id, itemId, body.parent_id);
    if (existed && existed.length > 0) {
        config.response(res, null, config.httpStatus.badRequest, req.__('dict_item.create.duplicated'));
        return;
    }

    db.db.DictItems.findOne({
        where: {
            id: itemId
        }
    })
        .then(result => {
            db.db.DictItems.update({
                updated_time: now(),
                updated_by: req.user.email.email,
                parent_id: body.parent_id,
                dict_name: body.dict_name
            }, {
                where: {id: itemId}
            }).then(updated => {
                config.response(res, updated, config.httpStatus.success, req.__('dict_item.update.success'));
            }).catch(error => {
                config.logError(error, req);
                config.response(res, result, config.httpStatus.success, req.__('dict_item.update.fail'));
            })

        })
        .catch(error => {
            config.logError(error, req);
            config.response(res, error, config.httpStatus.badRequest, req.__('dict_item.update.fail'));

        })
}

function deleteItem(req, res) {
    let id = req.params['id'];
    let itemId = req.params['item_id'];


    db.db.DictItems.update({
        updated_time: now(),
        updated_by: req.user.email.email,
        is_active: '0'
    }, {
        where: {id: itemId}
    }).then(updated => {
        config.response(res, updated, config.httpStatus.success, req.__('dict_item.delete.success'));
    }).catch(error => {
        config.logError(error, req);
        config.response(res, error, config.httpStatus.success, req.__('dict_item.delete.fail'));
    })


}

function deleteItems(req, res) {
    let id = req.params['id'];
    let itemIds = req.body.list_category_id;

    db.db.DictItems.update({
        updated_time: now(),
        updated_by: req.user.email.email,
        is_active: '0'
    }, {
        where: {
            id: {
                [db.db.Sequelize.Op.in]: itemIds
            }
        }
    }).then(updated => {
        config.response(res, updated, config.httpStatus.success, req.__('dict_item.delete.success'));
    }).catch(error => {
        config.logError(error, req);
        config.response(res, error, config.httpStatus.success, req.__('dict_item.delete.fail'));
    })


}

async function exportExcel(req, res) {
    let body = req.body;
    const dict_type_name = body.dict_type_name;
    const dict_name_value = body.dict_name_value;
    if (body.cate_name && !body.list_category_id.length) {
      const listCate = await dictTypeRepo.findByDictTypeName(body.cate_name);
      if (listCate && listCate.length) {
        listCate.forEach(item => {
          body.list_category_id.push(item.id)
        })
      }
    }
    if (body.type === 1) {
        //export loai danh muc
        exportDictTypes(body.list_category_id, dict_type_name, req, res);
    } else {
        //export gia tri danh muc
        exportDictItems(body.list_category_id, dict_name_value, req, res);
    }

}

async function exportDictTypes(list_category_id, name, req, res) {

    const datas = await dictTypeRepo.findByListIds(list_category_id, name);
    config.exportExcel(req, res, datas, dictTypeDto, '/templates/loai_danh_muc.xlsx');

}

async function exportDictItems(list_category_id, name, req, res) {

    const datas = await dictItemRepo.findByListIds(list_category_id, name);
    config.exportExcel(req, res, datas, dictItemsDto, '/templates/noi_dung_danh_muc.xlsx');

}


function loadCategory(req, res) {
    let type = req.query.type;
    let name = req.query.name;
    let category_id = req.query.category_id;
    let allParent = req.query.parent;

    dictTypeRepo.loadCategory(type, name, category_id, allParent)
        .then(result => {
            config.response(res, result, config.httpStatus.success);
        })
        .catch(error => {
            config.logError(error, req);
            config.response(res, error, config.httpStatus.success, req.__('system.error'));
        });
}

async function downloadTemplate(req, res) {

    const body = req.body;
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
        'Content-Disposition',
        'attachment; filename=noi_dung_danh_muc.xlsx'
    );


    const wb = new Excel.Workbook();
    wb.xlsx.readFile(path.dirname(__dirname) + (body.type == 1 ? '/templates/loai_danh_muc.xlsx' : '/templates/noi_dung_danh_muc.xlsx'))
        .then(result => {
            wb.xlsx.write(res);
        })
        .catch(error => {
            console.error(error);
        });

}

async function importTemplate(req, res) {
    if (!req.file) {
        config.response(res, null, config.httpStatus.badRequest, req.__('system.file.error'));
        return;
    }

    let type = req.body.type;
    if (type == 1) {
        config.logInfo('Import loai danh muc', req);
        return importDictTypes(req, res);
    } else {
        config.logInfo('Import gia tri danh muc', req);
        return importDictItems(req, res);
    }

}

async function importDictTypes(req, res) {
    config.importExcel(req, res, false, dictTypeDto,async (datas, flags, resultObj) => {
        for (let i = 0; i < datas.length; i++) {
            let data = datas[i];
            if (data.dict_name_value) {
                //update
                try {
                    if (!data.dict_type_name) {
                        data.result = req.__('dict_type.type_name.empty');
                        resultObj.totalError++;
                        continue;
                    }
                    let existeds = await dictTypeRepo.findByDictNameValue(data.dict_name_value);
                    if (existeds && existeds.length === 0) {
                        data.result = req.__('dict_type.update.notexist');
                        resultObj.totalError++;
                        continue;
                    }
                    let existed = existeds[0];
                    // result.dict_name_value = config.normalize(body.dict_type_name);
                    existed.is_active = config.active.true;
                    existed.dict_type_name = data.dict_type_name;
                    config.audit(existed, req, true);
                    let saved = await db.db.DictTypes.update(existed,
                        {
                            where: {id: existed.id},
                        });
                    data.result = req.__('dict_type.update.success');
                } catch (e) {
                    config.logError(e);
                    data.result = req.__('dict_type.import.error');
                    resultObj.totalError++;
                }

            } else {
                //insert
                config.logInfo("insert")
                try {
                    if (!data.dict_type_name) {
                        data.result = req.__('dict_type.type_name.empty');
                        resultObj.totalError++;
                        continue;
                    }
                    let existed = await dictTypeRepo.findByDictTypeNameExactly(data.dict_type_name, null);
                    if (existed && existed.length > 0) {
                        data.result = req.__('dict_type.created.duplicated');
                        resultObj.totalError++;
                        continue;
                    }
                    let id = await db.getNextSequence('dict_types_id_seq');
                    data.is_active = config.active.true;
                    data.id = Number(id);
                    data.dict_name_value = config.prefix_system_code.dict_type + data.id
                    config.audit(data, req, false);
                    let result = await db.db.DictTypes.create(data);
                    data.result = req.__('dict_type.created.success');
                } catch (e) {
                    config.logError(e);
                    data.result = req.__('dict_type.import.error');
                    resultObj.totalError++;
                }
            }
        }
    });
}

async function importDictItems(req, res) {
    config.importExcel(req, res, false, dictItemsDto,async (datas, flags, resultObj) => {
        for (let i = 0; i < datas.length; i++) {
            let data = datas[i];

            /**
             * neu trong ma danh muc thi kiem tra loai danh muc de them moi
             * neu dien ma danh muc thi kiem tra ma danh muc ton tai hay khong de cap nhat
             */

            /** dien ma danh muc **/
            if (data.dict_value) {
                //update
                try {
                    if(!data.dict_name) {
                        data.result = req.__('dict_item.dict_name.empty');
                        resultObj.totalError++;
                        continue;
                    }
                    /** lay danh muc theo code **/
                    let itemDbs = await dictItemRepo.findByDictItemCode(data.dict_value);
                    if (itemDbs && itemDbs.length === 0) {
                        data.result = req.__('dict_item.update.notexist');
                        resultObj.totalError++;
                        continue;
                    }


                    let entity = itemDbs[0];
                    if(data.parent_dict_value) {
                        let parents = await dictItemRepo.findByDictItemCode(data.parent_dict_value);
                        if(parents && parents.length == 0) {
                            data.result = req.__('dict_item.update.parent_not_exist');
                            resultObj.totalError++;
                            continue;
                        }
                        entity.parent_id = parents[0].id;
                    } else {
                        entity.parent_id = null;
                    }

                    // let existed = itemDbs[0];
                    let duplicated = await dictItemRepo.findByDictItemNameAndDictTypeId(data.dict_name, entity.dict_type_id, entity.id, entity.parent_id);
                    if(duplicated && duplicated.length > 0) {
                        data.result = req.__('dict_item.update.duplicated');
                        resultObj.totalError++;
                        continue;
                    }

                    entity.is_active = config.activeStr.true;
                    entity.dict_name = data.dict_name;

                    config.audit(entity, req, true);
                    let saved = await db.db.DictItems.update(entity,
                        {
                            where: {id: entity.id},
                        });
                    data.result = req.__('dict_item.update.success');
                } catch (e) {
                    config.logError(e);
                    data.result = req.__('dict_item.import.error');
                    resultObj.totalError++;
                }

            } else {
                /** trong ma danh muc **/

                if(!data.dict_name_value) {
                    data.result = req.__('dict_type.type_code.empty');
                    resultObj.totalError++;
                    continue;
                }
                //insert
                config.logInfo("insert")
                try {
                    let dictType = await dictTypeRepo.findByDictNameValue(data.dict_name_value);
                    if (dictType && dictType.length == 0) {
                        data.result = req.__('dict_type.find.not_found');
                        resultObj.totalError++;
                        continue;
                    }



                    if(data.parent_dict_value) {
                        let parents = await dictItemRepo.findByDictItemCode(data.parent_dict_value);
                        if(parents && parents.length == 0) {
                            data.result = req.__('dict_item.update.parent_not_exist');
                            resultObj.totalError++;
                            continue;
                        }
                        data.parent_id = parents[0].id;
                    } else {
                        data.parent_id = null;
                    }

                    let dictItems = await dictItemRepo.findByDictItemNameAndDictTypeId(data.dict_name, dictType[0].id, null, data.parent_id);
                    if (dictItems && dictItems.length > 0) {
                        data.result = req.__('dict_item.update.duplicated');
                        resultObj.totalError++;
                        continue;
                    }

                    let id = await db.getNextSequence('dict_items_id_seq');
                    data.is_active = config.activeStr.true;
                    data.id = Number(id);
                    data.dict_value = config.prefix_system_code.dict_item + data.id
                    data.dict_type_id = dictType[0].id;
                    config.audit(data, req, false);
                    let result = await db.db.DictItems.create(data);
                    data.result = req.__('dict_item.create.success');
                } catch (e) {
                    config.logError(e);
                    data.result = req.__('dict_item.import.error');
                    resultObj.totalError++;
                }
            }
        }
    });

}

/** function for first import
 * only insert with code from
 * **/
async function importTemplate2(req, res) {
    if (!req.file) {
        config.response(res, null, config.httpStatus.badRequest, req.__('system.file.error'));
        return;
    }

    let type = req.body.type;
    if (type == 1) {
        config.logInfo('Import loai danh muc', req);
        return importDictTypes2(req, res);
    } else {
        config.logInfo('Import gia tri danh muc', req);
        return importDictItems2(req, res);
    }

}

async function importDictTypes2(req, res) {
    config.importExcel(req, res, false, dictTypeDto,async (datas, flags, resultObj) => {
        let created = [];
        let updated = [];
        for (let i = 0; i < datas.length; i++) {
            let data = datas[i];

            if (!data.dict_type_name) {
                data.result = req.__('dict_type.type_name.empty');
                resultObj.totalError++;
                continue;
            }

            /** default -> insert
             * if code existed in database -> update
             */
            let existeds = await dictTypeRepo.findByDictTypeNameExactly(data.dict_type_name, null);
            if (existeds && existeds.length === 0) {
                let id = await db.getNextSequence(config.sequence.dict_type_id_seq);
                data.is_active = config.active.true;
                data.id = Number(id);
                // data.dict_name_value = 'M_' + data.id
                config.audit(data, req, false);
                created.push(data);
            } else {
                let existed = existeds[0];
                // result.dict_name_value = config.normalize(body.dict_type_name);
                existed.is_active = config.active.true;
                existed.dict_type_name = data.dict_type_name;
                config.audit(existed, req, true);
                updated.push(existed); //add to list
            }
        }

        if (created.length > 0) {
            await db.db.DictTypes.bulkCreate(created, {
                fields: dictTypeDto.fields,
                updateOnDuplicate: dictTypeDto.update_key
            });
        }
        if(updated.length > 0) {
            for(let entity of updated) {
                await db.db.DictTypes.upsert(entity);
            }
        }

        datas.forEach(data => {
            // let c = saved.find(v => data.dict_type_name.toLowerCase() === v.dict_type_name.toLowerCase());
            if (!data.result) {
                data.result = req.__('system.file.import.success');
            }
        });
    });
}

async function importDictItems2(req, res) {
    config.importExcel(req, res, false, dictItemsDto,
        async (datas, flags, resultObj) => {
            let created = [];
            let updated = [];
            for (let i = 0; i < datas.length; i++) {
                let data = datas[i];

                /**
                 * default insert,
                 * update if dict_type_id and dict_name is key
                 */

                if (!data.dict_name_value) {
                    data.result = req.__('dict_type.type_code.empty');
                    resultObj.totalError++;
                    continue;
                }

                if (!data.dict_name) {
                    data.result = req.__('dict_item.dict_name.empty');
                    resultObj.totalError++;
                    continue;
                }

                let dictType = await dictTypeRepo.findByDictNameValue(data.dict_name_value);
                if (dictType && dictType.length === 0) {
                    data.result = req.__('dict_type.find.not_found');
                    resultObj.totalError++;
                    continue;
                }

                /** lay danh muc theo code **/
                let itemDbs = await dictItemRepo.findByDictItemCode(data.dict_value);
                let entity = null;
                if (itemDbs && itemDbs.length === 0) {
                    entity = data;
                    let id = await db.getNextSequence(config.sequence.dict_items_id_seq);
                    entity.id = id;
                    created.push(entity);

                } else {
                    entity = itemDbs[0];
                    updated.push(entity);
                }

                if (data.parent_dict_value) {
                    let parents = await dictItemRepo.findByDictItemCode(data.parent_dict_value);
                    if (parents && parents.length === 0) {
                        data.result = req.__('dict_item.update.parent_not_exist');
                        resultObj.totalError++;
                        continue;
                    }
                    entity.parent_id = parents[0].id;
                } else {
                    entity.parent_id = null;
                }

                entity.dict_type_id = dictType[0].id;
                entity.is_active = config.activeStr.true;
                entity.dict_name = data.dict_name;
                config.audit(entity, req, true);
            }

            if (created.length > 0) {
                await db.db.DictItems.bulkCreate(
                    created,
                    {
                        fields: dictItemsDto.fields,
                        updateOnDuplicate: dictItemsDto.update_key
                    }
                )
            }
            if(updated.length > 0) {
                for(let entity of updated) {
                    await db.db.DictItems.upsert(entity);
                }
            }
            datas.forEach(data => {
                // let c = saved.find(v => data.dict_name.toLowerCase() === v.dict_name.toLowerCase());
                if (!data.result) {
                    data.result = req.__('system.file.import.success');
                }
            });
    });
}


async function getparentTree(req, res) {
    let id = req.params['id'];

    dictTypeRepo.findDictTreeParent(id)
        .then(result => {
            config.response(res, result, config.httpStatus.success, req.__('system.success'));
        })
        .catch(error => {
            config.response(res, error, config.httpStatus.badRequest, req.__('system.error'));
        });
}


module.exports = {
    findAll: findAll,
    create: create,
    update: update,
    findOne: findOne,
    deleteDict: deleteDict,
    deleteDicts: deleteDicts,
    createItem: createItem,
    updateItem: updateItem,
    deleteItem: deleteItem,
    deleteItems: deleteItems,
    exportExcel: exportExcel,
    loadCategory: loadCategory,
    downloadTemplate: downloadTemplate,
    importTemplate: importTemplate,
    importTemplate2: importTemplate2,
    getparentTree: getparentTree

}
