import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  MoreVertical, 
  MessageCircle,
  Paperclip,
  Image as ImageIcon,
  Copy,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  Smile
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface OptimisticMessage {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  image_url?: string;
  message_type?: string;
  isOptimistic?: boolean;
  isUploading?: boolean;
  uploadError?: boolean;
}

const REACTION_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '🙏'];

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('messages');
  const [messages, setMessages] = useState<any[]>([]);
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [chat, setChat] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, optimisticMessages]);

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

        const msgs = await chatsService.getMessages(chatId);
        setMessages(msgs || []);

        await chatsService.markChatAsRead(chatId, user.id);
      } catch (error) {
        console.error('Error loading chat:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChat();

    const unsubscribe = chatsService.subscribeToMessages(chatId, (newMessage) => {
      // Remove optimistic message if it exists
      setOptimisticMessages(prev => 
        prev.filter(m => m.id !== newMessage.id)
      );
      
      // Update or add message
      setMessages(prev => {
        const exists = prev.find(m => m.id === newMessage.id);
        if (exists) {
          return prev.map(m => m.id === newMessage.id ? newMessage : m);
        }
        return [...prev, newMessage];
      });

      if (newMessage.sender_id !== user?.id) {
        chatsService.markAsRead(newMessage.id);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [chatId, user]);

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

    const tempId = `temp-${Date.now()}`;
    
    try {
      if (selectedImage) {
        // Optimistic image message
        const optimisticMsg: OptimisticMessage = {
          id: tempId,
          chat_id: chatId,
          sender_id: user.id,
          content: newMessage.trim() || '',
          image_url: imagePreview!,
          message_type: 'image',
          created_at: new Date().toISOString(),
          isOptimistic: true,
          isUploading: true
        };

        setOptimisticMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        setSelectedImage(null);
        setImagePreview(null);

        // Upload image
        const { url } = await uploadChatImage(user.id, chatId, selectedImage);
        
        // Send message with image URL
        await chatsService.sendMessage(chatId, user.id, newMessage.trim() || '📷');
        
        // Update with real image URL (this will be replaced by realtime)
        setOptimisticMessages(prev => 
          prev.map(m => m.id === tempId ? { ...m, isUploading: false, image_url: url } : m)
        );
      } else {
        // Optimistic text message
        const optimisticMsg: OptimisticMessage = {
          id: tempId,
          chat_id: chatId,
          sender_id: user.id,
          content: newMessage.trim(),
          created_at: new Date().toISOString(),
          isOptimistic: true
        };

        setOptimisticMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');

        // Send message
        await chatsService.sendMessage(chatId, user.id, newMessage.trim());
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Mark as error
      setOptimisticMessages(prev => 
        prev.map(m => m.id === tempId ? { ...m, uploadError: true, isUploading: false } : m)
      );

      toast({
        title: "Błąd",
        description: "Nie udało się wysłać wiadomości",
        variant: "destructive"
      });
    }
  };

  const handleRetry = async (tempId: string) => {
    const msg = optimisticMessages.find(m => m.id === tempId);
    if (!msg || !user || !chatId) return;

    setOptimisticMessages(prev => 
      prev.map(m => m.id === tempId ? { ...m, uploadError: false, isUploading: true } : m)
    );

    try {
      await chatsService.sendMessage(chatId, user.id, msg.content);
      setOptimisticMessages(prev => prev.filter(m => m.id !== tempId));
    } catch (error) {
      setOptimisticMessages(prev => 
        prev.map(m => m.id === tempId ? { ...m, uploadError: true, isUploading: false } : m)
      );
    }
  };

  const handleEditMessage = async (messageId: string) => {
    if (!editingContent.trim()) return;

    try {
      await chatsService.editMessage(messageId, editingContent.trim());
      setEditingMessageId(null);
      setEditingContent('');
      toast({
        title: "Sukces",
        description: "Wiadomość została edytowana"
      });
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się edytować wiadomości",
        variant: "destructive"
      });
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!user) return;

    try {
      await chatsService.deleteMessageForUser(messageId, user.id);
      toast({
        title: "Sukces",
        description: "Wiadomość została usunięta"
      });
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć wiadomości",
        variant: "destructive"
      });
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Skopiowano",
      description: "Tekst został skopiowany do schowka"
    });
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      await chatsService.addReaction(messageId, user.id, emoji);
      setShowReactions(null);
    } catch (error) {
      toast({
        title: "Błąd",
        description: "Nie udało się dodać reakcji",
        variant: "destructive"
      });
    }
  };

  const allMessages = [
    ...messages.filter((m: any) => !m.deleted_for_users?.includes(user?.id)),
    ...optimisticMessages
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (!user) return null;

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
              <p className="text-xs text-muted-foreground">Aktywny</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 p-4 overflow-y-auto space-y-3">
        {loading ? (
          <p className="text-center text-muted-foreground">Ładowanie...</p>
        ) : allMessages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Brak wiadomości</p>
          </div>
        ) : (
          allMessages.map((msg) => {
            const isOwn = msg.sender_id === user?.id;
            const isEditing = editingMessageId === msg.id;

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
                    } ${msg.isUploading ? 'opacity-50' : ''}`}
                  >
                    {msg.image_url && (
                      <img 
                        src={msg.image_url} 
                        alt="Załącznik"
                        className={`rounded-lg max-w-full mb-2 ${msg.isUploading ? 'blur-sm' : ''}`}
                      />
                    )}
                    
                    {isEditing ? (
                      <div className="flex gap-2">
                        <Input
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleEditMessage(msg.id)}
                          className="text-sm"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleEditMessage(msg.id)}>
                          <Send className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm">{msg.content}</p>
                        {msg.edited_at && (
                          <span className="text-xs opacity-50 ml-2">(edytowano)</span>
                        )}
                      </>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString('pl-PL', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      
                      {msg.isUploading && <Loader2 className="h-3 w-3 animate-spin" />}
                      {msg.uploadError && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRetry(msg.id)}
                          className="h-5 px-2 text-xs"
                        >
                          Ponów
                        </Button>
                      )}

                      {!msg.isOptimistic && isOwn && !isEditing && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setEditingMessageId(msg.id);
                              setEditingContent(msg.content);
                            }}>
                              <Edit2 className="h-3 w-3 mr-2" />
                              Edytuj
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleCopyText(msg.content)}>
                              <Copy className="h-3 w-3 mr-2" />
                              Kopiuj tekst
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteMessage(msg.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Usuń dla mnie
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  {/* Reactions */}
                  {!msg.isOptimistic && (
                    <div className="flex gap-1 flex-wrap">
                      {msg.reactions?.map((reaction: any, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => handleReaction(msg.id, reaction.emoji)}
                          className={`text-xs px-2 py-1 rounded-full bg-muted hover:bg-muted/80 ${
                            reaction.user_id === user.id ? 'ring-1 ring-primary' : ''
                          }`}
                        >
                          {reaction.emoji}
                        </button>
                      ))}
                      
                      <DropdownMenu open={showReactions === msg.id} onOpenChange={(open) => setShowReactions(open ? msg.id : null)}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Smile className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          {REACTION_EMOJIS.map((emoji) => (
                            <DropdownMenuItem 
                              key={emoji}
                              onClick={() => handleReaction(msg.id, emoji)}
                            >
                              <span className="text-lg">{emoji}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
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
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleImageSelect}
            className="hidden"
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Input
            placeholder="Napisz wiadomość..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          
          <Button onClick={handleSendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <BottomNavigation 
        userRole={user.role === 'trainer' ? 'trainer' : 'client'}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
};