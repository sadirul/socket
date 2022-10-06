const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
  cors : {
    origin : ['http://127.0.0.1', 'http://192.168.0.196:8080', 'http://localhost:8080', 'http://127.0.0.2:8080']
  }
});
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

var users = {};
io.on('connection', (socket) => {

console.log(socket.id)
// io.emit('message', 'jahurul->get for server');
// var name = socket.id;
socket.on('new-user-joined', (name) => {
  users[socket.id] = name;
  socket.broadcast.emit('user_joined', name, users);
  socket.emit('get-connected-users', users);
});


socket.on('message', (message, globalPerson) => {
  // console.log(globalPerson)
  if(globalPerson == '' || globalPerson == undefined){
    socket.broadcast.emit('client_message', {name : users[socket.id], message : message});
  }else{
    socket.broadcast.to(globalPerson).emit('client_message', {name : users[socket.id], message : message});
  }
});


socket.on("is-typing", (text)=>{
  socket.broadcast.emit('client-is-typing', {name : users[socket.id], text : text});
});

socket.on("brightness", (value)=>{
  console.log(value)
  socket.broadcast.emit('client_brightness', value);
});

socket.on("mousemove", (value)=>{
  socket.broadcast.emit('client_mousemove', value);
});

socket.on("click_window", ()=>{
  socket.broadcast.emit('client_click_window');
});

socket.on("dblclick_window", ()=>{
  socket.broadcast.emit('client_dblclick_window');
});

socket.on("get_screenshot", ()=>{
  socket.broadcast.emit('client_get_screenshot');
});

socket.on("stop_screenshot", ()=>{
  socket.broadcast.emit('client_stop_screenshot');
});




socket.on("got_screenshot", (data)=>{
  socket.broadcast.emit('client_got_screenshot', data);
});




socket.on('disconnect', () => {
  var socket_id = socket.id;
  socket.broadcast.emit("client_disconnected", users[socket.id]);
  delete users[socket.id];
  socket.broadcast.emit('get-connected-users', users, socket_id);
});


});

http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
