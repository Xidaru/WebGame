
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;
const server = app.listen(port);
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST']
  }
});

console.log('Starting the server..')

app.use(cors());

let connectedClients = new Set();
let roomAveilability = new Map();
roomAveilability.set(1,['empty']); // Добовляем одну свободную команту

io.on('connection', (socket) => {

  console.log(`"${socket.id}" joins the server`);
  connectedClients.add(socket.id); // Нового клиента добовляем в таблицу с пользователями
  io.emit('update user list', Array.from(connectedClients)); // Просим каждого пользователя обновить их список

  socket.on('request duel', (senderID, recieverID) => {
    console.log(`"${senderID}" asks "${recieverID}" on a duel`)
    io.to(recieverID).emit('ask duel', senderID);
  });

  socket.on('duel accepted', (senderID, receiverID) => {
    console.log(`Duel between "${senderID}" and "${receiverID}" was accepted`);
    const senderSocket = io.sockets.sockets.get(senderID);
    const receiverSocket = io.sockets.sockets.get(receiverID);
    let last_key;
    for (let [key,value] of roomAveilability) { // Подключаем обоих к первой свободной комнате, если таковых нету, создаём новую
      if (value[0] == 'empty') {
        roomAveilability.set(key,[senderID,receiverID]);
        senderSocket.join(String(key));
        receiverSocket.join(String(key));
        connectedClients.delete(senderID);
        connectedClients.delete(receiverID);
        io.emit('update user list', Array.from(connectedClients));
        console.log(`Players joining room ${key}`);
        console.log(roomAveilability)
        io.to(String(key)).emit('fight')
        return;
      } 
      last_key = key;
    }
    roomAveilability.set(last_key+1,[senderID,receiverID]);
    senderSocket.join(String(last_key+1));
    receiverSocket.join(String(last_key+1));
    connectedClients.delete(senderID);
    connectedClients.delete(receiverID);
    io.emit('update user list', Array.from(connectedClients));
    console.log(`Players joining room ${last_key+1}`);
    console.log(roomAveilability);
    io.to(String(last_key+1)).emit('fight')
  });

  socket.on('disconnect', () => {
    console.log(`"${socket.id}" leaves the server`);
    for (let [key,value] of roomAveilability) {
      if (value.includes(socket.id)) { // Когда человек выходит, мы находим в списке команту в которой он находиться
        value = value.filter(item => item !== socket.id); // Избавляемся от Нашего ID
        const remainingSocket = io.sockets.sockets.get(value[0]);
        roomAveilability.set(key,['empty']); 
        remainingSocket.leave(String(key));
        connectedClients.add(value[0])
        console.log(`"${remainingSocket.id}" was forced to leave room ${key}`)
        console.log(roomAveilability);
      }
    }

    connectedClients.delete(socket.id); 
    io.emit('update user list', Array.from(connectedClients));
  });
});
