// Setup basic express server
var express = require('express');
var app = express();
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var cookieParser = require('cookie-parser');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var settings = require('./settings') ;
server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// Routing
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
//app.use(bodyParser());
//app.use(methodOverride());
var sessionMiddleware = session({
  secret: settings.cookieSecret,
  store: new MongoStore({
    host:'127.0.0.1',
    port :'27017',
    url:'mongodb://localhost:27017/zonedb',
    db:  settings.db
  })
});
app.use(sessionMiddleware) ;
io.use(function(socket, next){
  sessionMiddleware(socket.request, socket.request.res,next);
});
// Chatroom
var numUsers = 0;
var num = 0 ;
io.on('connection', function (socket) {
  var addedUser = false;
  
  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
    //socket.request.session.userdata[num] = data ;
    console.log(socket.request.session.username) ;
    //console.log(socket.request.session.userdata) ;
    num++;
    console.log(num) ;
  });

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username) {
    if (addedUser) return;

    // we store the username in the socket session for this client
    socket.username = username;
    socket.request.session.username = username ;
    ++numUsers;
    addedUser = true;
    socket.emit('login', {
      numUsers: numUsers
    });
    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers
    });
  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    if (addedUser) {
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});
