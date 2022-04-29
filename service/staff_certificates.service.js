
const db = require("../config/database-config");
let staffCertificates = require('../model/repositories/staff_certificates.custom');
let config = require('../config');
const {now} = require("moment");


function findAll(req, res) {
    const searchObj = {
        staff_id: req.query['staff_id'],
        page: req.query['page'],
        size: req.query['size']
    }

    staffCertificates.findStaffCertificates(searchObj)
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
    config.audit(body, req, false);
    let id = await db.getNextSequence(config.sequence.staff_certificates_id_seq);
    body.id = id;
    body.system_code = config.prefix_system_code.certificate + id;

    // TODO tìm nhân viên để tạo
    db.db.StaffCertificates.create(body).then(result => {
        config.response(res, result, config.httpStatus.success, req.__('staff_certificates.created.success'));
    }).catch(error => {
        config.logError(error, req);
        config.response(res, error, config.httpStatus.badRequest, req.__('staff_certificates.created.failed'));
    });
}

function update(req, res) {
    var body = req.body;
    let id = req.params['id'];

    if(id) {
        body.id = id;
        db.db.StaffCertificates.findOne(
            {
                where: {
                    id: body.id
                },
                raw: true
            }).then(result => {
            if (!result) {
                config.response(res, null, config.httpStatus.badRequest, req.__('staff_certificates.update.not_found'));
                return;
            }
            result.training_place = body.training_place ? body.training_place : null;
            result.major = body.major ? body.major : null;
            result.specialist = body.specialist ? body.specialist : null;
            result.classification = body.classification ? body.classification : null;
            result.graduation_date = body.graduation_date ? body.graduation_date : null;
            result.certificate = body.certificate ? body.certificate : null;
            result.date_of_issue = body.date_of_issue ? body.date_of_issue : null;
            result.expired_date = body.expired_date ? body.expired_date : null;
            config.audit(result, req, true);
            db.db.StaffCertificates.update(result,
                {
                    where: { id: body.id },
                })
            .then(updated => {
                config.response(res, result, config.httpStatus.success, req.__('staff_certificates.update.success'));
            }).catch(error => {
                config.response(res, error, config.httpStatus.badRequest, req.__('staff_certificates.update.fail'));
            });
        })
        .catch(error => {
            config.response(res, error, config.httpStatus.badRequest, req.__('staff_certificates.update.fail'));
        });
    } else {
        config.response(res, error, config.httpStatus.badRequest, req.__('staff_certificates.update.fail'));
    }
}

function deleteCertificate(req, res) {
    let id = req.params['id'];

    db.db.StaffCertificates.update({
        updated_time: now(),
        updated_by: req.user.email.email,
        is_active: config.active.false
    }, {
        where : {id: id}
    }).then(updated => {
        config.response(res, updated, config.httpStatus.success, req.__('staff_certificates.delete.success'));
    }).catch(error => {
        config.logError(error, req);
        config.response(res, error, config.httpStatus.success, req.__('staff_certificates.delete.fail'));
    })


}

module.exports = {
    findAll: findAll,
    create: create,
    update: update,
    deleteCertificate: deleteCertificate,
}
