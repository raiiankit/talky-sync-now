
import { Button } from '@/components/ui/button';
import { Users, LogOut, MessageCircle, Wifi, WifiOff } from 'lucide-react';

interface ChatHeaderProps {
  onlineCount: number;
  onLeave: () => void;
  isConnected?: boolean;
}

export const ChatHeader = ({ onlineCount, onLeave, isConnected = false }: ChatHeaderProps) => {
  return (
    <header className="bg-white/10 backdrop-blur-lg border-b border-white/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">Chat Room</h1>
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
            </div>
            <div className="flex items-center space-x-1 text-sm text-white/70">
              <Users className="w-4 h-4" />
              <span>{onlineCount} online</span>
              {!isConnected && (
                <span className="text-red-400 ml-2">(Demo Mode)</span>
              )}
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onLeave}
          className="text-white hover:bg-white/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Leave
        </Button>
      </div>
    </header>
  );
};
