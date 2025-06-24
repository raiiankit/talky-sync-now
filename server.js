const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: "https://talk-sync.netlify.app/", // Your React app URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

let messages = [];
let onlineUsers = new Map();
let typingUsers = new Set();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', ({ username }) => {
    onlineUsers.set(socket.id, username);
    socket.emit('message_history', messages);
    io.emit('user_joined', {
      username,
      onlineUsers: Array.from(onlineUsers.values())
    });
    console.log(`${username} joined the chat`);
  });

  socket.on('message', (messageData) => {
    const message = {
      id: Date.now().toString(),
      username: messageData.username,
      text: messageData.text,
      timestamp: new Date()
    };
    messages.push(message);
    io.emit('new_message', message);
    console.log('New message:', message);
  });

  socket.on('typing', ({ username }) => {
    typingUsers.add(username);
    socket.broadcast.emit('user_typing', {
      username,
      typingUsers: Array.from(typingUsers)
    });
  });

  socket.on('stop_typing', ({ username }) => {
    typingUsers.delete(username);
    socket.broadcast.emit('user_stop_typing', {
      username,
      typingUsers: Array.from(typingUsers)
    });
  });

  socket.on('disconnect', () => {
    const username = onlineUsers.get(socket.id);
    if (username) {
      onlineUsers.delete(socket.id);
      typingUsers.delete(username);
      io.emit('user_left', {
        username,
        onlineUsers: Array.from(onlineUsers.values())
      });
      console.log(`${username} left the chat`);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
});
