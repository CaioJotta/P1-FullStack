require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const connectMongoDB = require('./src/config/mongo.js');
const authRoutes = require("./src/routes/UserRoutes");
const roomRoutes = require('./src/routes/roomRoutes');
const Room = require('./src/models/Room');
const server = http.createServer(app);
const socketio = require('socket.io'); 
const io = socketio(server);
const path = require('path');
const jwt = require('jsonwebtoken');


connectMongoDB();

app.use(express.static(path.join(__dirname, './public'))); 
app.use(express.json()); 


app.get('/', (req, res) => {
    res.send('<h1>Server teste<h1/>');
});


io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Autenticação via token necessária'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId; 
    next();
  } catch (err) {
    next(new Error('Token inválido'));
  }
});


io.on('connection', (socket) => {
  console.log('Novo usuário conectado!');

  
  socket.on('joinRoom', (roomName) => {
    socket.join(roomName);
    console.log(`Usuário entrou na sala: ${roomName}`);
    socket.emit('receiveMessage', `Você entrou na sala: ${roomName}`);
  });

 
  socket.on('sendMessage', (message) => {
    const room = Array.from(socket.rooms)[1];  
    if (room) {
      io.to(room).emit('receiveMessage', message);  
    }
  });

  
  socket.on('disconnect', () => {
    console.log('Usuário desconectado');
  });
});


app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
