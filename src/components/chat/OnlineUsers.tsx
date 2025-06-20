
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

interface OnlineUsersProps {
  users: string[];
}

export const OnlineUsers = ({ users }: OnlineUsersProps) => {
  return (
    <Card className="w-64 m-4 bg-white/10 backdrop-blur-lg border-white/20 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm">
          <Users className="w-4 h-4" />
          <span>Online ({users.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {users.map((user) => (
          <div key={user} className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                {user.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-white/90">{user}</span>
            <div className="w-2 h-2 bg-green-400 rounded-full ml-auto"></div>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-sm text-white/50">No users online</p>
        )}
      </CardContent>
    </Card>
  );
};
