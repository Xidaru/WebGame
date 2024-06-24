
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

io.on('connection', (socket) => {

  console.log(`"${socket.id}" joins the server`);
  connectedClients.add(socket.id); // Нового клиента добовляем в таблицу с пользователями
  io.emit('update user list', Array.from(connectedClients)); // Просим каждого пользователя обновить их список

  socket.on('request duel', (senderID, recieverID) => {
    console.log(`"${senderID}" asks "${recieverID}" on a duel`)
    io.to(recieverID).emit('ask duel', senderID);
  });

  socket.on('duel accepted', (senderID, recieverID) => {
    console.log(`Duel was accepted`);
  })

  socket.on('disconnect', () => {
    console.log(`"${socket.id}" leaves the server`);
    connectedClients.delete(socket.id); 
    io.emit('update user list', Array.from(connectedClients));
  });
});

