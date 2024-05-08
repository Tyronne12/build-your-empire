const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const session = require('express-session');
const http = require('http').Server(app); 
const io = require('socket.io')(http); 

const loggedinUsers = [];
const loggedBlocks = [];

app.use(session({
  secret: 'keyboardkitteh',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/static', express.static(__dirname + '/static'));
app.set('view engine', 'ejs');
app.get('/', function (req, res){
    res.render('index', { 
        title: "My Express project",
       
    });
});

io.on('connection', function (socket) {
    console.log('Client connected.');
    socket.on('newUser', function(name) {
        console.log('name:', name);
        loggedinUsers.push(name);
        socket.username = name;
        socket.emit('loggedUsers', loggedinUsers);
        socket.broadcast.emit('lognewUser', name);
    });

    socket.on('createBlock', function(data) {
        loggedBlocks.push(data);
        console.log(loggedBlocks)
        io.emit('drawBlock', data);
    });

    socket.on('clear', function() {
        io.emit('clearContent');
    });
});


http.listen(8080, function() {
    console.log("Server is listening on port 8080");
});
