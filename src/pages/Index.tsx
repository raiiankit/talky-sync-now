
import { useState } from 'react';
import { JoinForm } from '@/components/chat/JoinForm';
import { ChatRoom } from '@/components/chat/ChatRoom';

const Index = () => {
  const [username, setUsername] = useState<string>('');
  const [hasJoined, setHasJoined] = useState(false);

  const handleJoin = (name: string) => {
    setUsername(name);
    setHasJoined(true);
  };

  const handleLeave = () => {
    setUsername('');
    setHasJoined(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {!hasJoined ? (
        <JoinForm onJoin={handleJoin} />
      ) : (
        <ChatRoom username={username} onLeave={handleLeave} />
      )}
    </div>
  );
};

export default Index;
