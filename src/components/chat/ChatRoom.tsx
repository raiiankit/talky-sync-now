
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
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  useEffect(() => {
    // For demo purposes, we'll simulate a Socket.IO connection
    // In a real app, this would connect to your backend server
    const newSocket = io('http://localhost:3001', {
      autoConnect: false
    });

    // Simulate connection for demo
    const simulatedSocket = {
      emit: (event: string, data?: any) => {
        console.log('Emit:', event, data);
        // Simulate server responses
        if (event === 'join') {
          setTimeout(() => {
            setOnlineUsers(prev => [...prev, username]);
            toast({
              title: "Connected",
              description: "You've joined the chat!",
            });
          }, 100);
        }
      },
      on: (event: string, callback: Function) => {
        console.log('Listening for:', event);
      },
      disconnect: () => {
        console.log('Disconnected');
      }
    } as any;

    setSocket(simulatedSocket);

    // Simulate joining
    simulatedSocket.emit('join', { username });

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      simulatedSocket.disconnect();
    };
  }, [username, toast]);

  const sendMessage = (text: string) => {
    if (socket && text.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        username,
        text: text.trim(),
        timestamp: new Date()
      };
      
      // Add message locally for demo
      setMessages(prev => [...prev, message]);
      
      // In real app: socket.emit('message', message);
      console.log('Sending message:', message);
    }
  };

  const handleTyping = () => {
    if (socket) {
      // In real app: socket.emit('typing', { username });
      console.log('User typing:', username);
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        // In real app: socket.emit('stop_typing', { username });
        console.log('User stopped typing:', username);
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
      />
      
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          <MessageList messages={messages} currentUser={username} />
          <TypingIndicator typingUsers={typingUsers.filter(user => user !== username)} />
          <MessageInput onSendMessage={sendMessage} onTyping={handleTyping} />
        </div>
        
        <div className="hidden lg:block">
          <OnlineUsers users={onlineUsers} />
        </div>
      </div>
    </div>
  );
};
