import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  MessageCircle,
  Paperclip,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useAbly } from '@/contexts/AblyContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { chatsService } from '@/services/supabase';
import { uploadChatImage } from '@/services/supabase/upload';
import type * as Ably from 'ably';

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  imageUrl?: string;
}

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { realtimeClient, connectionState, isConnected } = useAbly();
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat metadata from Supabase
  useEffect(() => {
    const loadChat = async () => {
      if (!chatId || !user) return;

      try {
        setLoading(true);
        
        const chats = await chatsService.getByUserId(user.id);
        const currentChat = chats?.find(c => c.id === chatId);
        setChat(currentChat);
        
        if (currentChat) {
          const other = currentChat.client_id === user.id 
            ? (currentChat as any).trainer 
            : (currentChat as any).client;
          setOtherUser(other);
        }

        await chatsService.markChatAsRead(chatId, user.id);
      } catch (error) {
        console.error('[Chat] Error loading chat:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [chatId, user]);

  // Subscribe to Ably channel
  useEffect(() => {
    if (!chatId || !realtimeClient || !user) return;

    const channelName = `chat:${chatId}`;
    console.log('[Chat] Attaching to channel:', channelName);
    
    const channel = realtimeClient.channels.get(channelName);
    channelRef.current = channel;

    // Monitor channel state
    channel.on('attached', () => {
      console.log('[Chat] Channel attached');
    });

    channel.on('failed', (stateChange) => {
      console.error('[Chat] Channel failed:', stateChange.reason?.message);
      toast({
        title: "Błąd połączenia",
        description: stateChange.reason?.message || "Nie udało się połączyć z czatem",
        variant: "destructive"
      });
    });

    // Subscribe to messages
    const messageListener = (msg: Ably.Message) => {
      console.log('[Chat] Received message:', msg.data);
      const message: ChatMessage = msg.data;
      
      setMessages((prev) => {
        // Avoid duplicates
        if (prev.find(m => m.id === message.id)) {
          return prev;
        }
        return [...prev, message].sort((a, b) => a.timestamp - b.timestamp);
      });
    };

    channel.subscribe('message', messageListener);

    // Subscribe to typing indicators
    const typingListener = (msg: Ably.Message) => {
      const { userId, typing } = msg.data;
      if (userId !== user.id) {
        setIsTyping(typing);
      }
    };

    channel.subscribe('typing', typingListener);

    // Subscribe to presence
    channel.presence.enter({ status: 'online' });
    
    channel.presence.subscribe('enter', (member) => {
      if (member.clientId !== user.id) {
        console.log('[Chat] User entered:', member.clientId);
        setIsOtherUserOnline(true);
      }
    });

    channel.presence.subscribe('leave', (member) => {
      if (member.clientId !== user.id) {
        console.log('[Chat] User left:', member.clientId);
        setIsOtherUserOnline(false);
      }
    });

    // Attach the channel
    channel.attach();

    return () => {
      console.log('[Chat] Cleaning up channel');
      channel.presence.leave();
      channel.unsubscribe();
      channel.detach();
      channelRef.current = null;
    };
  }, [chatId, realtimeClient, user, toast]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Błąd",
        description: "Nieprawidłowy typ pliku. Dozwolone: JPG, PNG, GIF, WEBP",
        variant: "destructive"
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Błąd",
        description: "Plik jest za duży. Maksymalny rozmiar: 5MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedImage) || !user || !chatId || !channelRef.current) return;

    setSending(true);
    
    try {
      let imageUrl: string | undefined;

      if (selectedImage) {
        const { url } = await uploadChatImage(user.id, chatId, selectedImage);
        imageUrl = url;
      }

      const message: ChatMessage = {
        id: `${Date.now()}-${user.id}`,
        text: newMessage.trim() || '📷',
        senderId: user.id,
        timestamp: Date.now(),
        imageUrl,
      };

      // Publish message to Ably
      await channelRef.current.publish('message', message);

      console.log('[Chat] Message sent:', message);

      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);

      // Stop typing indicator
      if (channelRef.current) {
        await channelRef.current.publish('typing', { userId: user.id, typing: false });
      }
    } catch (error) {
      console.error('[Chat] Error sending message:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać wiadomości",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!channelRef.current || !chatId || !user) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Start typing
    channelRef.current.publish('typing', { userId: user.id, typing: true });

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (channelRef.current && user) {
        channelRef.current.publish('typing', { userId: user.id, typing: false });
      }
    }, 2000);
  };

  if (!user) return null;

  const getConnectionStatus = () => {
    if (!realtimeClient) return 'Inicjalizacja...';
    
    switch (connectionState) {
      case 'connected':
        return isOtherUserOnline ? 'Online' : 'Offline';
      case 'connecting':
        return 'Łączenie...';
      case 'disconnected':
        return 'Sprawdzanie połączenia...';
      case 'suspended':
        return 'Ponowne łączenie...';
      case 'failed':
        return 'Błąd połączenia';
      case 'closed':
        return 'Rozłączono';
      default:
        return 'Łączenie...';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 flex flex-col">
      <header className="bg-card shadow-sm p-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="w-10 h-10">
              <AvatarImage src={otherUser?.avatarurl || undefined} />
              <AvatarFallback>
                {otherUser?.name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold">
                {`${otherUser?.name || ''} ${otherUser?.surname || ''}`.trim() || 'Użytkownik'}
              </h2>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-green-500' : 
                  connectionState === 'connecting' || connectionState === 'disconnected' ? 'bg-yellow-500 animate-pulse' : 
                  'bg-red-500'
                }`} />
                <span className="text-xs text-muted-foreground">
                  {getConnectionStatus()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Show error message only when connection permanently failed */}
      {connectionState === 'failed' && (
        <div className="p-4 bg-destructive/10 border-b">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">
                Nie można połączyć z czatem
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {realtimeClient?.connection.errorReason?.message || 'Sprawdź połączenie internetowe'}
              </p>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Odśwież aplikację
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground">Ładowanie...</p>
        ) : messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Brak wiadomości</p>
            <p className="text-xs mt-2">Rozpocznij rozmowę!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === user?.id;

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div
                    className={`rounded-2xl px-4 py-2 relative ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.imageUrl && (
                      <img 
                        src={msg.imageUrl} 
                        alt="Załącznik"
                        className="rounded-lg max-w-full mb-2"
                      />
                    )}
                    
                    <p className="text-sm">{msg.text}</p>

                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString('pl-PL', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-2">
              <p className="text-xs text-muted-foreground">Pisze...</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-card border-t">
        {imagePreview && (
          <div className="mb-2 relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={() => {
                setSelectedImage(null);
                setImagePreview(null);
              }}
            >
              ×
            </Button>
          </div>
        )}
        
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending || !isConnected}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={isConnected ? "Wpisz wiadomość..." : "Łączenie..."}
            className="flex-1"
            disabled={sending || !isConnected}
          />
          <Button onClick={handleSendMessage} disabled={sending || !isConnected}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <BottomNavigation activeTab="chat" userRole={user.role as 'client' | 'trainer'} onTabChange={() => {}} />
    </div>
  );
};
