const db = require("../config/database-config");
let organizationalStructureRepo = require('../model/repositories/organizational_structure.custom');
let config = require('../config');
const { now } = require("moment");
let departmentRepo = require('../model/repositories/department.custom');

async function findAll(req, res) {
    const searchObj = {
        time_working: req.body['timeWorking'],
        core_department_id: req.body['deptId'],
    }

    let departments = await departmentRepo.findAllDepartment();
    let deptChoose = null
    let deptResults = []

    if (departments.length > 0) {
        if (searchObj.core_department_id) {
            deptChoose = departments.find(e => e.id === searchObj.core_department_id);
        }

        for (let dept of departments) {
            if (searchObj.core_department_id) {
                if (deptChoose && dept.id == deptChoose.id) {
                    const ob = {
                        time_working: req.body['timeWorking'],
                        core_department_id: deptChoose.id,
                    }
                    let structure = await organizationalStructureRepo.findStructureWidthDepartment(ob);
                    dept.job_position = structure
                    deptResults.push(dept)
                } else if (deptChoose && dept.level > deptChoose.level) {
                  const ob = {
                    time_working: req.body['timeWorking'],
                    core_department_id: dept.id,
                }
                    let structure = await organizationalStructureRepo.findStructureWidthDepartment(ob);
                    dept.job_position = structure
                    deptResults.push(dept)
                }
            } else {
                const ob = {
                    time_working: req.body['timeWorking'],
                    core_department_id: dept.id,
                }
                let structure = await organizationalStructureRepo.findStructureWidthDepartment(ob);
                dept.job_position = structure
                deptResults.push(dept)
            }
        }
    }

    config.response(res, deptResults, config.httpStatus.success, req.__('system.success'));

}

async function detailDepartment(req, res) {
    let id = req.params['id'];

    if (id) {
        db.db.Departments.findOne(
            {
                where: {
                    id: id
                },
                raw: true
            }).then(result => {
                if (!result) {
                    config.response(res, null, config.httpStatus.badRequest, req.__('system.error'));
                    return;
                }

                config.response(res, result, config.httpStatus.success, req.__('system.success'));
            })
            .catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('system.error'));
            });
    } else {
        config.response(res, null, config.httpStatus.badRequest, req.__('system.error'));
    }

}

async function create(req, res) {
    let body = req.body;
    body.is_active = config.active.true;
    config.audit(body, req, false);

    let id = await db.getNextSequence(config.sequence.core_departments_id_seq);
    body.id = id;
    body.dep_code = config.prefix_system_code.core_departments + id;
    body.system_code = config.prefix_system_code.core_departments + id;

    db.db.Departments.create(body).then(result => {
        config.response(res, result, config.httpStatus.success, req.__('department.created.success'));
    }).catch(error => {
        config.logError(error, req);
        config.response(res, error, config.httpStatus.badRequest, req.__('department.created.fail'));
    });
}

function update(req, res) {
    var body = req.body;
    let id = req.params['id'];

    if (id) {
        db.db.Departments.findOne(
            {
                where: {
                    id: id
                },
                raw: true
            }).then(result => {
                if (!result) {
                    config.response(res, null, config.httpStatus.badRequest, req.__('department.update.not_found'));
                    return;
                }
                const tempDepname = result.dep_name
                result.dep_name = body.dep_name;
                result.level = body.level;
                result.parent_id = body.parent_id;
                result.cost_center = body.cost_center;
                result.dept_type = body.dept_type;
                result.effective_date = body.effective_date;
                result.expired_date = body.expired_date;
                result.path = body.path;
                config.audit(result, req, true);
                db.db.Departments.update(result,
                    {
                        where: { id: id },
                    })
                    .then(async (updated) => {
                        let listDepartments = await departmentRepo.findAllByDepName(tempDepname);
                        if (listDepartments && listDepartments.length && tempDepname !== body.dep_name) {
                            for (let dept of listDepartments) {
                                const id = dept.id;
                                const splitArr = dept.path.split('/');
                                if (splitArr.length) {
                                    const index = splitArr.findIndex(item => item === tempDepname);
                                    if (index !== -1) {
                                        splitArr[index] = body.dep_name
                                    };
                                }
                                const newPath = splitArr.join('/');
                                const newDept = await departmentRepo.updatePathDept(id, newPath);
                            }
                        }
                        config.response(res, result, config.httpStatus.success, req.__('department.update.success'));
                    }).catch(error => {
                        config.response(res, error, config.httpStatus.badRequest, req.__('department.update.fail'));
                    });
            })
            .catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('department.update.fail'));
            });
    } else {
        config.response(res, null, config.httpStatus.badRequest, req.__('department.update.fail'));
    }
}

async function deleteStructure(req, res) {
    let body = req.body
    let ids = body.ids

    if (ids && ids.length === 1) {
        let idsDelete = [];
        let departments = await organizationalStructureRepo.findTreeDepartmentChildByDeptId(ids[0]);

        for (let dept of departments) {
            idsDelete = idsDelete.concat(dept.id)
        }

        db.db.Departments.update({
            updated_time: now(),
            updated_by: req.user.email.email,
            is_active: config.active.false
        }, {
            where: { id: idsDelete }
        }).then(updated => {
            config.response(res, updated, config.httpStatus.success, req.__('department.delete.success'));
        }).catch(error => {
            config.response(res, error, config.httpStatus.success, req.__('department.delete.fail'));
        })
    } else {
        config.response(res, null, config.httpStatus.success, req.__('department.delete.fail'));
    }
}

async function renderPath(req, res) {
    let body = req.body;

    const paths = await departmentRepo.findTreeDepartmentByDeptd(body.dept_id);

    if (paths && paths.length > 0) {
        paths.sort((a, b) => a.level - b.level)
        let pathUrl = '';
        for (let path of paths) {
            pathUrl += path.dep_name + '/';
        }

        config.response(res, pathUrl, config.httpStatus.success, req.__('system.success'));
    } else {
        config.response(res, pathUrl, config.httpStatus.badRequest, req.__('system.error'));
    }
}


module.exports = {
    findAll: findAll,
    detailDepartment: detailDepartment,
    create: create,
    update: update,
    deleteStructure: deleteStructure,
    renderPath: renderPath
}
