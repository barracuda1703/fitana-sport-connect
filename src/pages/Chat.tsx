import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  MessageCircle,
  Paperclip,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { chatsService } from '@/services/supabase';
import { uploadChatImage } from '@/services/supabase/upload';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  imageUrl?: string;
}

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
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
  const [sending, setSending] = useState(false);
  const [connectionState, setConnectionState] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat and setup Supabase Realtime
  useEffect(() => {
    if (!chatId || !user) return;

    let channel: any;

    const setupChat = async () => {
      try {
        setLoading(true);
        
        // Load chat metadata
        const chats = await chatsService.getByUserId(user.id);
        const currentChat = chats?.find(c => c.id === chatId);
        setChat(currentChat);
        
        if (currentChat) {
          const other = currentChat.client_id === user.id 
            ? (currentChat as any).trainer 
            : (currentChat as any).client;
          setOtherUser(other);
        }

        // Load existing messages from Supabase
        const existingMessages = await chatsService.getMessages(chatId);
        setMessages(
          existingMessages.map((msg: any) => ({
            id: msg.id,
            text: msg.content,
            senderId: msg.sender_id,
            timestamp: new Date(msg.created_at).getTime(),
            imageUrl: msg.image_url,
          }))
        );

        // Subscribe to Supabase Realtime for new messages
        channel = supabase
          .channel(`chat:${chatId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `chat_id=eq.${chatId}`
            },
            (payload) => {
              console.log('[Chat] New message received:', payload.new);
              const newMsg = payload.new as any;
              
              setMessages((prev) => {
                // Avoid duplicates
                if (prev.find(m => m.id === newMsg.id)) {
                  return prev;
                }
                
                return [...prev, {
                  id: newMsg.id,
                  text: newMsg.content,
                  senderId: newMsg.sender_id,
                  timestamp: new Date(newMsg.created_at).getTime(),
                  imageUrl: newMsg.image_url,
                }].sort((a, b) => a.timestamp - b.timestamp);
              });
            }
          )
          .subscribe((status) => {
            console.log('[Chat] Subscription status:', status);
            if (status === 'SUBSCRIBED') {
              setConnectionState('connected');
            } else if (status === 'CHANNEL_ERROR') {
              setConnectionState('disconnected');
              toast({
                title: "Błąd połączenia",
                description: "Nie udało się połączyć z czatem",
                variant: "destructive"
              });
            }
          });

        channelRef.current = channel;

        // Mark chat as read
        await chatsService.markChatAsRead(chatId, user.id);

      } catch (error) {
        console.error('[Chat] Setup error:', error);
        setConnectionState('disconnected');
        toast({
          title: "Błąd",
          description: "Nie udało się załadować czatu",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    setupChat();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [chatId, user, toast]);

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
    if ((!newMessage.trim() && !selectedImage) || !user || !chatId) return;

    setSending(true);
    
    try {
      let imageUrl: string | undefined;

      if (selectedImage) {
        console.log('[Chat] Uploading image...');
        const { url } = await uploadChatImage(user.id, chatId, selectedImage);
        imageUrl = url;
        console.log('[Chat] Image uploaded:', imageUrl);
      }

      // Save message to Supabase (Realtime will automatically send update)
      await chatsService.sendMessage(
        chatId,
        user.id,
        newMessage.trim() || '📷',
        imageUrl
      );

      console.log('[Chat] Message saved to DB');

      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);

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

  if (!user) return null;

  const getConnectionStatus = () => {
    switch (connectionState) {
      case 'connected':
        return 'Online';
      case 'connecting':
        return 'Łączenie...';
      case 'disconnected':
        return 'Offline';
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
                {connectionState === 'connected' ? (
                  <Wifi className="w-3 h-3 text-green-500" />
                ) : (
                  <WifiOff className="w-3 h-3 text-red-500" />
                )}
                <span className="text-xs text-muted-foreground">
                  {getConnectionStatus()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {connectionState === 'disconnected' && (
        <div className="p-4 bg-destructive/10 border-b">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-destructive">
                Nie można połączyć z czatem
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Sprawdź połączenie internetowe
              </p>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Odśwież
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
            disabled={sending || connectionState !== 'connected'}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={connectionState === 'connected' ? "Wpisz wiadomość..." : "Łączenie..."}
            className="flex-1"
            disabled={sending || connectionState !== 'connected'}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={sending || connectionState !== 'connected'}
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <BottomNavigation activeTab="chat" userRole={user.role as 'client' | 'trainer'} onTabChange={() => {}} />
    </div>
  );
};