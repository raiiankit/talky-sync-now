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
  text?: string;
  image?: string;
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
    console.log('Attempting to connect to Socket.IO server...');
    
    // Connect to Socket.IO server
    const newSocket = io('http://localhost:3001', {
      timeout: 5000,
      forceNew: true
    });

    newSocket.on('connect', () => {
      console.log('Successfully connected to server with ID:', newSocket.id);
      setIsConnected(true);
      setSocket(newSocket);
      
      // Join the chat
      newSocket.emit('join', { username });
      
      toast({
        title: "Connected",
        description: "You've joined the chat!",
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // Listen for message history (when joining)
    newSocket.on('message_history', (history: Message[]) => {
      console.log('Received message history:', history);
      setMessages(history.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      })));
    });

    // Listen for new messages
    newSocket.on('new_message', (message: Message) => {
      console.log('Received new message:', message);
      setMessages(prev => [...prev, {
        ...message,
        timestamp: new Date(message.timestamp)
      }]);
    });

    // Listen for user events
    newSocket.on('user_joined', ({ username: joinedUser, onlineUsers: users }) => {
      console.log('User joined:', joinedUser, 'Online users:', users);
      setOnlineUsers(users);
      if (joinedUser !== username) {
        toast({
          title: "User joined",
          description: `${joinedUser} joined the chat`,
        });
      }
    });

    newSocket.on('user_left', ({ username: leftUser, onlineUsers: users }) => {
      console.log('User left:', leftUser, 'Online users:', users);
      setOnlineUsers(users);
      toast({
        title: "User left",
        description: `${leftUser} left the chat`,
        variant: "destructive"
      });
    });

    // Listen for typing events
    newSocket.on('user_typing', ({ username: typingUser, typingUsers: users }) => {
      console.log('User typing:', typingUser, 'All typing:', users);
      setTypingUsers(users);
    });

    newSocket.on('user_stop_typing', ({ username: typingUser, typingUsers: users }) => {
      console.log('User stopped typing:', typingUser, 'All typing:', users);
      setTypingUsers(users);
    });

    // Handle connection errors - wait a bit before falling back to demo mode
    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      
      // Only show error and fall back to demo mode after a brief delay
      setTimeout(() => {
        if (!newSocket.connected) {
          console.log('Falling back to demo mode');
          setIsConnected(false);
          setOnlineUsers([username]);
          
          toast({
            title: "Demo Mode",
            description: "Cannot connect to server. Running in demo mode - start the backend server for real-time chat.",
            variant: "destructive"
          });
        }
      }, 2000);
    });

    return () => {
      console.log('Cleaning up socket connection');
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      newSocket.disconnect();
    };
  }, [username, toast]);

  const sendMessage = (text: string) => {
    if (text.trim()) {
      if (socket && isConnected) {
        console.log('Sending message via socket:', text);
        socket.emit('message', {
          username,
          text: text.trim()
        });
      } else {
        console.log('Sending message in demo mode:', text);
        const message: Message = {
          id: Date.now().toString(),
          username,
          text: text.trim(),
          timestamp: new Date()
        };
        setMessages(prev => [...prev, message]);
      }
    }
  };

  const sendMedia = async (file: File, preview: string) => {
    if (socket && isConnected) {
      console.log('Sending media via socket:', file.name);
      // In a real app, you'd upload to a file storage service first
      // For demo, we'll just use the preview
      socket.emit('message', {
        username,
        image: preview,
        text: `📷 ${file.name}`
      });
    } else {
      console.log('Sending media in demo mode:', file.name);
      const message: Message = {
        id: Date.now().toString(),
        username,
        image: preview,
        text: `📷 ${file.name}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, message]);
    }
  };

  const handleTyping = () => {
    if (socket && isConnected) {
      console.log('Emitting typing event');
      socket.emit('typing', { username });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        console.log('Emitting stop typing event');
        socket.emit('stop_typing', { username });
      }, 1000);
    }
  };

  const handleLeave = () => {
    console.log('User leaving chat');
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
            onSendMedia={sendMedia}
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
