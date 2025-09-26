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
    {
      id: 't-4',
      userId: 'u-trainer4',
      name: 'Tomasz Zieliński',
      surname: 'Zieliński',
      rating: 4.7,
      reviewCount: 95,
      priceFrom: 75,
      distance: '0.8 km',
      specialties: ['Fitness', 'Siłownia'],
      isVerified: true,
      hasVideo: false,
      avatar: '👨‍💪',
      bio: 'Trener siłowy z 5-letnim doświadczeniem.',
      gender: 'male' as const,
      coordinates: { lat: 52.2320, lng: 21.0140 },
      services: [
        { id: 'srv-7', name: 'Trening siłowy', price: 75, duration: 60, type: 'gym' as const },
        { id: 'srv-8', name: 'Plan treningowy', price: 50, duration: 30, type: 'online' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '07:00', endTime: '19:00' },
        { dayOfWeek: 2, startTime: '07:00', endTime: '19:00' },
        { dayOfWeek: 3, startTime: '07:00', endTime: '19:00' },
        { dayOfWeek: 4, startTime: '07:00', endTime: '19:00' },
        { dayOfWeek: 5, startTime: '07:00', endTime: '19:00' },
        { dayOfWeek: 6, startTime: '08:00', endTime: '16:00' },
      ],
    },
    {
      id: 't-5',
      userId: 'u-trainer5',
      name: 'Magdalena Wójcik',
      surname: 'Wójcik',
      rating: 4.8,
      reviewCount: 143,
      priceFrom: 85,
      distance: '1.5 km',
      specialties: ['Fitness', 'Zumba'],
      isVerified: true,
      hasVideo: true,
      avatar: '👩‍🎯',
      bio: 'Instruktor fitness i zumby.',
      gender: 'female' as const,
      coordinates: { lat: 52.2380, lng: 21.0090 },
      services: [
        { id: 'srv-9', name: 'Fitness grupowy', price: 85, duration: 60, type: 'gym' as const },
        { id: 'srv-10', name: 'Zumba', price: 70, duration: 45, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '10:00', endTime: '20:00' },
        { dayOfWeek: 2, startTime: '10:00', endTime: '20:00' },
        { dayOfWeek: 3, startTime: '10:00', endTime: '20:00' },
        { dayOfWeek: 4, startTime: '10:00', endTime: '20:00' },
        { dayOfWeek: 5, startTime: '10:00', endTime: '20:00' },
      ],
    },
    {
      id: 't-6',
      userId: 'u-trainer6',
      name: 'Kamil Lewandowski',
      surname: 'Lewandowski',
      rating: 4.6,
      reviewCount: 76,
      priceFrom: 70,
      distance: '2.0 km',
      specialties: ['Fitness', 'Funkcjonalny'],
      isVerified: false,
      hasVideo: true,
      avatar: '👨‍🏋️',
      bio: 'Trener treningów funkcjonalnych.',
      gender: 'male' as const,
      coordinates: { lat: 52.2250, lng: 21.0180 },
      services: [
        { id: 'srv-11', name: 'Trening funkcjonalny', price: 70, duration: 60, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 2, startTime: '16:00', endTime: '21:00' },
        { dayOfWeek: 3, startTime: '16:00', endTime: '21:00' },
        { dayOfWeek: 4, startTime: '16:00', endTime: '21:00' },
        { dayOfWeek: 5, startTime: '16:00', endTime: '21:00' },
        { dayOfWeek: 6, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 0, startTime: '09:00', endTime: '17:00' },
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
    {
      id: 't-7',
      userId: 'u-trainer7',
      name: 'Paweł Kowalczyk',
      surname: 'Kowalczyk',
      rating: 4.9,
      reviewCount: 112,
      priceFrom: 95,
      distance: '1.8 km',
      specialties: ['Boks', 'MMA'],
      isVerified: true,
      hasVideo: true,
      avatar: '🥊',
      bio: 'Mistrz Polski w boksie, trener MMA.',
      gender: 'male' as const,
      coordinates: { lat: 52.2420, lng: 21.0200 },
      services: [
        { id: 'srv-12', name: 'Boks sportowy', price: 95, duration: 60, type: 'gym' as const },
        { id: 'srv-13', name: 'MMA dla początkujących', price: 100, duration: 90, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '18:00', endTime: '22:00' },
        { dayOfWeek: 2, startTime: '18:00', endTime: '22:00' },
        { dayOfWeek: 3, startTime: '18:00', endTime: '22:00' },
        { dayOfWeek: 4, startTime: '18:00', endTime: '22:00' },
        { dayOfWeek: 5, startTime: '18:00', endTime: '22:00' },
        { dayOfWeek: 6, startTime: '10:00', endTime: '18:00' },
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
    {
      id: 't-8',
      userId: 'u-trainer8',
      name: 'Joanna Mazur',
      surname: 'Mazur',
      rating: 4.9,
      reviewCount: 156,
      priceFrom: 90,
      distance: '1.7 km',
      specialties: ['Yoga', 'Medytacja'],
      isVerified: true,
      hasVideo: true,
      avatar: '🧘‍♀️',
      bio: 'Certyfikowana instruktor jogi z 10-letnim doświadczeniem.',
      gender: 'female' as const,
      coordinates: { lat: 52.2340, lng: 21.0070 },
      services: [
        { id: 'srv-14', name: 'Hatha Yoga', price: 90, duration: 90, type: 'online' as const },
        { id: 'srv-15', name: 'Vinyasa Yoga', price: 95, duration: 75, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '06:00', endTime: '12:00' },
        { dayOfWeek: 2, startTime: '06:00', endTime: '12:00' },
        { dayOfWeek: 3, startTime: '06:00', endTime: '12:00' },
        { dayOfWeek: 4, startTime: '06:00', endTime: '12:00' },
        { dayOfWeek: 5, startTime: '06:00', endTime: '12:00' },
        { dayOfWeek: 6, startTime: '07:00', endTime: '14:00' },
        { dayOfWeek: 0, startTime: '07:00', endTime: '14:00' },
      ],
    },
    // Running trainers
    {
      id: 't-9',
      userId: 'u-trainer9',
      name: 'Michał Dąbrowski',
      surname: 'Dąbrowski',
      rating: 4.7,
      reviewCount: 88,
      priceFrom: 60,
      distance: '1.0 km',
      specialties: ['Bieganie', 'Maraton'],
      isVerified: true,
      hasVideo: false,
      avatar: '🏃‍♂️',
      bio: 'Maratończyk, trener biegowy.',
      gender: 'male' as const,
      coordinates: { lat: 52.2280, lng: 21.0160 },
      services: [
        { id: 'srv-16', name: 'Trening biegowy', price: 60, duration: 60, type: 'home_visit' as const },
        { id: 'srv-17', name: 'Plan treningowy na maraton', price: 150, duration: 120, type: 'online' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '06:00', endTime: '10:00' },
        { dayOfWeek: 2, startTime: '06:00', endTime: '10:00' },
        { dayOfWeek: 3, startTime: '06:00', endTime: '10:00' },
        { dayOfWeek: 4, startTime: '06:00', endTime: '10:00' },
        { dayOfWeek: 5, startTime: '06:00', endTime: '10:00' },
        { dayOfWeek: 6, startTime: '06:00', endTime: '12:00' },
        { dayOfWeek: 0, startTime: '06:00', endTime: '12:00' },
      ],
    },
    // Tennis trainers
    {
      id: 't-10',
      userId: 'u-trainer10',
      name: 'Agnieszka Król',
      surname: 'Król',
      rating: 4.8,
      reviewCount: 134,
      priceFrom: 120,
      distance: '2.5 km',
      specialties: ['Tenis', 'Kort'],
      isVerified: true,
      hasVideo: true,
      avatar: '🎾',
      bio: 'Była zawodniczka tenisa, trenuje od 12 lat.',
      gender: 'female' as const,
      coordinates: { lat: 52.2450, lng: 21.0220 },
      services: [
        { id: 'srv-18', name: 'Lekcja tenisa', price: 120, duration: 60, type: 'court' as const },
        { id: 'srv-19', name: 'Tenis dla dzieci', price: 100, duration: 45, type: 'court' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 6, startTime: '08:00', endTime: '16:00' },
        { dayOfWeek: 0, startTime: '08:00', endTime: '16:00' },
      ],
    },
    // Swimming trainers
    {
      id: 't-11',
      userId: 'u-trainer11',
      name: 'Łukasz Górski',
      surname: 'Górski',
      rating: 4.9,
      reviewCount: 167,
      priceFrom: 110,
      distance: '3.0 km',
      specialties: ['Pływanie', 'Basen'],
      isVerified: true,
      hasVideo: false,
      avatar: '🏊‍♂️',
      bio: 'Były pływak reprezentacyjny, trener pływania.',
      gender: 'male' as const,
      coordinates: { lat: 52.2180, lng: 21.0050 },
      services: [
        { id: 'srv-20', name: 'Nauka pływania', price: 110, duration: 60, type: 'gym' as const },
        { id: 'srv-21', name: 'Pływanie sportowe', price: 130, duration: 90, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '07:00', endTime: '21:00' },
        { dayOfWeek: 2, startTime: '07:00', endTime: '21:00' },
        { dayOfWeek: 3, startTime: '07:00', endTime: '21:00' },
        { dayOfWeek: 4, startTime: '07:00', endTime: '21:00' },
        { dayOfWeek: 5, startTime: '07:00', endTime: '21:00' },
        { dayOfWeek: 6, startTime: '08:00', endTime: '20:00' },
        { dayOfWeek: 0, startTime: '08:00', endTime: '20:00' },
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

  // Availability methods
  getAvailableDates(trainerId: string, serviceDuration: number): string[] {
    const trainer = this.getTrainer(trainerId);
    if (!trainer) return [];

    const availableDates: string[] = [];
    const today = new Date();
    
    // Check next 30 days
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
          const bookingTime = `${bookingDate.getHours().toString().padStart(2, '0')}:${bookingDate.getMinutes().toString().padStart(2, '0')}`;
          
          return bookingDateStr === date && bookingTime === timeSlot;
        });
      
      if (!isBooked) {
        availableHours.push(timeSlot);
      }
    }
    
    return availableHours;
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