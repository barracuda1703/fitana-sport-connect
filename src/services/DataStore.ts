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

  bookings: [
    {
      id: 'b-1',
      clientId: 'u-client1',
      trainerId: 't-1',
      serviceId: 'srv-1',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // tomorrow
      status: 'pending' as const,
      notes: 'Pierwszy trening',
      createdAt: new Date().toISOString(),
    },
  ],

  messages: [
    {
      id: 'm-1',
      chatId: 'chat-u-client1-t-1',
      senderId: 'u-client1',
      content: 'Cześć! Interesuje mnie trening personalny.',
      sentAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'm-2',
      chatId: 'chat-u-client1-t-1',
      senderId: 't-1',
      content: 'Witaj! Z chęcią Ci pomogę. Jakie masz cele treningowe?',
      sentAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ],
};

class DataStore {
  private storageKey = 'fitana-demo-data';
  private data: typeof seedData;

  constructor() {
    this.loadData();
  }

  private loadData() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        this.data = JSON.parse(stored);
      } catch {
        this.data = { ...seedData };
        this.saveData();
      }
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
    this.data.users.push(user as any);
    this.saveData();
    return user;
  }

  // Trainers
  getTrainers(): Trainer[] {
    return this.data.trainers;
  }

  getTrainer(id: string): Trainer | null {
    return this.data.trainers.find(t => t.id === id) || null;
  }

  // Sports
  getSports(): Sport[] {
    return this.data.sports;
  }

  // Bookings
  getBookings(userId: string): Booking[] {
    return this.data.bookings.filter(b => b.clientId === userId || b.trainerId === userId);
  }

  async createBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newBooking: Booking = {
      ...booking,
      id: `b-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    this.data.bookings.push(newBooking as any);
    this.saveData();
    return newBooking;
  }

  async updateBookingStatus(bookingId: string, status: Booking['status']): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const booking = this.data.bookings.find(b => b.id === bookingId);
    if (booking) {
      (booking as any).status = status;
      this.saveData();
    }
  }

  // Messages
  getMessages(chatId: string): Message[] {
    return this.data.messages.filter(m => m.chatId === chatId);
  }

  async sendMessage(message: Omit<Message, 'id' | 'sentAt'>): Promise<Message> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newMessage: Message = {
      ...message,
      id: `m-${Date.now()}`,
      sentAt: new Date().toISOString(),
    };
    this.data.messages.push(newMessage);
    this.saveData();
    return newMessage;
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