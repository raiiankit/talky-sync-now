
# Chat Server Setup

This React chat application is designed to work with a Socket.IO backend server. Below are the instructions to set up the complete full-stack application.

## Backend Server (Node.js + Express + Socket.IO)

Create a new directory for your backend server and set up the following files:

### 1. package.json
```json
{
  "name": "chat-server",
  "version": "1.0.0",
  "description": "Real-time chat server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

### 2. server.js
```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:8080", // Your React app URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors());
app.use(express.json());

// In-memory storage (use MongoDB for persistence)
let messages = [];
let onlineUsers = new Map(); // socketId -> username
let typingUsers = new Set();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining
  socket.on('join', ({ username }) => {
    onlineUsers.set(socket.id, username);
    
    // Send existing messages to the new user
    socket.emit('message_history', messages);
    
    // Notify all users about the new user
    io.emit('user_joined', {
      username,
      onlineUsers: Array.from(onlineUsers.values())
    });
    
    console.log(`${username} joined the chat`);
  });

  // Handle new messages
  socket.on('message', (messageData) => {
    const message = {
      id: Date.now().toString(),
      username: messageData.username,
      text: messageData.text,
      timestamp: new Date()
    };
    
    messages.push(message);
    
    // Broadcast the message to all users
    io.emit('new_message', message);
    
    console.log('New message:', message);
  });

  // Handle typing indicators
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

  // Handle disconnection
  socket.on('disconnect', () => {
    const username = onlineUsers.get(socket.id);
    if (username) {
      onlineUsers.delete(socket.id);
      typingUsers.delete(username);
      
      // Notify all users about the user leaving
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
```

## Setup Instructions

1. **Install backend dependencies:**
   ```bash
   mkdir chat-server
   cd chat-server
   npm init -y
   npm install express socket.io cors
   npm install -D nodemon
   ```

2. **Start the backend server:**
   ```bash
   npm run dev
   ```

3. **Update the React app:**
   - The React app is already configured to connect to `http://localhost:3001`
   - Make sure the backend server is running before using the chat

## Features Implemented

### Frontend (React):
- ✅ User join form with name validation
- ✅ Real-time message display with timestamps
- ✅ Typing indicators with animations
- ✅ Online user count and list
- ✅ Responsive design with glassmorphism effects
- ✅ Message input with send functionality
- ✅ Leave chat functionality

### Backend (Node.js):
- ✅ Socket.IO server setup
- ✅ Real-time message broadcasting
- ✅ User join/leave handling
- ✅ Typing indicator management
- ✅ Online user tracking
- ✅ Message history for new users
- ✅ CORS configuration

## Optional Enhancements

To add MongoDB persistence:

```bash
npm install mongoose
```

Then modify the server to use MongoDB for storing messages and user sessions.

To add multiple chat rooms, extend the server to handle room-based Socket.IO namespaces.

## Current Status

The frontend is fully functional and will work perfectly once you set up the backend server following the instructions above. The demo mode shows the UI structure and functionality.
```

Let me update the ChatRoom component to properly integrate with a real Socket.IO server:

<lov-write file_path="src/components/chat/ChatRoom.tsx">
import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { ChatHeader } from './ChatHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { OnlineUsers } from './OnlineUsers';
import { TypingIndicator } from './TypingIndicator';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
}

interface ChatRoomProps {
  username: string;
  onLeave: () => void;
}

export const ChatRoom = ({ username, onLeave }: ChatRoomProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io('http://localhost:3001');

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
      setSocket(newSocket);
      
      // Join the chat
      newSocket.emit('join', { username });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // Listen for message history (when joining)
    newSocket.on('message_history', (history: Message[]) => {
      setMessages(history.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    });

    // Listen for new messages
    newSocket.on('new_message', (message: Message) => {
      setMessages(prev => [...prev, {
        ...message,
        timestamp: new Date(message.timestamp)
      }]);
    });

    // Listen for user events
    newSocket.on('user_joined', ({ username: joinedUser, onlineUsers: users }) => {
      setOnlineUsers(users);
      if (joinedUser !== username) {
        toast({
          title: "User joined",
          description: `${joinedUser} joined the chat`,
        });
      }
    });

    newSocket.on('user_left', ({ username: leftUser, onlineUsers: users }) => {
      setOnlineUsers(users);
      toast({
        title: "User left",
        description: `${leftUser} left the chat`,
        variant: "destructive"
      });
    });

    // Listen for typing events
    newSocket.on('user_typing', ({ username: typingUser, typingUsers: users }) => {
      setTypingUsers(users);
    });

    newSocket.on('user_stop_typing', ({ username: typingUser, typingUsers: users }) => {
      setTypingUsers(users);
    });

    // Handle connection errors
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      toast({
        title: "Connection Error",
        description: "Unable to connect to chat server. Make sure the backend server is running on port 3001.",
        variant: "destructive"
      });
      
      // Fall back to demo mode
      setOnlineUsers([username]);
      setIsConnected(false);
    });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      newSocket.disconnect();
    };
  }, [username, toast]);

  const sendMessage = (text: string) => {
    if (text.trim()) {
      if (socket && isConnected) {
        // Send to server
        socket.emit('message', {
          username,
          text: text.trim()
        });
      } else {
        // Demo mode - add message locally
        const message: Message = {
          id: Date.now().toString(),
          username,
          text: text.trim(),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, message]);
        
        toast({
          title: "Demo Mode",
          description: "Messages are only visible to you. Start the backend server for real-time chat.",
          variant: "destructive"
        });
      }
    }
  };

  const handleTyping = () => {
    if (socket && isConnected) {
      socket.emit('typing', { username });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stop_typing', { username });
      }, 1000);
    }
  };

  const handleLeave = () => {
    if (socket) {
      socket.disconnect();
    }
    onLeave();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ChatHeader 
        onlineCount={onlineUsers.length} 
        onLeave={handleLeave}
        isConnected={isConnected}
      />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <MessageList messages={messages} currentUser={username} />
          <TypingIndicator typingUsers={typingUsers.filter(user => user !== username)} />
          <MessageInput 
            onSendMessage={sendMessage} 
            onTyping={handleTyping}
            isConnected={isConnected}
          />
        </div>
        
        <div className="hidden lg:block">
          <OnlineUsers users={onlineUsers} />
        </div>
      </div>
    </div>
  );
};
