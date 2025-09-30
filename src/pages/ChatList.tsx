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
import { chatsService } from '@/services/supabase';

export const ChatListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      if (!user) return;

      try {
        const data = await chatsService.getByUserId(user.id);
        setChats(data || []);
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [user]);

  const filteredChats = chats.filter(chat =>
    searchQuery === '' || 
    chat.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleChatClick = (chatId: string) => {
    navigate(`/chat/${chatId}`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold flex-1">Wiadomości</h1>
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

      <div className="p-4 space-y-2">
        {loading ? (
          <p className="text-center text-muted-foreground">Ładowanie...</p>
        ) : filteredChats.length === 0 ? (
          <Card className="bg-gradient-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Brak konwersacji</p>
            </CardContent>
          </Card>
        ) : (
          filteredChats.map((chat) => (
            <Card
              key={chat.id}
              className="cursor-pointer hover:shadow-card transition-all"
              onClick={() => handleChatClick(chat.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">Rozmowa</h3>
                      <span className="text-xs text-muted-foreground">
                        {new Date(chat.created_at).toLocaleDateString('pl-PL')}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      Kliknij aby otworzyć
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <BottomNavigation 
        userRole={user.role === 'trainer' ? 'trainer' : 'client'}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};
