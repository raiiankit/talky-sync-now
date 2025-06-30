
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Message {
  id: string;
  username: string;
  text?: string;
  image?: string;
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export const MessageBubble = ({ message, isOwnMessage }: MessageBubbleProps) => {
  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
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
            {message.image && (
              <div className="mb-2">
                <img
                  src={message.image}
                  alt="Shared image"
                  className="max-w-full h-auto rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(message.image, '_blank')}
                />
              </div>
            )}
            
            {message.text && (
              <p className="text-sm break-words">{message.text}</p>
            )}
            
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
};
