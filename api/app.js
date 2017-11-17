// DEPENDENCIES
require('dotenv').config();

var express = require('express');
var cors = require('cors')
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var map = require('./config/properties.js');

var mongoose = require('mongoose');

var apiController = require('./controller/chatbot');

var api = require('./routes/api');
var users = require('./routes/users');
var webhooks = require('./routes/webhooks');
var notifications = require('./routes/notifications')

var app = express();

app.use(cors())

// MongoDB database
// mongoose.connect('mongodb://localhost/ForgetMeTest');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', express.static('/views'));
app.use('/api', api);
app.use('/users', users);
app.use('/webhook', webhooks);
app.use('/notify', notifications)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;
