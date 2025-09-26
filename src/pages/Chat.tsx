import React, { useState, useEffect } from 'react';
import { Send, MoreVertical, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BottomNavigation } from '@/components/BottomNavigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useParams, useNavigate } from 'react-router-dom';
import { dataStore, Message } from '@/services/DataStore';

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  // Get other user info from chatId
  const getOtherUserInfo = () => {
    if (chatId?.includes('t-1')) return { name: 'Anna Kowalska', avatar: '👩‍🦰' };
    if (chatId?.includes('t-2')) return { name: 'Marek Nowak', avatar: '👨‍🦲' };
    if (chatId?.includes('t-3')) return { name: 'Ewa Wiśniewska', avatar: '👩‍🦱' };
    return { name: 'Trener', avatar: '👤' };
  };

  const otherUser = getOtherUserInfo();

  useEffect(() => {
    if (user && chatId) {
      setMessages(dataStore.getMessages(chatId));
    }
  }, [user, chatId]);

  const handleSendMessage = async () => {
    if (!user || !newMessage.trim() || !chatId) return;

    await dataStore.sendMessage({
      chatId,
      senderId: user.id,
      content: newMessage,
    });

    setMessages(dataStore.getMessages(chatId));
    setNewMessage('');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      {/* Header */}
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/chat')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar>
              <AvatarImage src="" />
              <AvatarFallback>{otherUser.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">{otherUser.name}</h2>
              <p className="text-sm text-muted-foreground">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.length > 0 ? messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                message.senderId === user.id
                  ? 'bg-primary text-primary-foreground ml-4'
                  : 'bg-card mr-4'
              }`}
            >
              <p>{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.sentAt).toLocaleTimeString('pl-PL', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        )) : (
          <Card className="bg-gradient-card">
            <CardContent className="p-4 text-center text-muted-foreground">
              Rozpocznij rozmowę wysyłając pierwszą wiadomość
            </CardContent>
          </Card>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 bg-card border-t">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Napisz wiadomość..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation 
        userRole={user.role}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};