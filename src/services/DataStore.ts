// Mock Data Store with localStorage persistence
export interface User {
  id: string;
  role: 'client' | 'trainer';
  email: string;
  password: string;
  name: string;
  surname?: string;
  city?: string;
  avatarUrl?: string;
  language: string;
}

export interface Trainer {
  id: string;
  userId: string;
  name: string;
  surname: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  distance: string;
  specialties: string[];
  isVerified: boolean;
  hasVideo: boolean;
  avatar: string;
  bio: string;
  gender: 'male' | 'female' | 'other';
  coordinates: { lat: number; lng: number };
  services: Service[];
  availability: AvailabilitySlot[];
  settings?: TrainerSettings;
}

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number; // minutes
  type: 'online' | 'gym' | 'court' | 'home_visit';
}

export interface AvailabilitySlot {
  dayOfWeek: number; // 0-6
  startTime: string; // "09:00"
  endTime: string; // "17:00"
}

export interface TrainerSettings {
  workingDays: number[]; // [1, 2, 3, 4, 5] for Mon-Fri
  workingHours: { [key: number]: { start: string; end: string } }; // { 1: { start: "09:00", end: "18:00" } }
  slotDuration: number; // 15, 30, 60 minutes
  defaultServiceDuration: number; // 60 minutes
}

export interface ManualBlock {
  id: string;
  trainerId: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string; // "10:00"
  endTime: string; // "11:00"
  createdAt: string;
}

export interface Booking {
  id: string;
  clientId: string;
  trainerId: string;
  serviceId: string;
  scheduledAt: string; // ISO date
  status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  sentAt: string;
  readAt?: string;
}

export interface Sport {
  id: string;
  name: string;
  icon: string;
}

export interface Review {
  id: string;
  bookingId: string;
  clientId: string;
  trainerId: string;
  rating: number;
  comment: string;
  photos: string[];
  createdAt: string;
  trainerReply?: {
    comment: string;
    repliedAt: string;
  };
}

// Seed data
const seedData = {
  sports: [
    { id: 's-fitness', name: 'Fitness', icon: '💪' },
    { id: 's-yoga', name: 'Yoga', icon: '🧘‍♀️' },
    { id: 's-running', name: 'Bieganie', icon: '🏃‍♂️' },
    { id: 's-boxing', name: 'Boks', icon: '🥊' },
    { id: 's-swimming', name: 'Pływanie', icon: '🏊‍♀️' },
    { id: 's-tennis', name: 'Tenis', icon: '🎾' },
  ],
  
  users: [
    { id: 'u-client1', role: 'client' as const, email: 'client@test.com', password: 'demo123', name: 'Kasia', city: 'Warszawa', language: 'pl' },
    { id: 'u-trainer1', role: 'trainer' as const, email: 'anna@test.com', password: 'demo123', name: 'Anna', surname: 'Kowalska', language: 'pl' },
    { id: 'u-trainer2', role: 'trainer' as const, email: 'marek@test.com', password: 'demo123', name: 'Marek', surname: 'Nowak', language: 'pl' },
    { id: 'u-trainer3', role: 'trainer' as const, email: 'ewa@test.com', password: 'demo123', name: 'Ewa', surname: 'Wiśniewska', language: 'pl' },
  ],

  trainers: [
    // Fitness trainers
    {
      id: 't-1',
      userId: 'u-trainer1',
      name: 'Anna Kowalska',
      surname: 'Kowalska',
      rating: 4.9,
      reviewCount: 127,
      priceFrom: 80,
      distance: '0.5 km',
      specialties: ['Fitness', 'Yoga'],
      isVerified: true,
      hasVideo: true,
      avatar: '👩‍🦰',
      bio: 'Certyfikowana trenerka fitness z 8-letnim doświadczeniem.',
      gender: 'female' as const,
      coordinates: { lat: 52.2297, lng: 21.0122 },
      services: [
        { id: 'srv-1', name: 'Trening personalny', price: 80, duration: 60, type: 'gym' as const },
        { id: 'srv-2', name: 'Yoga', price: 70, duration: 90, type: 'online' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '18:00' },
      ],
    },
    // Boxing trainers
    {
      id: 't-2',
      userId: 'u-trainer2',
      name: 'Marek Nowak',
      surname: 'Nowak',
      rating: 4.8,
      reviewCount: 89,
      priceFrom: 90,
      distance: '1.2 km',
      specialties: ['Boks', 'Crossfit'],
      isVerified: true,
      hasVideo: false,
      avatar: '👨‍🦲',
      bio: 'Były zawodnik boksu, obecnie trener personalny.',
      gender: 'male' as const,
      coordinates: { lat: 52.2350, lng: 21.0103 },
      services: [
        { id: 'srv-3', name: 'Trening boksu', price: 90, duration: 60, type: 'gym' as const },
        { id: 'srv-4', name: 'Crossfit', price: 85, duration: 45, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '10:00', endTime: '20:00' },
        { dayOfWeek: 2, startTime: '10:00', endTime: '20:00' },
        { dayOfWeek: 3, startTime: '10:00', endTime: '20:00' },
        { dayOfWeek: 4, startTime: '10:00', endTime: '20:00' },
        { dayOfWeek: 5, startTime: '10:00', endTime: '20:00' },
        { dayOfWeek: 6, startTime: '09:00', endTime: '15:00' },
      ],
    },
    // Yoga trainers  
    {
      id: 't-3',
      userId: 'u-trainer3',
      name: 'Ewa Wiśniewska',
      surname: 'Wiśniewska',
      rating: 5.0,
      reviewCount: 203,
      priceFrom: 100,
      distance: '2.1 km',
      specialties: ['Pilates', 'Stretching'],
      isVerified: true,
      hasVideo: true,
      avatar: '👩‍🦱',
      bio: 'Specjalistka od pilates i rehabilitacji.',
      gender: 'female' as const,
      coordinates: { lat: 52.2400, lng: 21.0150 },
      services: [
        { id: 'srv-5', name: 'Pilates', price: 100, duration: 60, type: 'gym' as const },
        { id: 'srv-6', name: 'Stretching', price: 80, duration: 45, type: 'online' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '16:00' },
        { dayOfWeek: 2, startTime: '08:00', endTime: '16:00' },
        { dayOfWeek: 3, startTime: '08:00', endTime: '16:00' },
        { dayOfWeek: 4, startTime: '08:00', endTime: '16:00' },
        { dayOfWeek: 5, startTime: '08:00', endTime: '16:00' },
      ],
    },
  ],

  reviews: [
    {
      id: 'rev-1',
      bookingId: 'book-1',
      clientId: 'u-client1',
      trainerId: 't-1',
      rating: 5,
      comment: 'Świetny trener! Bardzo profesjonalne podejście i indywidualne dostosowanie ćwiczeń.',
      photos: [],
      createdAt: '2024-01-15T10:00:00.000Z'
    },
    {
      id: 'rev-2',
      bookingId: 'book-2',
      clientId: 'u-client2',
      trainerId: 't-1',
      rating: 5,
      comment: 'Polecam! Anna potrafi zmotywować i wytłumaczyć każde ćwiczenie.',
      photos: [],
      createdAt: '2024-01-20T14:30:00.000Z'
    },
    {
      id: 'rev-3',
      bookingId: 'book-3',
      clientId: 'u-client1',
      trainerId: 't-1',
      rating: 4,
      comment: 'Dobry trening, ale mógłby być nieco bardziej intensywny.',
      photos: [],
      createdAt: '2024-01-25T16:00:00.000Z'
    }
  ],

  bookings: [
    {
      id: 'booking-1',
      clientId: 'u-client1',
      trainerId: 'u-trainer1',
      serviceId: 'srv-1',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      status: 'pending' as const,
      notes: 'Jestem początkujący, proszę o łagodne podejście',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'booking-2',
      clientId: 'u-client1', 
      trainerId: 'u-trainer2',
      serviceId: 'srv-3',
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // Day after tomorrow
      status: 'confirmed' as const,
      createdAt: new Date().toISOString(),
    },
  ],

  messages: [
    {
      id: 'msg-1',
      chatId: 'chat-u-client1-u-trainer1',
      senderId: 'u-client1',
      content: 'Cześć! Interesuje mnie trening personalny.',
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'msg-2',
      chatId: 'chat-u-client1-u-trainer1',
      senderId: 'u-trainer1',
      content: 'Witaj! Chętnie pomogę Ci zacząć. Jakie masz doświadczenie z treningiem?',
      sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
  ],

  manualBlocks: [] as ManualBlock[],
  trainerSettings: [] as (TrainerSettings & { trainerId: string })[],
};

class DataStore {
  private storageKey = 'fitana-data';
  private data: {
    users: User[];
    trainers: Trainer[];
    bookings: Booking[];
    messages: Message[];
    sports: Sport[];
    manualBlocks: ManualBlock[];
    reviews: Review[];
    trainerSettings: (TrainerSettings & { trainerId: string })[];
  };

  constructor() {
    const savedData = localStorage.getItem(this.storageKey);
    if (savedData) {
      this.data = JSON.parse(savedData);
    // Ensure new fields exist
    if (!this.data.manualBlocks) this.data.manualBlocks = [];
    if (!this.data.reviews) this.data.reviews = [];
    if (!this.data.trainerSettings) this.data.trainerSettings = [];
    } else {
      this.data = { ...seedData };
      this.saveData();
    }
  }

  private saveData() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  // Auth methods
  async login(email: string, password: string): Promise<User | null> {
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network delay
    const user = this.data.users.find(u => u.email === email && u.password === password);
    return user || null;
  }

  async register(userData: Omit<User, 'id'>): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const user: User = {
      ...userData,
      id: `u-${Date.now()}`,
    };
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  // User methods
  getUser(id: string): User | null {
    return this.data.users.find(u => u.id === id) || null;
  }

  // Trainer methods
  getTrainers(): Trainer[] {
    return this.data.trainers;
  }

  getTrainer(id: string): Trainer | null {
    return this.data.trainers.find(t => t.id === id || t.userId === id) || null;
  }

  getTrainersBySport(sportId: string): Trainer[] {
    return this.data.trainers.filter(trainer => 
      trainer.specialties.some(specialty => 
        specialty.toLowerCase().includes(sportId.replace('s-', '').toLowerCase())
      )
    );
  }

  // Sports methods
  getSports(): Sport[] {
    return this.data.sports;
  }

  // Booking methods
  createBooking(bookingData: Omit<Booking, 'id' | 'createdAt'>): Booking {
    const booking: Booking = {
      ...bookingData,
      id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.bookings.push(booking);
    this.saveData();
    return booking;
  }

  getBookings(userId: string): Booking[] {
    return this.data.bookings.filter(booking => 
      booking.clientId === userId || booking.trainerId === userId
    );
  }

  updateBookingStatus(bookingId: string, status: Booking['status']): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const booking = this.data.bookings.find(b => b.id === bookingId);
        if (booking) {
          booking.status = status;
          this.saveData();
        }
        resolve();
      }, 300);
    });
  }

  // Message methods
  getMessages(chatId: string): Message[] {
    return this.data.messages.filter(m => m.chatId === chatId);
  }

  sendMessage(messageData: Omit<Message, 'id' | 'sentAt'>): Message {
    const message: Message = {
      ...messageData,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sentAt: new Date().toISOString(),
    };
    this.data.messages.push(message);
    this.saveData();
    return message;
  }

  getChatPreviews(userId: string): Array<{
    chatId: string;
    otherUserId: string;
    otherUserName: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
  }> {
    const userChats = new Map<string, Message[]>();
    
    this.data.messages.forEach(message => {
      if (message.chatId.includes(userId)) {
        if (!userChats.has(message.chatId)) {
          userChats.set(message.chatId, []);
        }
        userChats.get(message.chatId)!.push(message);
      }
    });

    return Array.from(userChats.entries()).map(([chatId, messages]) => {
      const otherUserId = chatId.replace(`chat-${userId}-`, '').replace(`chat-`, '').replace(`-${userId}`, '');
      const otherUser = this.getUser(otherUserId);
      const lastMessage = messages.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())[0];
      const unreadCount = messages.filter(m => m.senderId !== userId && !m.readAt).length;

      return {
        chatId,
        otherUserId,
        otherUserName: otherUser?.name || 'Unknown',
        lastMessage: lastMessage.content,
        lastMessageTime: lastMessage.sentAt,
        unreadCount,
      };
    });
  }

  // Availability methods
  getAvailableDates(trainerId: string): string[] {
    const trainer = this.getTrainer(trainerId);
    if (!trainer) return [];
    
    const availableDates: string[] = [];
    const today = new Date();
    
    // Generate next 30 days
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayOfWeek = date.getDay();
      
      // Check if trainer is available on this day
      const hasAvailability = trainer.availability.some(slot => 
        slot.dayOfWeek === dayOfWeek
      );
      
      if (hasAvailability) {
        availableDates.push(date.toISOString().split('T')[0]);
      }
    }
    
    return availableDates;
  }

  getAvailableHours(trainerId: string, date: string, serviceDuration: number): string[] {
    const trainer = this.getTrainer(trainerId);
    if (!trainer) return [];

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    
    // Get trainer's availability for this day
    const dayAvailability = trainer.availability.find(slot => 
      slot.dayOfWeek === dayOfWeek
    );
    
    if (!dayAvailability) return [];

    // Generate 30-minute slots between start and end time
    const availableHours: string[] = [];
    const startHour = parseInt(dayAvailability.startTime.split(':')[0]);
    const startMinute = parseInt(dayAvailability.startTime.split(':')[1]);
    const endHour = parseInt(dayAvailability.endTime.split(':')[0]);
    const endMinute = parseInt(dayAvailability.endTime.split(':')[1]);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    // Create 30-minute slots
    for (let time = startTime; time < endTime - serviceDuration; time += 30) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
        // Check if this slot is already booked (only blocked by confirmed/pending bookings)
        const isBooked = this.data.bookings.some(booking => {
          if (booking.trainerId !== trainerId) return false;
          if (booking.status !== 'pending' && booking.status !== 'confirmed') return false;
          
          const bookingDate = new Date(booking.scheduledAt);
          const bookingDateStr = bookingDate.toISOString().split('T')[0];
          
          // Check if booking time overlaps with this slot
          const bookingStartMinutes = bookingDate.getHours() * 60 + bookingDate.getMinutes();
          const slotStartMinutes = time;
          const slotEndMinutes = time + 30; // 30-minute slots
          
          return bookingDateStr === date && 
                 bookingStartMinutes < slotEndMinutes && 
                 (bookingStartMinutes + serviceDuration) > slotStartMinutes;
        });
      
      if (!isBooked) {
        availableHours.push(timeSlot);
      }
    }
    
    return availableHours;
  }

  // Trainer settings methods
  getTrainerSettings(trainerId: string): TrainerSettings | null {
    const found = this.data.trainerSettings.find(s => s.trainerId === trainerId);
    return found || null;
  }

  updateTrainerSettings(trainerId: string, settings: TrainerSettings): void {
    const index = this.data.trainerSettings.findIndex(s => s.trainerId === trainerId);
    const newSettings = { trainerId, ...settings };
    
    if (index >= 0) {
      this.data.trainerSettings[index] = newSettings;
    } else {
      this.data.trainerSettings.push(newSettings);
    }
    this.saveData();
  }

  // Manual blocks methods
  getManualBlocks(trainerId: string): ManualBlock[] {
    if (!this.data.manualBlocks) {
      this.data.manualBlocks = [];
      this.saveData();
    }
    return this.data.manualBlocks.filter(block => block.trainerId === trainerId);
  }

  addManualBlock(block: Omit<ManualBlock, 'id' | 'createdAt'>): ManualBlock {
    if (!this.data.manualBlocks) {
      this.data.manualBlocks = [];
    }
    const newBlock: ManualBlock = {
      ...block,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.manualBlocks.push(newBlock);
    this.saveData();
    return newBlock;
  }

  removeManualBlock(blockId: string): void {
    if (!this.data.manualBlocks) {
      this.data.manualBlocks = [];
      return;
    }
    this.data.manualBlocks = this.data.manualBlocks.filter(block => block.id !== blockId);
    this.saveData();
  }

  // Enhanced availability with trainer settings
  getAvailableHoursWithSettings(trainerId: string, date: string, serviceDuration: number): string[] {
    const trainer = this.getTrainer(trainerId);
    if (!trainer) return [];

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();
    
    const settings = this.getTrainerSettings(trainerId) || {
      workingDays: [1, 2, 3, 4, 5],
      workingHours: {
        1: { start: "09:00", end: "18:00" },
        2: { start: "09:00", end: "18:00" },
        3: { start: "09:00", end: "18:00" },
        4: { start: "09:00", end: "18:00" },
        5: { start: "09:00", end: "18:00" },
      },
      slotDuration: 30,
      defaultServiceDuration: 60,
    };

    if (!settings.workingDays.includes(dayOfWeek)) return [];

    const dayHours = settings.workingHours[dayOfWeek];
    if (!dayHours) return [];

    const availableHours: string[] = [];
    const startHour = parseInt(dayHours.start.split(':')[0]);
    const startMinute = parseInt(dayHours.start.split(':')[1]);
    const endHour = parseInt(dayHours.end.split(':')[0]);
    const endMinute = parseInt(dayHours.end.split(':')[1]);
    
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    for (let time = startTime; time < endTime - serviceDuration; time += settings.slotDuration) {
      const hour = Math.floor(time / 60);
      const minute = time % 60;
      const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      const isBookingBlocked = this.data.bookings.some(booking => {
        if (booking.trainerId !== trainerId) return false;
        if (booking.status !== 'pending' && booking.status !== 'confirmed') return false;
        
        const bookingDate = new Date(booking.scheduledAt);
        const bookingDateStr = bookingDate.toISOString().split('T')[0];
        
        const bookingStartMinutes = bookingDate.getHours() * 60 + bookingDate.getMinutes();
        const slotStartMinutes = time;
        const slotEndMinutes = time + settings.slotDuration;
        
        return bookingDateStr === date && 
               bookingStartMinutes < slotEndMinutes && 
               (bookingStartMinutes + serviceDuration) > slotStartMinutes;
      });

      const isManualBlocked = this.data.manualBlocks && this.data.manualBlocks.some(block => {
        if (block.trainerId !== trainerId || block.date !== date) return false;
        
        const blockStartHour = parseInt(block.startTime.split(':')[0]);
        const blockStartMinute = parseInt(block.startTime.split(':')[1]);
        const blockEndHour = parseInt(block.endTime.split(':')[0]);
        const blockEndMinute = parseInt(block.endTime.split(':')[1]);
        
        const blockStartMinutes = blockStartHour * 60 + blockStartMinute;
        const blockEndMinutes = blockEndHour * 60 + blockEndMinute;
        const slotStartMinutes = time;
        const slotEndMinutes = time + settings.slotDuration;
        
        return blockStartMinutes < slotEndMinutes && blockEndMinutes > slotStartMinutes;
      });
      
      if (!isBookingBlocked && !isManualBlocked) {
        availableHours.push(timeSlot);
      }
    }
    
    return availableHours;
  }

  getReviews(trainerId: string): Review[] {
    return this.data.reviews.filter(review => review.trainerId === trainerId);
  }

  addTrainerReply(reviewId: string, comment: string): Review | null {
    const review = this.data.reviews.find(r => r.id === reviewId);
    if (review) {
      review.trainerReply = {
        comment,
        repliedAt: new Date().toISOString()
      };
      this.saveData();  
      return review;
    }
    return null;
  }

  updateBookingDateTime(bookingId: string, newDateTime: string): boolean {
    const booking = this.data.bookings.find(b => b.id === bookingId);
    if (booking) {
      booking.scheduledAt = newDateTime;
      this.saveData();
      return true;
    }
    return false;
  }

  // Dev methods
  resetData() {
    this.data = { ...seedData };
    this.saveData();
  }

  seedData() {
    this.resetData();
  }
}

export const dataStore = new DataStore();