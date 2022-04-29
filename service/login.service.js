const db = require("../config/database-config");
const Login = db.db.Login;
var jwtUtils = require('../middleware/jwt-utils');
var userCustom = require('../model/repositories/login.custom');
var bcrypt = require('bcryptjs');
var config = require('../config')

module.exports.findAll = function (req, res) {
    Login.findAll()
    .then(result => {
        res.json(result);
    })
    .catch(err => {
        res.status(500).send({
            message:
                err.message
        });
    });
}

module.exports.login = function(req, res) {
    var body = req.body;

    userCustom.findByUsername(body.email).then(result => {
        if(result.length !== 0) {
            console.log(result[0]);
            var user = result[0];
            // if (!bcrypt.compareSync(body.password, user.password))
            // {
            //     res.statusCode = 401;
            //     res.json({
            //         message: req.__('login.fail'),
            //         status: config.httpStatus.badRequest
            //     });
            //     return;
            // }
            var userReturn = {
                email: user.email
            }
            res.json({
                data: jwtUtils.generateAccessToken(userReturn),
                messages: req.__('login.success'),
                status: config.httpStatus.success
            });
        } else {
            config.response(res, null, config.httpStatus.badRequest, req.__('login.fail'));
        }

    }).catch(error => {
        console.error(error);
    })


}
