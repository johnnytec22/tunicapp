var express = require('express');
var path = require('path');
var async = require('async');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');
var fileUpload = require('express-fileupload');
var expressValidator = require('express-validator');
var app = express();



//bringing in our routes files
var technician = require('./routes/technician');
var user = require('./routes/user');
var session_config = require('./config/session');
var admin = require('./routes/admin');
var tekers = require('./routes/tekers');
var admins = require('./routes/admins');
var admin_users = require('./routes/admin_users');


//connecting to mongodb
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://johnnytec22:neme@ds151752.mlab.com:51752/tunicapp');
var db = mongoose.connection;
db.on('open', function() {
	console.log('We are connected to mongoDB');
});
db.on('error', function(err) {
	console.log('an error occured, could not connect to mongodb');
});


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


//handles uploading of files and saving them
app.use(fileUpload());
//bodyParser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//store for our static files
app.use(express.static('public'));
//using our session file
app.use(session_config);
//middleware for flash errors and success messages to the client
app.use(flash());
app.use(function(req, res, next){
    res.locals.success = req.flash('success');
    res.locals.errors = req.flash('error');
    next();
});

//EXPRESS VALIDATOR middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


//HOME PAGE ROUTE
app.get('/', function(req, res) {
  res.render('index.jade');
})

app.use('/technicians',  technician);
app.use('/user', user);
app.use('/users', admin_users);
app.use('/admin', admin);
app.use('/tekers', tekers);
app.use('/admins', admins);


//RUNNING OUT SERVER
var PORT = process.env.PORT || 8080;
app.listen(PORT, function() {
  console.log("Server running at Port "+PORT);
});
