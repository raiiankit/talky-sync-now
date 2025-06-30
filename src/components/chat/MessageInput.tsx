
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Image } from 'lucide-react';
import { MediaUpload } from './MediaUpload';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  onSendMedia: (file: File, preview: string) => void;
  onTyping: () => void;
  isConnected?: boolean;
}

export const MessageInput = ({ onSendMessage, onSendMedia, onTyping, isConnected = false }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleMediaSelect = async (file: File, preview: string) => {
    setIsUploading(true);
    try {
      await onSendMedia(file, preview);
      setShowMediaUpload(false);
    } finally {
      setIsUploading(false);
    }
  };

  if (showMediaUpload) {
    return (
      <MediaUpload
        onMediaSelect={handleMediaSelect}
        onCancel={() => setShowMediaUpload(false)}
        isUploading={isUploading}
      />
    );
  }

  return (
    <div className="p-4 bg-white/5 backdrop-blur-sm border-t border-white/20">
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Button
          type="button"
          onClick={() => setShowMediaUpload(true)}
          size="sm"
          variant="outline"
          className="text-white border-white/20 hover:bg-white/10"
        >
          <Image className="w-4 h-4" />
        </Button>
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
