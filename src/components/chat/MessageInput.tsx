
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onTyping: () => void;
  isConnected?: boolean;
}

export const MessageInput = ({ onSendMessage, onTyping, isConnected = false }: MessageInputProps) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    onTyping();
  };

  return (
    <div className="p-4 bg-white/5 backdrop-blur-sm border-t border-white/20">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          type="text"
          placeholder={isConnected ? "Type a message..." : "Type a message... (Demo mode - start backend server)"}
          value={message}
          onChange={handleInputChange}
          className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-purple-400"
          maxLength={500}
        />
        <Button
          type="submit"
          size="sm"
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-4"
          disabled={!message.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
