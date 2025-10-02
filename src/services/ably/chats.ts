import { ChatClient, Room } from '@ably/chat';

export interface AblyMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  metadata?: {
    image_url?: string;
    type?: string;
  };
}

export class AblyChatService {
  private client: ChatClient;
  private activeRooms: Map<string, Room> = new Map();

  constructor(client: ChatClient) {
    this.client = client;
  }

  async joinRoom(chatId: string): Promise<Room> {
    if (this.activeRooms.has(chatId)) {
      return this.activeRooms.get(chatId)!;
    }

    try {
      console.log('Joining Ably room:', `chat-${chatId}`);
      const room = await this.client.rooms.get(`chat-${chatId}`);
      await room.attach();
      this.activeRooms.set(chatId, room);
      console.log('Successfully joined room:', `chat-${chatId}`);
      return room;
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }

  async sendMessage(chatId: string, content: string, imageUrl?: string): Promise<void> {
    try {
      const room = await this.joinRoom(chatId);
      await room.messages.send({
        text: content,
        metadata: imageUrl ? { image_url: imageUrl, type: 'image' } : { type: 'text' },
      });
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  subscribeToMessages(
    chatId: string,
    callback: (message: AblyMessage) => void
  ): () => void {
    let unsubscribe: (() => void) | null = null;

    this.joinRoom(chatId).then((room) => {
      const { unsubscribe: unsub } = room.messages.subscribe((event: any) => {
        const message: AblyMessage = {
          id: event.message?.serial || Date.now().toString(),
          text: event.message?.text || '',
          senderId: event.message?.clientId || 'unknown',
          timestamp: Date.now(),
          metadata: event.message?.metadata as any,
        };
        callback(message);
      });
      unsubscribe = unsub;
    }).catch((error) => {
      console.error('Error subscribing to messages:', error);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  async startTyping(chatId: string): Promise<void> {
    try {
      const room = await this.joinRoom(chatId);
      // Typing API - check if available
      const typing = room.typing as any;
      if (typing?.start) {
        await typing.start();
      }
    } catch (error) {
      console.error('Error starting typing indicator:', error);
    }
  }

  async stopTyping(chatId: string): Promise<void> {
    try {
      const room = await this.joinRoom(chatId);
      // Typing API - check if available
      const typing = room.typing as any;
      if (typing?.stop) {
        await typing.stop();
      }
    } catch (error) {
      console.error('Error stopping typing indicator:', error);
    }
  }

  subscribeToTyping(
    chatId: string,
    callback: (isTyping: boolean, userId?: string) => void
  ): () => void {
    let unsubscribe: (() => void) | null = null;

    this.joinRoom(chatId).then((room) => {
      try {
        const { unsubscribe: unsub } = room.typing.subscribe((event: any) => {
          const typingUsers = event.currentlyTyping ? Array.from(event.currentlyTyping) : [];
          callback(typingUsers.length > 0, typingUsers[0] as string);
        });
        unsubscribe = unsub;
      } catch (error) {
        console.error('Error subscribing to typing:', error);
      }
    }).catch((error) => {
      console.error('Error subscribing to typing:', error);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  async setPresence(chatId: string, data: any): Promise<void> {
    try {
      const room = await this.joinRoom(chatId);
      await room.presence.enter(data);
    } catch (error) {
      console.error('Error setting presence:', error);
    }
  }

  subscribeToPresence(
    chatId: string,
    callback: (isOnline: boolean, userId?: string) => void
  ): () => void {
    let unsubscribe: (() => void) | null = null;

    this.joinRoom(chatId).then(async (room) => {
      try {
        const { unsubscribe: unsub } = room.presence.subscribe(async (event: any) => {
          const members = await room.presence.get();
          const firstMember = members && members.length > 0 ? members[0] : null;
          callback(members.length > 1, firstMember?.clientId);
        });
        unsubscribe = unsub;
      } catch (error) {
        console.error('Error subscribing to presence:', error);
      }
    }).catch((error) => {
      console.error('Error subscribing to presence:', error);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }

  async leaveRoom(chatId: string): Promise<void> {
    const room = this.activeRooms.get(chatId);
    if (room) {
      try {
        await room.detach();
        this.activeRooms.delete(chatId);
        console.log('Left room:', `chat-${chatId}`);
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    }
  }

  async cleanup(): Promise<void> {
    for (const [chatId] of this.activeRooms) {
      try {
        await this.client.rooms.release(`chat-${chatId}`);
      } catch (error) {
        console.error('Error releasing room:', chatId, error);
      }
    }
    this.activeRooms.clear();
  }
}
