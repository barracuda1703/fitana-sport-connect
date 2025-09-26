import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { dataStore } from '@/services/DataStore';

interface ChatThread {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

export const ChatListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatThreads, setChatThreads] = useState<ChatThread[]>([]);

  useEffect(() => {
    if (user) {
      // Mock chat threads data
      const threads: ChatThread[] = [
        {
          id: 'chat-u-client1-t-1',
          otherUserId: 't-1',
          otherUserName: 'Anna Kowalska',
          otherUserAvatar: '👩‍🦰',
          lastMessage: 'Witaj! Z chęcią Ci pomogę. Jakie masz cele treningowe?',
          lastMessageTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          unreadCount: 1,
          isOnline: true,
        },
        {
          id: 'chat-u-client1-t-2',
          otherUserId: 't-2',
          otherUserName: 'Marek Nowak',
          otherUserAvatar: '👨‍🦲',
          lastMessage: 'Świetnie! Widzimy się jutro o 15:00.',
          lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          unreadCount: 0,
          isOnline: false,
        },
        {
          id: 'chat-u-client1-t-3',
          otherUserId: 't-3',
          otherUserName: 'Ewa Wiśniewska',
          otherUserAvatar: '👩‍🦱',
          lastMessage: 'Dziękuję za trening! Do zobaczenia w piątek.',
          lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          unreadCount: 0,
          isOnline: true,
        },
      ];
      setChatThreads(threads);
    }
  }, [user]);

  const filteredThreads = chatThreads.filter(thread =>
    thread.otherUserName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)} min temu`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} godz. temu`;
    } else {
      return date.toLocaleDateString('pl-PL');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold">Wiadomości</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Szukaj rozmów..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </header>

      {/* Chat Threads */}
      <section className="p-4 space-y-2">
        {filteredThreads.length > 0 ? filteredThreads.map((thread) => (
          <Card 
            key={thread.id} 
            className="cursor-pointer hover:shadow-card transition-all duration-200"
            onClick={() => handleChatClick(thread.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" />
                    <AvatarFallback>{thread.otherUserAvatar}</AvatarFallback>
                  </Avatar>
                  {thread.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold truncate">{thread.otherUserName}</h3>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(thread.lastMessageTime)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {thread.lastMessage}
                  </p>
                </div>
                {thread.unreadCount > 0 && (
                  <Badge variant="default" className="h-5 min-w-[20px] text-xs">
                    {thread.unreadCount}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )) : (
          <Card className="bg-gradient-card">
            <CardContent className="p-8 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Brak rozmów</h3>
              <p className="text-sm text-muted-foreground">
                Rozpocznij rozmowę z trenerem aby zobaczyć ją tutaj
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Bottom Navigation */}
      <BottomNavigation 
        userRole={user.role}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};