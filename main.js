var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser')
const { I18n } = require('i18n');
var cors = require('cors');
const {now} = require("moment");

//declare locales folder
const i18n = new I18n({
  locales: ['en', 'vi'],
  directory: path.join(__dirname, 'locales'),
  defaultLocale: 'vi'
})

var app = express();

//register cors
app.use(cors());
app.use(logger('dev'));
//register body parser, help convert body to json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(i18n.init);


app.use(function (req, res, next) {
  i18n.init(req, res);
  req.locale = 'vi';
  req.currentTime = now();
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, total, totalError, X-Total-Count");
  res.header("Access-Control-Expose-Headers", "Origin, X-Requested-With, Content-Type, Accept, total, totalError, X-Total-Count");
  next();
});

require("./routes/routes")(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.status(err.status || 500);
  res.send(err.message);

});


var server = app.listen(process.env.PORT || 8086, () => {
  console.log('Server is started on 127.0.0.1:'+ (process.env.PORT || 8086))
})
module.exports = app;
