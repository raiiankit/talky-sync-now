
import { useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: string;
  username: string;
  text: string;
  timestamp: Date;
}

interface MessageListProps {
  messages: Message[];
  currentUser: string;
}

export const MessageList = ({ messages, currentUser }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-white/50">
          <p className="text-lg">No messages yet</p>
          <p className="text-sm">Be the first to start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwnMessage = message.username === currentUser;
        
        return (
          <div
            key={message.id}
            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} space-x-2`}>
              {!isOwnMessage && (
                <Avatar className="w-8 h-8 mt-1">
                  <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                    {message.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div className={isOwnMessage ? 'mr-2' : 'ml-2'}>
                {!isOwnMessage && (
                  <p className="text-xs text-white/70 mb-1 px-1">
                    {message.username}
                  </p>
                )}
                
                <div
                  className={`p-3 rounded-lg ${
                    isOwnMessage
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                      : 'bg-white/10 backdrop-blur-sm text-white border border-white/20'
                  }`}
                >
                  <p className="text-sm break-words">{message.text}</p>
                  <p className={`text-xs mt-1 ${
                    isOwnMessage ? 'text-white/80' : 'text-white/60'
                  }`}>
                    {format(message.timestamp, 'HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};
