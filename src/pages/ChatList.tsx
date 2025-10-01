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
import { supabase } from '@/integrations/supabase/client';

export const ChatListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('messages');
  const [searchQuery, setSearchQuery] = useState('');
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const loadChats = async () => {
      if (!user) return;

      try {
        const data = await chatsService.getByUserId(user.id);
        setChats(data || []);

        // Load unread counts for each chat
        const counts: Record<string, number> = {};
        for (const chat of data || []) {
          const count = await chatsService.getUnreadCount(chat.id, user.id);
          if (count > 0) counts[chat.id] = count;
        }
        setUnreadCounts(counts);
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();

    // Subscribe to new messages for real-time unread count updates
    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        () => {
          loadChats(); // Reload chats when new message arrives
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const getOtherUser = (chat: any) => {
    if (!user) return null;
    return chat.client_id === user.id ? (chat as any).trainer : (chat as any).client;
  };

  const filteredChats = chats.filter(chat => {
    if (searchQuery === '') return true;
    const otherUser = getOtherUser(chat);
    const userName = `${otherUser?.name || ''} ${otherUser?.surname || ''}`.toLowerCase();
    return userName.includes(searchQuery.toLowerCase());
  });

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
          filteredChats.map((chat) => {
            const otherUser = getOtherUser(chat);
            const userName = `${otherUser?.name || ''} ${otherUser?.surname || ''}`.trim() || 'Użytkownik';
            const lastMessage = chat.messages?.[0];
            const unreadCount = unreadCounts[chat.id] || 0;

            return (
              <Card
                key={chat.id}
                className="cursor-pointer hover:shadow-card transition-all"
                onClick={() => handleChatClick(chat.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={otherUser?.avatarurl || undefined} />
                        <AvatarFallback>
                          {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                        >
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold truncate">{userName}</h3>
                        <span className="text-xs text-muted-foreground">
                          {lastMessage 
                            ? new Date(lastMessage.created_at).toLocaleDateString('pl-PL')
                            : new Date(chat.created_at).toLocaleDateString('pl-PL')
                          }
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {lastMessage?.content || 'Brak wiadomości'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
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
