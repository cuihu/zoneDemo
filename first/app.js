var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var connect = require('connect');
var multer = require('multer');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var settings = require('./settings') ;
var methodOverride = require('method-override');
var index = require('./routes/index');
var users = require('./routes/users');
var routes = require('./routes/index'); 
//var expressLayouts = require('express-ejs-layouts');
var partials = require('express-partials');
var util = require('util') ;
var flash = require('connect-flash') ;
var app = express();
var server= require('http').createServer(app) ;
var sio = require('socket.io')(server);
app.set('port', process.env.PORT || 3000)
// view engine setup
app.use(express.static(path.join(__dirname, 'public')));
/*
io = sio.listen(server) ;
io.sockets.on('connection',function(socket){
	console.log('Someone connected') ;
})
*/
app.set('view engine', 'ejs');
app.use(partials()) ;
app.set('views', path.join(__dirname, 'views'));

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(expressLayouts);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(bodyParser());
//app.use(methodOverride());
app.use(flash()) ;
var sessionMiddleware =session({
	secret: settings.cookieSecret,
	store: new MongoStore({
		host:'127.0.0.1',
		port :'27017',
		url:'mongodb://localhost:27017/zonedb',
		db:  settings.db
	})
});
app.use(sessionMiddleware);
var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./Images");
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }
});
app.locals.appname = 'zone' ;
app.use(function(req,res,next){
	console.log("app.use local") ;
	res.locals.user = req.session.user ;
	res.locals.sents = req.session.sents ;
	var error = req.flash('error') ;
	res.locals.error = error.length ? error :null ;
	var success = req.flash('success') ;
	res.locals.success = success.length?success:null ;
	next();
});
routes(app) ;
//app.use('/', index);
//app.use('/users', users);
server.listen(app.get('port'), function(){
	console.log('express server listening on port ' + app.get('port')) ;
});

sio.use(function(socket, next){
  sessionMiddleware(socket.request, socket.request.res,next);
});
//Console.log(something happening);
	sio.on('connection',function(socket){
	socket.on('test',function(data){
		console.log(data);
		console.log(socket.request.session.username);
	});
	socket.on('log',function(data){
		var user = JSON.parse(data);
		socket.request.session.username = user.username ;
	});
	socket.on('newsadd',function(data){
		socket.broadcast.emit('pageNewsAdd',null);
	})
})


/*
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
*/
