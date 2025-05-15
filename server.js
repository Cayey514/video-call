const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  socket.on('join', room => {
    socket.join(room);
    socket.to(room).emit('ready');
    
    socket.on('offer', data => socket.to(room).emit('offer', data));
    socket.on('answer', data => socket.to(room).emit('answer', data));
    socket.on('candidate', data => socket.to(room).emit('candidate', data));
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
