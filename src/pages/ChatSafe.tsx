import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ArrowLeft, 
  Send, 
  MessageCircle,
  Paperclip,
  Loader2,
  WifiOff,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BottomNavigation } from '@/components/BottomNavigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { chatsService } from '@/services/supabase/chats';
import { uploadChatImage } from '@/services/supabase/upload';
import { useAblyChat } from '@/hooks/useAblyChat';
import { FEATURE_FLAGS } from '@/lib/featureFlags';

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  imageUrl?: string;
}

export const ChatSafePage: React.FC = () => {
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
  const [isTyping, setIsTyping] = useState(false);
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<ChatMessage[]>([]);

  const handleNewMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      // Avoid duplicates
      if (prev.find(m => m.id === message.id)) {
        return prev;
      }
      return [...prev, message].sort((a, b) => a.timestamp - b.timestamp);
    });
  }, []);

  const {
    channelState,
    error: channelError,
    publishMessage,
    publishTyping,
    reconnect,
    isConnected,
    isPollingMode,
  } = useAblyChat({
    chatId: chatId || '',
    userId: user?.id || '',
    onMessage: handleNewMessage,
    onTyping: setIsTyping,
    onPresence: setIsOtherUserOnline,
  });

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
        
        // Verify user is a participant
        if (!currentChat) {
          console.warn('[Chat] User is not a participant of this chat');
          toast({
            title: "Brak dostępu",
            description: "Nie masz dostępu do tej rozmowy",
            variant: "destructive"
          });
          navigate('/chat', { replace: true });
          return;
        }
        
        setChat(currentChat);
        
        if (currentChat) {
          const other = currentChat.client_id === user.id 
            ? (currentChat as any).trainer 
            : (currentChat as any).client;
          setOtherUser(other);
        }

        await chatsService.markChatAsRead(chatId, user.id);

        // Load messages from DB
        const dbMessages = await chatsService.getMessages(chatId);
        const formatted = dbMessages.map((msg: any) => ({
          id: msg.id,
          text: msg.content,
          senderId: msg.sender_id,
          timestamp: new Date(msg.created_at).getTime(),
          imageUrl: msg.image_url,
        }));
        setMessages(formatted);
      } catch (error) {
        console.error('[Chat] Error loading chat:', error);
        toast({
          title: "Błąd",
          description: "Nie udało się załadować czatu",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [chatId, user, toast, navigate]);

  // Process queued messages when connected
  useEffect(() => {
    if (isConnected && messageQueueRef.current.length > 0) {
      console.debug('[Chat] Processing', messageQueueRef.current.length, 'queued messages');
      messageQueueRef.current.forEach((msg) => {
        publishMessage(msg).catch(console.error);
      });
      messageQueueRef.current = [];
    }
  }, [isConnected, publishMessage]);

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
        const { url } = await uploadChatImage(user.id, chatId, selectedImage);
        imageUrl = url;
      }

      // Persist to DB first
      const dbMessage = await chatsService.sendMessage(
        chatId,
        user.id,
        newMessage.trim() || '📷',
        imageUrl
      );

      const message: ChatMessage = {
        id: dbMessage.id,
        text: dbMessage.content,
        senderId: user.id,
        timestamp: new Date(dbMessage.created_at).getTime(),
        imageUrl: dbMessage.image_url || imageUrl,
      };

      // Add to local state immediately (optimistic)
      handleNewMessage(message);

      // Publish to Ably if connected, otherwise queue
      if (isConnected) {
        try {
          await publishMessage(message);
        } catch (err) {
          console.warn('[Chat] Failed to publish, message saved to DB');
        }
      } else {
        console.debug('[Chat] Queuing message (not connected)');
        messageQueueRef.current.push(message);
      }

      setNewMessage('');
      setSelectedImage(null);
      setImagePreview(null);

      // Stop typing indicator
      publishTyping(false).catch(console.error);
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

    if (!chatId || !user) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Start typing
    publishTyping(true).catch(console.error);

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      publishTyping(false).catch(console.error);
    }, 2000);
  };

  if (!user) return null;

  const getConnectionStatus = () => {
    if (isPollingMode) return 'Tryb offline';
    
    switch (channelState) {
      case 'attached':
        return isOtherUserOnline ? 'Online' : 'Offline';
      case 'attaching':
      case 'connecting':
        return 'Łączenie...';
      case 'disconnected':
      case 'suspended':
        return 'Ponowne łączenie...';
      case 'failed':
        return 'Błąd połączenia';
      default:
        return 'Łączenie...';
    }
  };

  const getConnectionColor = () => {
    if (isPollingMode) return 'bg-yellow-500';
    if (isConnected) return 'bg-green-500';
    if (channelState === 'connecting' || channelState === 'attaching' || channelState === 'disconnected' || channelState === 'suspended') {
      return 'bg-yellow-500 animate-pulse';
    }
    return 'bg-red-500';
  };

  const canSendMessages = !sending && (isConnected || isPollingMode);

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
                <div className={`w-2 h-2 rounded-full ${getConnectionColor()}`} />
                <span className="text-xs text-muted-foreground">
                  {getConnectionStatus()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Connection errors */}
      {channelState === 'failed' && channelError && (
        <Alert variant="destructive" className="m-4">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <p className="font-medium">Nie można połączyć z czatem</p>
              <p className="text-xs mt-1">{channelError}</p>
            </div>
            <Button size="sm" variant="outline" onClick={reconnect}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Połącz
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Offline mode banner */}
      {(channelState === 'suspended' || channelState === 'disconnected') && !isPollingMode && (
        <Alert className="m-4">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm">Offline – wiadomości będą wysłane po połączeniu</span>
            <Button size="sm" variant="outline" onClick={reconnect}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Połącz
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Polling mode info */}
      {isPollingMode && (
        <Alert className="m-4">
          <MessageCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Tryb offline – wiadomości odświeżane co {FEATURE_FLAGS.POLLING_INTERVAL / 1000}s
          </AlertDescription>
        </Alert>
      )}

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {loading ? (
          <div className="text-center text-muted-foreground py-8">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Ładowanie...</p>
          </div>
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
            disabled={!canSendMessages}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            placeholder={canSendMessages ? "Wpisz wiadomość..." : "Łączenie..."}
            className="flex-1"
            disabled={!canSendMessages}
          />
          <Button onClick={handleSendMessage} disabled={!canSendMessages}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      <BottomNavigation activeTab="chat" userRole={user.role as 'client' | 'trainer'} onTabChange={() => {}} />
    </div>
  );
};