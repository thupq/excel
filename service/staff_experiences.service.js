
const db = require("../config/database-config");
let staffExperiences = require('../model/repositories/staff_experiences.custom');
let config = require('../config');
const {now} = require("moment");


function findAll(req, res) {
    const searchObj = {
        staff_id: req.query['staff_id'],
        page: req.query['page'],
        size: req.query['size']
    }

    staffExperiences.findStaffExperiences(searchObj)
        .then(result => {
            config.response(res, result, config.httpStatus.success, req.__('system.success'));
        })
        .catch(error => {
            config.response(res, error, config.httpStatus.badRequest, req.__('system.error'));
        });

}

async function create(req, res) {
    var body = req.body;
    body.is_active = config.active.true;
    let id = await db.getNextSequence(config.sequence.staff_experiences_id_seq);
    body.id = id;
    body.system_code = config.prefix_system_code.experiences + id;
    config.audit(body, req, false);

    // TODO tìm nhân viên để tạo
    db.db.StaffExperiences.create(body).then(result => {
        config.response(res, result, config.httpStatus.success, req.__('staff_experiences.created.success'));
    }).catch(error => {
        config.logError(error, req);
        config.response(res, error, config.httpStatus.badRequest, req.__('staff_experiences.created.failed'));
    });
}

function update(req, res) {
    var body = req.body;
    let id = req.params['id'];

    if(id) {
        body.id = id;
        db.db.StaffExperiences.findOne(
            {
                where: {
                    id: body.id
                },
                raw: true
            }).then(result => {
            if (!result) {
                config.response(res, null, config.httpStatus.badRequest, req.__('staff_experiences.update.not_found'));
                return;
            }
            result.start_date = body.start_date;
            result.end_date = body.end_date;
            result.company = body.company;
            result.position = body.position;
            config.audit(result, req, true);
            db.db.StaffExperiences.update(result,
                {
                    where: { id: body.id },
                })
            .then(updated => {
                config.response(res, result, config.httpStatus.success, req.__('staff_experiences.update.success'));
            }).catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('staff_experiences.update.fail'));
            });
        })
        .catch(error => {
            config.response(res, error, config.httpStatus.badRequest, req.__('staff_experiences.update.fail'));
        });
    } else {
        config.response(res, error, config.httpStatus.badRequest, req.__('staff_experiences.update.fail'));
    }
}

function deleteExperience(req, res) {
    let id = req.params['id'];


    db.db.StaffExperiences.update({
        updated_time: now(),
        updated_by: req.user.email.email,
        is_active: config.active.false
    }, {
        where : {id: id}
    }).then(updated => {
        config.response(res, updated, config.httpStatus.success, req.__('staff_experiences.delete.success'));
    }).catch(error => {
        config.logError(error, req);
        config.response(res, error, config.httpStatus.success, req.__('staff_experiences.delete.fail'));
    })


}

module.exports = {
    findAll: findAll,
    create: create,
    update: update,
    deleteExperience: deleteExperience,
}
