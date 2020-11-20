var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
// var fileupload = require('express-fileupload');
const multer = require('multer')
const session = require('express-session');
const winston = require('winston');
const { LoggingWinston } = require('@google-cloud/logging-winston');
const MongoStore = require('connect-mongo')(session);
const cors = require('cors');
var flash = require('connect-flash');
var expressValidator = require('express-validator');
var expressLayouts = require('express-ejs-layouts');

const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    checkFileIsImage(file, cb);
  }
})
function checkFileIsImage(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}
const loggingWinston = new LoggingWinston();

const winstonLogger = winston.createLogger({
  level: 'info',
  transports: [
    new winston.transports.Console(),
    // Add Stackdriver Logging
    loggingWinston,
  ],
});
var app = express();
require('dotenv').config();
app.use(multerMid.single('single_image'))

app.use(expressValidator());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use(fileupload({
//   useTempFiles:true
// }));
// app.use(express.static(__dirname + 'public'));
app.use('/public', express.static(__dirname + '/public'));
app.use('/media', express.static(__dirname + '/media'));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(cors());
app.use(flash());
require('./configs/mongo.config');

app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { expires: new Date(253402300000000) },
  store: new MongoStore({
    url: process.env.ENVIRONMENT !== 'dev' ? process.env.MONGODB_URI : process.env.MONGODB_LOCAL,
    autoReconnect: true,
  })
}));
//db setup
require('./routes')(app);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
app.get('/winston-error', (req, res) => {
  winstonLogger.error('Winston error logged');
  res.send('Winston error logged!');
})
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  console.log(err);
  res.render('error');
});

module.exports = app;
