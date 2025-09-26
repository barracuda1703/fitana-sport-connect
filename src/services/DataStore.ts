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
  locations: Array<{
    id: string;
    name: string;
    address: string;
    coordinates: { lat: number; lng: number };
    radius: number;
  }>;
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

// Comprehensive seed data with 5+ trainers per discipline
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
    { id: 'u-client2', role: 'client' as const, email: 'client2@test.com', password: 'demo123', name: 'Michał', city: 'Warszawa', language: 'pl' },
    { id: 'u-client3', role: 'client' as const, email: 'client3@test.com', password: 'demo123', name: 'Agata', city: 'Warszawa', language: 'pl' },
    
    // Fitness trainers
    { id: 'u-trainer1', role: 'trainer' as const, email: 'anna.kowalska@fit.com', password: 'demo123', name: 'Anna', surname: 'Kowalska', language: 'pl' },
    { id: 'u-trainer2', role: 'trainer' as const, email: 'piotr.nowak@fit.com', password: 'demo123', name: 'Piotr', surname: 'Nowak', language: 'pl' },
    { id: 'u-trainer3', role: 'trainer' as const, email: 'karolina.zielinska@fit.com', password: 'demo123', name: 'Karolina', surname: 'Zielińska', language: 'pl' },
    { id: 'u-trainer4', role: 'trainer' as const, email: 'tomasz.wojcik@fit.com', password: 'demo123', name: 'Tomasz', surname: 'Wójcik', language: 'pl' },
    { id: 'u-trainer5', role: 'trainer' as const, email: 'magdalena.kaczmarek@fit.com', password: 'demo123', name: 'Magdalena', surname: 'Kaczmarek', language: 'pl' },
    
    // Yoga trainers  
    { id: 'u-trainer6', role: 'trainer' as const, email: 'ewa.wisniowska@yoga.com', password: 'demo123', name: 'Ewa', surname: 'Wiśniowska', language: 'pl' },
    { id: 'u-trainer7', role: 'trainer' as const, email: 'patrycja.kowalczyk@yoga.com', password: 'demo123', name: 'Patrycja', surname: 'Kowalczyk', language: 'pl' },
    { id: 'u-trainer8', role: 'trainer' as const, email: 'marta.kaminska@yoga.com', password: 'demo123', name: 'Marta', surname: 'Kamińska', language: 'pl' },
    { id: 'u-trainer9', role: 'trainer' as const, email: 'aleksandra.lewandowska@yoga.com', password: 'demo123', name: 'Aleksandra', surname: 'Lewandowska', language: 'pl' },
    { id: 'u-trainer10', role: 'trainer' as const, email: 'natalia.dabrowska@yoga.com', password: 'demo123', name: 'Natalia', surname: 'Dąbrowska', language: 'pl' },
    
    // Running trainers
    { id: 'u-trainer11', role: 'trainer' as const, email: 'marek.szymanski@run.com', password: 'demo123', name: 'Marek', surname: 'Szymański', language: 'pl' },
    { id: 'u-trainer12', role: 'trainer' as const, email: 'jakub.wolski@run.com', password: 'demo123', name: 'Jakub', surname: 'Wolski', language: 'pl' },
    { id: 'u-trainer13', role: 'trainer' as const, email: 'anna.mazurek@run.com', password: 'demo123', name: 'Anna', surname: 'Mazurek', language: 'pl' },
    { id: 'u-trainer14', role: 'trainer' as const, email: 'bartosz.jankowski@run.com', password: 'demo123', name: 'Bartosz', surname: 'Jankowski', language: 'pl' },
    { id: 'u-trainer15', role: 'trainer' as const, email: 'joanna.kwiatkowska@run.com', password: 'demo123', name: 'Joanna', surname: 'Kwiatkowska', language: 'pl' },
    
    // Boxing trainers
    { id: 'u-trainer16', role: 'trainer' as const, email: 'adrian.kozlowski@box.com', password: 'demo123', name: 'Adrian', surname: 'Kozłowski', language: 'pl' },
    { id: 'u-trainer17', role: 'trainer' as const, email: 'michal.jaworski@box.com', password: 'demo123', name: 'Michał', surname: 'Jaworski', language: 'pl' },
    { id: 'u-trainer18', role: 'trainer' as const, email: 'sebastian.majewski@box.com', password: 'demo123', name: 'Sebastian', surname: 'Majewski', language: 'pl' },
    { id: 'u-trainer19', role: 'trainer' as const, email: 'katarzyna.olszewska@box.com', password: 'demo123', name: 'Katarzyna', surname: 'Olszewska', language: 'pl' },
    { id: 'u-trainer20', role: 'trainer' as const, email: 'dawid.stepien@box.com', password: 'demo123', name: 'Dawid', surname: 'Stępień', language: 'pl' },
    
    // Swimming trainers
    { id: 'u-trainer21', role: 'trainer' as const, email: 'paulina.nowakowska@swim.com', password: 'demo123', name: 'Paulina', surname: 'Nowakowska', language: 'pl' },
    { id: 'u-trainer22', role: 'trainer' as const, email: 'krzysztof.pawlak@swim.com', password: 'demo123', name: 'Krzysztof', surname: 'Pawlak', language: 'pl' },
    { id: 'u-trainer23', role: 'trainer' as const, email: 'monika.michalska@swim.com', password: 'demo123', name: 'Monika', surname: 'Michalska', language: 'pl' },
    { id: 'u-trainer24', role: 'trainer' as const, email: 'robert.kowalski@swim.com', password: 'demo123', name: 'Robert', surname: 'Kowalski', language: 'pl' },
    { id: 'u-trainer25', role: 'trainer' as const, email: 'agnieszka.zajac@swim.com', password: 'demo123', name: 'Agnieszka', surname: 'Zając', language: 'pl' },
    
    // Tennis trainers
    { id: 'u-trainer26', role: 'trainer' as const, email: 'lukasz.adamski@tennis.com', password: 'demo123', name: 'Łukasz', surname: 'Adamski', language: 'pl' },
    { id: 'u-trainer27', role: 'trainer' as const, email: 'julia.wrobel@tennis.com', password: 'demo123', name: 'Julia', surname: 'Wróbel', language: 'pl' },
    { id: 'u-trainer28', role: 'trainer' as const, email: 'marcin.sikora@tennis.com', password: 'demo123', name: 'Marcin', surname: 'Sikora', language: 'pl' },
    { id: 'u-trainer29', role: 'trainer' as const, email: 'izabela.baran@tennis.com', password: 'demo123', name: 'Izabela', surname: 'Baran', language: 'pl' },
    { id: 'u-trainer30', role: 'trainer' as const, email: 'kamil.rutkowski@tennis.com', password: 'demo123', name: 'Kamil', surname: 'Rutkowski', language: 'pl' },
  ],

  trainers: [
    // FITNESS TRAINERS (5)
    {
      id: 't-1', userId: 'u-trainer1', name: 'Anna', surname: 'Kowalska', rating: 4.9, reviewCount: 127, priceFrom: 80, distance: '0.5 km',
      specialties: ['Fitness', 'Siłownia'], isVerified: true, hasVideo: true, avatar: '👩‍🦰', gender: 'female' as const,
      bio: 'Certyfikowana trenerka fitness z 8-letnim doświadczeniem. Specjalizuję się w treningach siłowych i funkcjonalnych.',
      locations: [
        {
          id: 'loc-t1-1',
          name: 'Fitness Club Centrum',
          address: 'ul. Marszałkowska 10, 00-001 Warszawa',
          coordinates: { lat: 52.2297, lng: 21.0122 },
          radius: 2
        },
        {
          id: 'loc-t1-2',
          name: 'Siłownia Premium',
          address: 'ul. Nowy Świat 15, 00-029 Warszawa',
          coordinates: { lat: 52.2320, lng: 21.0190 },
          radius: 1.5
        }
      ],
      services: [
        { id: 'srv-1', name: 'Trening personalny', price: 80, duration: 60, type: 'gym' as const },
        { id: 'srv-2', name: 'Konsultacja online', price: 50, duration: 45, type: 'online' as const },
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
      id: 't-2', userId: 'u-trainer2', name: 'Piotr', surname: 'Nowak', rating: 4.7, reviewCount: 95, priceFrom: 90, distance: '1.2 km',
      specialties: ['Fitness', 'Kulturystyka'], isVerified: true, hasVideo: false, avatar: '👨‍💼', gender: 'male' as const,
      bio: 'Mistrz Polski w kulturystyce. Pomagam osiągnąć wymarzoną sylwetkę poprzez spersonalizowane treningi.',
      locations: [
        {
          id: 'loc-t2-1',
          name: 'Gold Gym Warszawa',
          address: 'ul. Krakowskie Przedmieście 5, 00-068 Warszawa',
          coordinates: { lat: 52.2350, lng: 21.0103 },
          radius: 3
        }
      ],
      services: [
        { id: 'srv-3', name: 'Trening budowania masy', price: 90, duration: 75, type: 'gym' as const },
        { id: 'srv-4', name: 'Plan treningowy', price: 120, duration: 60, type: 'online' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '06:00', endTime: '14:00' },
        { dayOfWeek: 2, startTime: '06:00', endTime: '14:00' },
        { dayOfWeek: 3, startTime: '06:00', endTime: '14:00' },
        { dayOfWeek: 4, startTime: '06:00', endTime: '14:00' },
        { dayOfWeek: 5, startTime: '06:00', endTime: '14:00' },
        { dayOfWeek: 6, startTime: '08:00', endTime: '12:00' },
      ],
    },
    {
      id: 't-3', userId: 'u-trainer3', name: 'Karolina', surname: 'Zielińska', rating: 4.8, reviewCount: 156, priceFrom: 75, distance: '2.1 km',
      specialties: ['Fitness', 'Crossfit'], isVerified: true, hasVideo: true, avatar: '👩‍🎓', gender: 'female' as const,
      bio: 'Trenerka crossfit z passion. Uwielbiam intensywne treningi i motywowanie do przekraczania granic.',
      coordinates: { lat: 52.2180, lng: 21.0040 },
      services: [
        { id: 'srv-5', name: 'Crossfit', price: 75, duration: 60, type: 'gym' as const },
        { id: 'srv-6', name: 'Trening funkcjonalny', price: 70, duration: 45, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '16:00', endTime: '21:00' },
        { dayOfWeek: 2, startTime: '16:00', endTime: '21:00' },
        { dayOfWeek: 3, startTime: '16:00', endTime: '21:00' },
        { dayOfWeek: 4, startTime: '16:00', endTime: '21:00' },
        { dayOfWeek: 5, startTime: '16:00', endTime: '21:00' },
      ],
    },
    {
      id: 't-4', userId: 'u-trainer4', name: 'Tomasz', surname: 'Wójcik', rating: 4.6, reviewCount: 78, priceFrom: 85, distance: '3.5 km',
      specialties: ['Fitness', 'Rehabilitacja'], isVerified: false, hasVideo: true, avatar: '👨‍⚕️', gender: 'male' as const,
      bio: 'Fizjoterapeuta i trener personalny. Łączę wiedzę medyczną z treningiem dla maksymalnych efektów.',
      coordinates: { lat: 52.2500, lng: 21.0200 },
      services: [
        { id: 'srv-7', name: 'Trening rehabilitacyjny', price: 85, duration: 60, type: 'gym' as const },
        { id: 'srv-8', name: 'Korekcja postawy', price: 95, duration: 75, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 2, startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 4, startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 6, startTime: '09:00', endTime: '15:00' },
      ],
    },
    {
      id: 't-5', userId: 'u-trainer5', name: 'Magdalena', surname: 'Kaczmarek', rating: 4.9, reviewCount: 203, priceFrom: 95, distance: '1.8 km',
      specialties: ['Fitness', 'TRX'], isVerified: true, hasVideo: true, avatar: '👩‍🏫', gender: 'female' as const,
      bio: 'Ekspertka TRX z międzynarodowymi certyfikatami. Tworzę wyzwania dla każdego poziomu zaawansowania.',
      coordinates: { lat: 52.2400, lng: 21.0080 },
      services: [
        { id: 'srv-9', name: 'Trening TRX', price: 95, duration: 60, type: 'gym' as const },
        { id: 'srv-10', name: 'Trening z ciężarem ciała', price: 80, duration: 45, type: 'home_visit' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '07:00', endTime: '15:00' },
        { dayOfWeek: 3, startTime: '07:00', endTime: '15:00' },
        { dayOfWeek: 5, startTime: '07:00', endTime: '15:00' },
        { dayOfWeek: 6, startTime: '09:00', endTime: '13:00' },
      ],
    },

    // YOGA TRAINERS (5)
    {
      id: 't-6', userId: 'u-trainer6', name: 'Ewa', surname: 'Wiśniowska', rating: 5.0, reviewCount: 189, priceFrom: 70, distance: '2.0 km',
      specialties: ['Yoga', 'Pilates'], isVerified: true, hasVideo: true, avatar: '👩‍🦱', gender: 'female' as const,
      bio: 'Instruktorka jogi z 10-letnim doświadczeniem. Specjalizuję się w Hatha i Vinyasa yoga.',
      coordinates: { lat: 52.2400, lng: 21.0150 },
      services: [
        { id: 'srv-11', name: 'Yoga Hatha', price: 70, duration: 90, type: 'gym' as const },
        { id: 'srv-12', name: 'Yoga online', price: 50, duration: 60, type: 'online' as const },
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
      id: 't-7', userId: 'u-trainer7', name: 'Patrycja', surname: 'Kowalczyk', rating: 4.8, reviewCount: 134, priceFrom: 80, distance: '1.5 km',
      specialties: ['Yoga', 'Medytacja'], isVerified: true, hasVideo: true, avatar: '👩‍💆', gender: 'female' as const,
      bio: 'Certyfikowana nauczycielka jogi i medytacji mindfulness. Pomagam znaleźć równowagę ciała i umysłu.',
      coordinates: { lat: 52.2250, lng: 21.0300 },
      services: [
        { id: 'srv-13', name: 'Yoga Vinyasa', price: 80, duration: 75, type: 'gym' as const },
        { id: 'srv-14', name: 'Medytacja grupowa', price: 40, duration: 45, type: 'online' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '17:00', endTime: '21:00' },
        { dayOfWeek: 3, startTime: '17:00', endTime: '21:00' },
        { dayOfWeek: 5, startTime: '17:00', endTime: '21:00' },
        { dayOfWeek: 6, startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 0, startTime: '10:00', endTime: '15:00' },
      ],
    },
    {
      id: 't-8', userId: 'u-trainer8', name: 'Marta', surname: 'Kamińska', rating: 4.7, reviewCount: 98, priceFrom: 75, distance: '2.8 km',
      specialties: ['Yoga', 'Stretching'], isVerified: false, hasVideo: false, avatar: '👩‍🎨', gender: 'female' as const,
      bio: 'Pasjonatka jogi i rozciągania. Prowadzę klasy dla początkujących i zaawansowanych.',
      coordinates: { lat: 52.2100, lng: 21.0250 },
      services: [
        { id: 'srv-15', name: 'Yoga dla początkujących', price: 75, duration: 60, type: 'gym' as const },
        { id: 'srv-16', name: 'Deep stretching', price: 65, duration: 45, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 6, startTime: '09:00', endTime: '15:00' },
      ],
    },
    {
      id: 't-9', userId: 'u-trainer9', name: 'Aleksandra', surname: 'Lewandowska', rating: 4.9, reviewCount: 167, priceFrom: 85, distance: '3.2 km',
      specialties: ['Yoga', 'Pilates'], isVerified: true, hasVideo: true, avatar: '👩‍🌾', gender: 'female' as const,
      bio: 'Instruktorka z certyfikatem Yoga Alliance. Łączę tradycyjną jogę z nowoczesnymi technikami pilates.',
      coordinates: { lat: 52.2600, lng: 21.0100 },
      services: [
        { id: 'srv-17', name: 'Yoga-Pilates fusion', price: 85, duration: 75, type: 'gym' as const },
        { id: 'srv-18', name: 'Power Yoga', price: 90, duration: 60, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '06:30', endTime: '14:30' },
        { dayOfWeek: 3, startTime: '06:30', endTime: '14:30' },
        { dayOfWeek: 5, startTime: '06:30', endTime: '14:30' },
      ],
    },
    {
      id: 't-10', userId: 'u-trainer10', name: 'Natalia', surname: 'Dąbrowska', rating: 4.6, reviewCount: 76, priceFrom: 65, distance: '4.1 km',
      specialties: ['Yoga', 'Relaks'], isVerified: false, hasVideo: true, avatar: '👩‍🎤', gender: 'female' as const,
      bio: 'Młoda instruktorka jogi z fresh podejściem. Specjalizuję się w jodze relaksacyjnej i yin yoga.',
      coordinates: { lat: 52.1950, lng: 21.0350 },
      services: [
        { id: 'srv-19', name: 'Yin Yoga', price: 65, duration: 90, type: 'gym' as const },
        { id: 'srv-20', name: 'Yoga nidra', price: 55, duration: 60, type: 'online' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '18:00', endTime: '21:00' },
        { dayOfWeek: 2, startTime: '18:00', endTime: '21:00' },
        { dayOfWeek: 3, startTime: '18:00', endTime: '21:00' },
        { dayOfWeek: 4, startTime: '18:00', endTime: '21:00' },
        { dayOfWeek: 0, startTime: '16:00', endTime: '20:00' },
      ],
    },

    // RUNNING TRAINERS (5)
    {
      id: 't-11', userId: 'u-trainer11', name: 'Marek', surname: 'Szymański', rating: 4.8, reviewCount: 112, priceFrom: 60, distance: '1.3 km',
      specialties: ['Bieganie', 'Maraton'], isVerified: true, hasVideo: true, avatar: '👨‍🏃', gender: 'male' as const,
      bio: 'Maratończyk z 15-letnim doświadczeniem. Przygotowuję do biegów na każdym dystansie.',
      coordinates: { lat: 52.2320, lng: 21.0180 },
      services: [
        { id: 'srv-21', name: 'Trening biegowy', price: 60, duration: 60, type: 'home_visit' as const },
        { id: 'srv-22', name: 'Plan treningowy na maraton', price: 150, duration: 90, type: 'online' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '06:00', endTime: '09:00' },
        { dayOfWeek: 2, startTime: '06:00', endTime: '09:00' },
        { dayOfWeek: 3, startTime: '06:00', endTime: '09:00' },
        { dayOfWeek: 4, startTime: '06:00', endTime: '09:00' },
        { dayOfWeek: 5, startTime: '06:00', endTime: '09:00' },
        { dayOfWeek: 6, startTime: '07:00', endTime: '12:00' },
        { dayOfWeek: 0, startTime: '07:00', endTime: '12:00' },
      ],
    },
    {
      id: 't-12', userId: 'u-trainer12', name: 'Jakub', surname: 'Wolski', rating: 4.7, reviewCount: 89, priceFrom: 55, distance: '2.7 km',
      specialties: ['Bieganie', 'Triathlon'], isVerified: true, hasVideo: false, avatar: '👨‍🚴', gender: 'male' as const,
      bio: 'Triatlonista i trener biegowy. Specjalizuję się w technice biegu i przygotowaniu do zawodów.',
      coordinates: { lat: 52.2150, lng: 21.0320 },
      services: [
        { id: 'srv-23', name: 'Analiza techniki biegu', price: 80, duration: 75, type: 'home_visit' as const },
        { id: 'srv-24', name: 'Trening interwałowy', price: 55, duration: 45, type: 'home_visit' as const },
      ],
      availability: [
        { dayOfWeek: 2, startTime: '17:00', endTime: '20:00' },
        { dayOfWeek: 4, startTime: '17:00', endTime: '20:00' },
        { dayOfWeek: 6, startTime: '08:00', endTime: '16:00' },
        { dayOfWeek: 0, startTime: '08:00', endTime: '16:00' },
      ],
    },
    {
      id: 't-13', userId: 'u-trainer13', name: 'Anna', surname: 'Mazurek', rating: 4.9, reviewCount: 145, priceFrom: 65, distance: '1.9 km',
      specialties: ['Bieganie', 'Nordic Walking'], isVerified: true, hasVideo: true, avatar: '👩‍🏃', gender: 'female' as const,
      bio: 'Biegaczka górska i instruktorka nordic walking. Pokażę Ci piękno biegania w każdych warunkach.',
      coordinates: { lat: 52.2450, lng: 21.0050 },
      services: [
        { id: 'srv-25', name: 'Bieganie terenowe', price: 65, duration: 90, type: 'home_visit' as const },
        { id: 'srv-26', name: 'Nordic Walking', price: 50, duration: 60, type: 'home_visit' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '07:00', endTime: '10:00' },
        { dayOfWeek: 3, startTime: '07:00', endTime: '10:00' },
        { dayOfWeek: 5, startTime: '07:00', endTime: '10:00' },
        { dayOfWeek: 6, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 0, startTime: '09:00', endTime: '17:00' },
      ],
    },
    {
      id: 't-14', userId: 'u-trainer14', name: 'Bartosz', surname: 'Jankowski', rating: 4.5, reviewCount: 67, priceFrom: 70, distance: '3.8 km',
      specialties: ['Bieganie', 'Kondycja'], isVerified: false, hasVideo: true, avatar: '👨‍💻', gender: 'male' as const,
      bio: 'Były zawodnik lekkoatletyczny. Pomagam poprawić kondycję i osiągnąć cele biegowe.',
      coordinates: { lat: 52.2050, lng: 21.0280 },
      services: [
        { id: 'srv-27', name: 'Trening kondycyjny dla biegaczy', price: 70, duration: 60, type: 'gym' as const },
        { id: 'srv-28', name: 'Przygotowanie do 5K/10K', price: 90, duration: 75, type: 'online' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '18:00', endTime: '21:00' },
        { dayOfWeek: 3, startTime: '18:00', endTime: '21:00' },
        { dayOfWeek: 5, startTime: '18:00', endTime: '21:00' },
      ],
    },
    {
      id: 't-15', userId: 'u-trainer15', name: 'Joanna', surname: 'Kwiatkowska', rating: 4.8, reviewCount: 156, priceFrom: 75, distance: '2.3 km',
      specialties: ['Bieganie', 'Fitness'], isVerified: true, hasVideo: true, avatar: '👩‍⚕️', gender: 'female' as const,
      bio: 'Fizjoterapeutka i biegaczka. Łączę trening biegowy z pracą nad mobilnością i profilaktyką urazów.',
      coordinates: { lat: 52.2380, lng: 21.0220 },
      services: [
        { id: 'srv-29', name: 'Bieganie + stretching', price: 75, duration: 75, type: 'home_visit' as const },
        { id: 'srv-30', name: 'Profilaktyka urazów biegacza', price: 85, duration: 60, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 2, startTime: '07:00', endTime: '11:00' },
        { dayOfWeek: 4, startTime: '07:00', endTime: '11:00' },
        { dayOfWeek: 6, startTime: '10:00', endTime: '16:00' },
      ],
    },

    // BOXING TRAINERS (5)
    {
      id: 't-16', userId: 'u-trainer16', name: 'Adrian', surname: 'Kozłowski', rating: 4.9, reviewCount: 203, priceFrom: 90, distance: '1.1 km',
      specialties: ['Boks', 'MMA'], isVerified: true, hasVideo: true, avatar: '👨‍🥊', gender: 'male' as const,
      bio: 'Były zawodnik MMA i mistrz boksu. Uczę techniki, taktyki i mentalności zwycięzcy.',
      coordinates: { lat: 52.2280, lng: 21.0160 },
      services: [
        { id: 'srv-31', name: 'Trening boksu', price: 90, duration: 60, type: 'gym' as const },
        { id: 'srv-32', name: 'Techniki MMA', price: 110, duration: 75, type: 'gym' as const },
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
      id: 't-17', userId: 'u-trainer17', name: 'Michał', surname: 'Jaworski', rating: 4.6, reviewCount: 134, priceFrom: 80, distance: '2.4 km',
      specialties: ['Boks', 'Kickboxing'], isVerified: true, hasVideo: false, avatar: '👨‍⚔️', gender: 'male' as const,
      bio: 'Instruktor boksu i kickboxingu. Prowadzę treningi od podstaw do poziomu zawodowego.',
      coordinates: { lat: 52.2420, lng: 21.0090 },
      services: [
        { id: 'srv-33', name: 'Kickboxing', price: 80, duration: 60, type: 'gym' as const },
        { id: 'srv-34', name: 'Boks dla kobiet', price: 85, duration: 45, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '16:00', endTime: '21:00' },
        { dayOfWeek: 3, startTime: '16:00', endTime: '21:00' },
        { dayOfWeek: 5, startTime: '16:00', endTime: '21:00' },
        { dayOfWeek: 6, startTime: '10:00', endTime: '18:00' },
      ],
    },
    {
      id: 't-18', userId: 'u-trainer18', name: 'Sebastian', surname: 'Majewski', rating: 4.7, reviewCount: 98, priceFrom: 95, distance: '3.0 km',
      specialties: ['Boks', 'Crossfit'], isVerified: false, hasVideo: true, avatar: '👨‍🎓', gender: 'male' as const,
      bio: 'Trener crossfitu z elementami boksu. Tworzę intensywne treningi łączące siłę, kondycję i technikę.',
      coordinates: { lat: 52.2120, lng: 21.0370 },
      services: [
        { id: 'srv-35', name: 'Boxing crossfit', price: 95, duration: 60, type: 'gym' as const },
        { id: 'srv-36', name: 'Trening kondycyjny', price: 75, duration: 45, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 2, startTime: '06:00', endTime: '14:00' },
        { dayOfWeek: 4, startTime: '06:00', endTime: '14:00' },
        { dayOfWeek: 6, startTime: '08:00', endTime: '16:00' },
      ],
    },
    {
      id: 't-19', userId: 'u-trainer19', name: 'Katarzyna', surname: 'Olszewska', rating: 4.8, reviewCount: 145, priceFrom: 85, distance: '2.9 km',
      specialties: ['Boks', 'Samoobrona'], isVerified: true, hasVideo: true, avatar: '👩‍🥋', gender: 'female' as const,
      bio: 'Pierwsza kobieta-trenerka boksu w klubie. Specjalizuję się w samoobronie i boksie dla kobiet.',
      coordinates: { lat: 52.2550, lng: 21.0180 },
      services: [
        { id: 'srv-37', name: 'Samoobrona dla kobiet', price: 85, duration: 60, type: 'gym' as const },
        { id: 'srv-38', name: 'Boks terapeutyczny', price: 90, duration: 75, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '17:00', endTime: '21:00' },
        { dayOfWeek: 3, startTime: '17:00', endTime: '21:00' },
        { dayOfWeek: 5, startTime: '17:00', endTime: '21:00' },
        { dayOfWeek: 0, startTime: '11:00', endTime: '17:00' },
      ],
    },
    {
      id: 't-20', userId: 'u-trainer20', name: 'Dawid', surname: 'Stępień', rating: 4.5, reviewCount: 87, priceFrom: 70, distance: '4.2 km',
      specialties: ['Boks', 'Fitness'], isVerified: false, hasVideo: false, avatar: '👨‍🏋️', gender: 'male' as const,
      bio: 'Młody zawodnik boksu z pasją do nauczania. Łączę trening bokserski z elementami fitness.',
      coordinates: { lat: 52.1980, lng: 21.0400 },
      services: [
        { id: 'srv-39', name: 'Boks dla początkujących', price: 70, duration: 60, type: 'gym' as const },
        { id: 'srv-40', name: 'Cardio boxing', price: 65, duration: 45, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '18:00', endTime: '22:00' },
        { dayOfWeek: 2, startTime: '18:00', endTime: '22:00' },
        { dayOfWeek: 4, startTime: '18:00', endTime: '22:00' },
        { dayOfWeek: 5, startTime: '18:00', endTime: '22:00' },
      ],
    },

    // SWIMMING TRAINERS (5)
    {
      id: 't-21', userId: 'u-trainer21', name: 'Paulina', surname: 'Nowakowska', rating: 4.9, reviewCount: 167, priceFrom: 80, distance: '1.6 km',
      specialties: ['Pływanie', 'Aqua aerobik'], isVerified: true, hasVideo: true, avatar: '👩‍🏊', gender: 'female' as const,
      bio: 'Była pływaczka reprezentacyjna. Uczę wszystkich stylów pływackich od podstaw do perfekcji.',
      coordinates: { lat: 52.2340, lng: 21.0140 },
      services: [
        { id: 'srv-41', name: 'Nauka pływania', price: 80, duration: 60, type: 'gym' as const },
        { id: 'srv-42', name: 'Doskonalenie techniki', price: 90, duration: 45, type: 'gym' as const },
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
      id: 't-22', userId: 'u-trainer22', name: 'Krzysztof', surname: 'Pawlak', rating: 4.7, reviewCount: 123, priceFrom: 75, distance: '2.8 km',
      specialties: ['Pływanie', 'Triathlon'], isVerified: true, hasVideo: false, avatar: '👨‍🏊', gender: 'male' as const,
      bio: 'Trener triathlonu z ukończonymi Ironmanami. Przygotowuję do zawodów pływackich i triatlonowych.',
      coordinates: { lat: 52.2180, lng: 21.0310 },
      services: [
        { id: 'srv-43', name: 'Trening triatlonowy', price: 100, duration: 90, type: 'gym' as const },
        { id: 'srv-44', name: 'Pływanie długodystansowe', price: 75, duration: 75, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 2, startTime: '06:00', endTime: '10:00' },
        { dayOfWeek: 4, startTime: '06:00', endTime: '10:00' },
        { dayOfWeek: 6, startTime: '07:00', endTime: '15:00' },
        { dayOfWeek: 0, startTime: '07:00', endTime: '15:00' },
      ],
    },
    {
      id: 't-23', userId: 'u-trainer23', name: 'Monika', surname: 'Michalska', rating: 4.8, reviewCount: 189, priceFrom: 70, distance: '3.5 km',
      specialties: ['Pływanie', 'Rehabilitacja'], isVerified: true, hasVideo: true, avatar: '👩‍⚕️', gender: 'female' as const,
      bio: 'Fizjoterapeutka specjalizująca się w rehabilitacji w wodzie. Pomagam wrócić do formy po urazach.',
      coordinates: { lat: 52.2500, lng: 21.0060 },
      services: [
        { id: 'srv-45', name: 'Rehabilitacja w wodzie', price: 90, duration: 60, type: 'gym' as const },
        { id: 'srv-46', name: 'Aqua fitness', price: 70, duration: 45, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
      ],
    },
    {
      id: 't-24', userId: 'u-trainer24', name: 'Robert', surname: 'Kowalski', rating: 4.6, reviewCount: 98, priceFrom: 85, distance: '1.4 km',
      specialties: ['Pływanie', 'Ratownictwo'], isVerified: false, hasVideo: true, avatar: '👨‍🚒', gender: 'male' as const,
      bio: 'Ratownik wodny z 12-letnim stażem. Uczę pływania z naciskiem na bezpieczeństwo.',
      coordinates: { lat: 52.2260, lng: 21.0200 },
      services: [
        { id: 'srv-47', name: 'Pływanie dla dorosłych', price: 85, duration: 60, type: 'gym' as const },
        { id: 'srv-48', name: 'Kurs ratownictwa', price: 120, duration: 90, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 2, startTime: '16:00', endTime: '21:00' },
        { dayOfWeek: 4, startTime: '16:00', endTime: '21:00' },
        { dayOfWeek: 6, startTime: '09:00', endTime: '18:00' },
      ],
    },
    {
      id: 't-25', userId: 'u-trainer25', name: 'Agnieszka', surname: 'Zając', rating: 4.9, reviewCount: 234, priceFrom: 95, distance: '2.1 km',
      specialties: ['Pływanie', 'Masters'], isVerified: true, hasVideo: true, avatar: '👩‍🏆', gender: 'female' as const,
      bio: 'Mistrzyni Masters w pływaniu. Specjalizuję się w treningu zawodników masters i weteranów.',
      coordinates: { lat: 52.2430, lng: 21.0110 },
      services: [
        { id: 'srv-49', name: 'Trening masters', price: 95, duration: 75, type: 'gym' as const },
        { id: 'srv-50', name: 'Analiza techniki pływania', price: 110, duration: 60, type: 'gym' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '05:30', endTime: '08:30' },
        { dayOfWeek: 3, startTime: '05:30', endTime: '08:30' },
        { dayOfWeek: 5, startTime: '05:30', endTime: '08:30' },
        { dayOfWeek: 6, startTime: '07:00', endTime: '12:00' },
      ],
    },

    // TENNIS TRAINERS (5)  
    {
      id: 't-26', userId: 'u-trainer26', name: 'Łukasz', surname: 'Adamski', rating: 4.8, reviewCount: 156, priceFrom: 100, distance: '2.0 km',
      specialties: ['Tenis', 'Tenis stołowy'], isVerified: true, hasVideo: true, avatar: '👨‍🎾', gender: 'male' as const,
      bio: 'Były zawodnik ATP z doświadczeniem międzynarodowym. Uczę techniki i taktyki gry na najwyższym poziomie.',
      coordinates: { lat: 52.2360, lng: 21.0190 },
      services: [
        { id: 'srv-51', name: 'Lekcja tenisa', price: 100, duration: 60, type: 'court' as const },
        { id: 'srv-52', name: 'Analiza gry wideo', price: 120, duration: 75, type: 'court' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' },
        { dayOfWeek: 6, startTime: '08:00', endTime: '16:00' },
        { dayOfWeek: 0, startTime: '08:00', endTime: '16:00' },
      ],
    },
    {
      id: 't-27', userId: 'u-trainer27', name: 'Julia', surname: 'Wróbel', rating: 4.9, reviewCount: 178, priceFrom: 90, distance: '1.7 km',
      specialties: ['Tenis', 'Tenis juniorski'], isVerified: true, hasVideo: true, avatar: '👩‍🎾', gender: 'female' as const,
      bio: 'Specjalistka od treningu juniorów i kobiet. Łączę profesjonalny trening z przyjazną atmosferą.',
      coordinates: { lat: 52.2290, lng: 21.0230 },
      services: [
        { id: 'srv-53', name: 'Tenis dla kobiet', price: 90, duration: 60, type: 'court' as const },
        { id: 'srv-54', name: 'Tenis dla dzieci', price: 70, duration: 45, type: 'court' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '15:00', endTime: '20:00' },
        { dayOfWeek: 2, startTime: '15:00', endTime: '20:00' },
        { dayOfWeek: 3, startTime: '15:00', endTime: '20:00' },
        { dayOfWeek: 4, startTime: '15:00', endTime: '20:00' },
        { dayOfWeek: 6, startTime: '09:00', endTime: '18:00' },
        { dayOfWeek: 0, startTime: '09:00', endTime: '18:00' },
      ],
    },
    {
      id: 't-28', userId: 'u-trainer28', name: 'Marcin', surname: 'Sikora', rating: 4.7, reviewCount: 123, priceFrom: 85, distance: '3.3 km',
      specialties: ['Tenis', 'Kondycja'], isVerified: false, hasVideo: false, avatar: '👨‍🏋️', gender: 'male' as const,
      bio: 'Trener tenisa z naciskiem na przygotowanie kondycyjne. Pomagam poprawić wytrzymałość i siłę na korcie.',
      coordinates: { lat: 52.2140, lng: 21.0350 },
      services: [
        { id: 'srv-55', name: 'Tenis + kondycja', price: 85, duration: 75, type: 'court' as const },
        { id: 'srv-56', name: 'Trening serwisu', price: 80, duration: 45, type: 'court' as const },
      ],
      availability: [
        { dayOfWeek: 2, startTime: '17:00', endTime: '21:00' },
        { dayOfWeek: 4, startTime: '17:00', endTime: '21:00' },
        { dayOfWeek: 6, startTime: '10:00', endTime: '18:00' },
        { dayOfWeek: 0, startTime: '10:00', endTime: '16:00' },
      ],
    },
    {
      id: 't-29', userId: 'u-trainer29', name: 'Izabela', surname: 'Baran', rating: 4.6, reviewCount: 87, priceFrom: 95, distance: '2.5 km',
      specialties: ['Tenis', 'Coaching mentalny'], isVerified: true, hasVideo: true, avatar: '👩‍🎓', gender: 'female' as const,
      bio: 'Psycholog sportu i trenerka tenisa. Pracuję nad techniką i mentalnością zawodników.',
      coordinates: { lat: 52.2480, lng: 21.0120 },
      services: [
        { id: 'srv-57', name: 'Coaching mentalny', price: 120, duration: 60, type: 'online' as const },
        { id: 'srv-58', name: 'Tenis dla zaawansowanych', price: 95, duration: 75, type: 'court' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '10:00', endTime: '15:00' },
        { dayOfWeek: 3, startTime: '10:00', endTime: '15:00' },
        { dayOfWeek: 5, startTime: '10:00', endTime: '15:00' },
      ],
    },
    {
      id: 't-30', userId: 'u-trainer30', name: 'Kamil', surname: 'Rutkowski', rating: 4.8, reviewCount: 145, priceFrom: 110, distance: '1.8 km',
      specialties: ['Tenis', 'Doubles'], isVerified: true, hasVideo: true, avatar: '👨‍💼', gender: 'male' as const,
      bio: 'Specjalista od gry deblowej i taktyki tenisowej. Były kapitan drużyny Davis Cup.',
      coordinates: { lat: 52.2410, lng: 21.0170 },
      services: [
        { id: 'srv-59', name: 'Taktyka gry deblowej', price: 110, duration: 60, type: 'court' as const },
        { id: 'srv-60', name: 'Sparring tenisowy', price: 100, duration: 90, type: 'court' as const },
      ],
      availability: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '14:00' },
        { dayOfWeek: 3, startTime: '08:00', endTime: '14:00' },
        { dayOfWeek: 5, startTime: '08:00', endTime: '14:00' },
        { dayOfWeek: 6, startTime: '09:00', endTime: '17:00' },
      ],
    },
  ],

  reviews: [
    // FITNESS REVIEWS
    { id: 'rev-1', bookingId: 'book-1', clientId: 'u-client1', trainerId: 't-1', rating: 5, comment: 'Świetny trener! Bardzo profesjonalne podejście i indywidualne dostosowanie ćwiczeń.', photos: [], createdAt: '2024-01-15T10:00:00.000Z' },
    { id: 'rev-2', bookingId: 'book-2', clientId: 'u-client2', trainerId: 't-1', rating: 5, comment: 'Polecam! Anna potrafi zmotywować i wytłumaczyć każde ćwiczenie.', photos: [], createdAt: '2024-01-20T14:30:00.000Z' },
    { id: 'rev-3', bookingId: 'book-3', clientId: 'u-client3', trainerId: 't-1', rating: 4, comment: 'Dobry trening, ale mógłby być nieco bardziej intensywny.', photos: [], createdAt: '2024-01-25T16:00:00.000Z' },
    { id: 'rev-4', bookingId: 'book-4', clientId: 'u-client1', trainerId: 't-2', rating: 5, comment: 'Piotr to prawdziwy profesjonalista! Dzięki niemu nabrałem masy mięśniowej jak nigdy wcześniej.', photos: [], createdAt: '2024-02-01T11:00:00.000Z' },
    { id: 'rev-5', bookingId: 'book-5', clientId: 'u-client2', trainerId: 't-2', rating: 4, comment: 'Bardzo wymagający trener, ale efekty przemawiają same za siebie.', photos: [], createdAt: '2024-02-10T15:30:00.000Z' },
    { id: 'rev-6', bookingId: 'book-6', clientId: 'u-client3', trainerId: 't-3', rating: 5, comment: 'Karolina ma niesamowitą energię! Crossfit z nią to czysta przyjemność.', photos: [], createdAt: '2024-02-15T09:00:00.000Z' },
    { id: 'rev-7', bookingId: 'book-7', clientId: 'u-client1', trainerId: 't-3', rating: 5, comment: 'Pierwszy raz polubiłam trening siłowy. Karolina świetnie wszystko wytłumaczy.', photos: [], createdAt: '2024-02-20T17:30:00.000Z' },
    { id: 'rev-8', bookingId: 'book-8', clientId: 'u-client2', trainerId: 't-4', rating: 4, comment: 'Tomasz ma ogromną wiedzę o rehabilitacji. Pomógł mi z bólami pleców.', photos: [], createdAt: '2024-02-25T14:00:00.000Z' },
    { id: 'rev-9', bookingId: 'book-9', clientId: 'u-client3', trainerId: 't-5', rating: 5, comment: 'TRX z Magdaleną to coś wspaniałego! Polecam każdemu.', photos: [], createdAt: '2024-03-01T12:30:00.000Z' },
    
    // YOGA REVIEWS
    { id: 'rev-10', bookingId: 'book-10', clientId: 'u-client1', trainerId: 't-6', rating: 5, comment: 'Ewa to prawdziwa mistrzyni jogi. Jej spokój i cierpliwość są zaraźliwe.', photos: [], createdAt: '2024-01-18T08:00:00.000Z', trainerReply: { comment: 'Dziękuję za te słowa! Cieszę się, że mogę Ci pomóc w praktyce jogi.', repliedAt: '2024-01-19T10:00:00.000Z' } },
    { id: 'rev-11', bookingId: 'book-11', clientId: 'u-client2', trainerId: 't-6', rating: 5, comment: 'Po zajęciach czuję się jak nowo narodzona. Świetne podejście do każdego ucznia.', photos: [], createdAt: '2024-02-05T19:00:00.000Z' },
    { id: 'rev-12', bookingId: 'book-12', clientId: 'u-client3', trainerId: 't-7', rating: 4, comment: 'Patrycja prowadzi medytacje z wielką pasją. Bardzo relaksujące zajęcia.', photos: [], createdAt: '2024-02-12T20:30:00.000Z' },
    { id: 'rev-13', bookingId: 'book-13', clientId: 'u-client1', trainerId: 't-8', rating: 5, comment: 'Marta świetnie wytłumaczy każdą pozycję. Idealna dla początkujących.', photos: [], createdAt: '2024-02-18T16:00:00.000Z' },
    { id: 'rev-14', bookingId: 'book-14', clientId: 'u-client2', trainerId: 't-9', rating: 5, comment: 'Aleksandra łączy jogę z pilates w unikalny sposób. Bardzo efektywne!', photos: [], createdAt: '2024-02-22T07:30:00.000Z' },
    
    // RUNNING REVIEWS  
    { id: 'rev-15', bookingId: 'book-15', clientId: 'u-client1', trainerId: 't-11', rating: 5, comment: 'Marek przygotował mnie do mojego pierwszego półmaratonu. Jestem mu bardzo wdzięczna!', photos: [], createdAt: '2024-01-22T07:00:00.000Z' },
    { id: 'rev-16', bookingId: 'book-16', clientId: 'u-client2', trainerId: 't-11', rating: 4, comment: 'Świetny plan treningowy i motywacja. Poprawiłem swój czas na 10K o 3 minuty!', photos: [], createdAt: '2024-02-08T08:30:00.000Z' },
    { id: 'rev-17', bookingId: 'book-17', clientId: 'u-client3', trainerId: 't-12', rating: 5, comment: 'Jakub nauczył mnie prawidłowej techniki biegu. Teraz biegam bez bólu kolan.', photos: [], createdAt: '2024-02-14T18:00:00.000Z' },
    { id: 'rev-18', bookingId: 'book-18', clientId: 'u-client1', trainerId: 't-13', rating: 5, comment: 'Anna pokazała mi piękno biegania terenowego. Każdy trening to przygoda!', photos: [], createdAt: '2024-02-20T09:30:00.000Z' },
    
    // BOXING REVIEWS
    { id: 'rev-19', bookingId: 'book-19', clientId: 'u-client2', trainerId: 't-16', rating: 5, comment: 'Adrian to mistrz! Nauczył mnie nie tylko techniki, ale i mentalności wojownika.', photos: [], createdAt: '2024-01-28T19:00:00.000Z' },
    { id: 'rev-20', bookingId: 'book-20', clientId: 'u-client3', trainerId: 't-16', rating: 5, comment: 'Treningi z Adrianem to czyste złoto. Polecam każdemu, kto chce się nauczyć boksu.', photos: [], createdAt: '2024-02-06T20:30:00.000Z' },
    { id: 'rev-21', bookingId: 'book-21', clientId: 'u-client1', trainerId: 't-17', rating: 4, comment: 'Michał ma świetne podejście do kobiet w boksie. Czuję się bezpiecznie i pewnie.', photos: [], createdAt: '2024-02-11T17:00:00.000Z' },
    { id: 'rev-22', bookingId: 'book-22', clientId: 'u-client2', trainerId: 't-19', rating: 5, comment: 'Katarzyna to fantastyczna trenerka! Samoobrona z nią to must-have dla każdej kobiety.', photos: [], createdAt: '2024-02-16T18:30:00.000Z', trainerReply: { comment: 'Bardzo mi miło! Bezpieczeństwo kobiet to moja misja.', repliedAt: '2024-02-17T09:00:00.000Z' } },
    
    // SWIMMING REVIEWS
    { id: 'rev-23', bookingId: 'book-23', clientId: 'u-client1', trainerId: 't-21', rating: 5, comment: 'Paulina nauczyła mnie pływać w 6 tygodni! Jej cierpliwość i metody są niesamowite.', photos: [], createdAt: '2024-01-30T15:00:00.000Z' },
    { id: 'rev-24', bookingId: 'book-24', clientId: 'u-client3', trainerId: 't-21', rating: 5, comment: 'Doskonalenie techniki z byłą reprezentantką to wielki zaszczyt. Każda lekcja to postęp.', photos: [], createdAt: '2024-02-07T14:30:00.000Z' },
    { id: 'rev-25', bookingId: 'book-25', clientId: 'u-client2', trainerId: 't-22', rating: 4, comment: 'Krzysztof przygotował mnie do triatlonu. Wiedza i doświadczenie na najwyższym poziomie.', photos: [], createdAt: '2024-02-13T11:00:00.000Z' },
    { id: 'rev-26', bookingId: 'book-26', clientId: 'u-client1', trainerId: 't-23', rating: 5, comment: 'Monika pomogła mi wrócić do pływania po urazie. Rehabilitacja w wodzie działa cuda!', photos: [], createdAt: '2024-02-19T16:30:00.000Z' },
    
    // TENNIS REVIEWS
    { id: 'rev-27', bookingId: 'book-27', clientId: 'u-client2', trainerId: 't-26', rating: 5, comment: 'Łukasz to prawdziwy mistrz tenisa! Jego doświadczenie ATP widać w każdej lekcji.', photos: [], createdAt: '2024-02-02T10:00:00.000Z' },
    { id: 'rev-28', bookingId: 'book-28', clientId: 'u-client3', trainerId: 't-26', rating: 4, comment: 'Świetna analiza mojej gry. Poprawiłem serwis i forhend dzięki jego wskazówkom.', photos: [], createdAt: '2024-02-09T11:30:00.000Z' },
    { id: 'rev-29', bookingId: 'book-29', clientId: 'u-client1', trainerId: 't-27', rating: 5, comment: 'Julia ma dar do nauczania. Moja córka uwielbia lekcje tenisa z nią!', photos: [], createdAt: '2024-02-15T16:00:00.000Z' },
    { id: 'rev-30', bookingId: 'book-30', clientId: 'u-client2', trainerId: 't-30', rating: 5, comment: 'Kamil nauczył mnie taktyki gry deblowej. Teraz wygrywamy turnieje klubowe!', photos: [], createdAt: '2024-02-21T12:00:00.000Z', trainerReply: { comment: 'Świetnie się rozwija Twoja gra! Gratuluję zwycięstw.', repliedAt: '2024-02-22T14:00:00.000Z' } },
  ],

  bookings: [
    // Pending bookings for testing
    { id: 'booking-1', clientId: 'u-client1', trainerId: 'u-trainer1', serviceId: 'srv-1', scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), status: 'pending' as const, notes: 'Jestem początkujący, proszę o łagodne podejście', createdAt: new Date().toISOString() },
    { id: 'booking-2', clientId: 'u-client2', trainerId: 'u-trainer6', serviceId: 'srv-11', scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' as const, notes: 'Pierwszy raz z jogą', createdAt: new Date().toISOString() },
    { id: 'booking-3', clientId: 'u-client3', trainerId: 'u-trainer16', serviceId: 'srv-31', scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), status: 'pending' as const, notes: 'Interesuje mnie samoobrona', createdAt: new Date().toISOString() },
    
    // Confirmed bookings
    { id: 'booking-4', clientId: 'u-client1', trainerId: 'u-trainer2', serviceId: 'srv-3', scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), status: 'confirmed' as const, createdAt: new Date().toISOString() },
    { id: 'booking-5', clientId: 'u-client2', trainerId: 'u-trainer11', serviceId: 'srv-21', scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), status: 'confirmed' as const, notes: 'Przygotowanie do 10K', createdAt: new Date().toISOString() },
    { id: 'booking-6', clientId: 'u-client3', trainerId: 'u-trainer21', serviceId: 'srv-41', scheduledAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(), status: 'confirmed' as const, notes: 'Nauka pływania od podstaw', createdAt: new Date().toISOString() },
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

  manualBlocks: [
    // Sample manual blocks for testing availability
    { id: 'block-1', trainerId: 't-1', title: 'Prywatny trening', date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], startTime: '14:00', endTime: '15:00', createdAt: new Date().toISOString() },
    { id: 'block-2', trainerId: 't-6', title: 'Wizyta lekarska', date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], startTime: '11:00', endTime: '12:30', createdAt: new Date().toISOString() },
    { id: 'block-3', trainerId: 't-16', title: 'Trening zawodnika', date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], startTime: '16:00', endTime: '17:30', createdAt: new Date().toISOString() },
    { id: 'block-4', trainerId: 't-21', title: 'Konserwacja basenu', date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], startTime: '13:00', endTime: '15:00', createdAt: new Date().toISOString() },
  ] as ManualBlock[],
  
  trainerSettings: [
    // Fitness trainers
    { trainerId: 't-1', workingDays: [1, 2, 3, 4, 5], workingHours: { 1: { start: '09:00', end: '18:00' }, 2: { start: '09:00', end: '18:00' }, 3: { start: '09:00', end: '18:00' }, 4: { start: '09:00', end: '18:00' }, 5: { start: '09:00', end: '18:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
    { trainerId: 't-2', workingDays: [1, 2, 3, 4, 5, 6], workingHours: { 1: { start: '06:00', end: '14:00' }, 2: { start: '06:00', end: '14:00' }, 3: { start: '06:00', end: '14:00' }, 4: { start: '06:00', end: '14:00' }, 5: { start: '06:00', end: '14:00' }, 6: { start: '08:00', end: '12:00' } }, slotDuration: 30, defaultServiceDuration: 75 },
    { trainerId: 't-3', workingDays: [1, 2, 3, 4, 5], workingHours: { 1: { start: '16:00', end: '21:00' }, 2: { start: '16:00', end: '21:00' }, 3: { start: '16:00', end: '21:00' }, 4: { start: '16:00', end: '21:00' }, 5: { start: '16:00', end: '21:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
    { trainerId: 't-4', workingDays: [2, 4, 6], workingHours: { 2: { start: '10:00', end: '18:00' }, 4: { start: '10:00', end: '18:00' }, 6: { start: '09:00', end: '15:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
    { trainerId: 't-5', workingDays: [1, 3, 5, 6], workingHours: { 1: { start: '07:00', end: '15:00' }, 3: { start: '07:00', end: '15:00' }, 5: { start: '07:00', end: '15:00' }, 6: { start: '09:00', end: '13:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
    
    // Yoga trainers  
    { trainerId: 't-6', workingDays: [1, 2, 3, 4, 5], workingHours: { 1: { start: '08:00', end: '16:00' }, 2: { start: '08:00', end: '16:00' }, 3: { start: '08:00', end: '16:00' }, 4: { start: '08:00', end: '16:00' }, 5: { start: '08:00', end: '16:00' } }, slotDuration: 30, defaultServiceDuration: 90 },
    { trainerId: 't-7', workingDays: [1, 3, 5, 6, 0], workingHours: { 1: { start: '17:00', end: '21:00' }, 3: { start: '17:00', end: '21:00' }, 5: { start: '17:00', end: '21:00' }, 6: { start: '10:00', end: '18:00' }, 0: { start: '10:00', end: '15:00' } }, slotDuration: 30, defaultServiceDuration: 75 },
    { trainerId: 't-8', workingDays: [2, 4, 6], workingHours: { 2: { start: '09:00', end: '17:00' }, 4: { start: '09:00', end: '17:00' }, 6: { start: '09:00', end: '15:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
    { trainerId: 't-9', workingDays: [1, 3, 5], workingHours: { 1: { start: '06:30', end: '14:30' }, 3: { start: '06:30', end: '14:30' }, 5: { start: '06:30', end: '14:30' } }, slotDuration: 30, defaultServiceDuration: 75 },
    { trainerId: 't-10', workingDays: [1, 2, 3, 4, 0], workingHours: { 1: { start: '18:00', end: '21:00' }, 2: { start: '18:00', end: '21:00' }, 3: { start: '18:00', end: '21:00' }, 4: { start: '18:00', end: '21:00' }, 0: { start: '16:00', end: '20:00' } }, slotDuration: 30, defaultServiceDuration: 90 },
    
    // Running trainers
    { trainerId: 't-11', workingDays: [1, 2, 3, 4, 5, 6, 0], workingHours: { 1: { start: '06:00', end: '09:00' }, 2: { start: '06:00', end: '09:00' }, 3: { start: '06:00', end: '09:00' }, 4: { start: '06:00', end: '09:00' }, 5: { start: '06:00', end: '09:00' }, 6: { start: '07:00', end: '12:00' }, 0: { start: '07:00', end: '12:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
    { trainerId: 't-12', workingDays: [2, 4, 6, 0], workingHours: { 2: { start: '17:00', end: '20:00' }, 4: { start: '17:00', end: '20:00' }, 6: { start: '08:00', end: '16:00' }, 0: { start: '08:00', end: '16:00' } }, slotDuration: 30, defaultServiceDuration: 75 },
    { trainerId: 't-13', workingDays: [1, 3, 5, 6, 0], workingHours: { 1: { start: '07:00', end: '10:00' }, 3: { start: '07:00', end: '10:00' }, 5: { start: '07:00', end: '10:00' }, 6: { start: '09:00', end: '17:00' }, 0: { start: '09:00', end: '17:00' } }, slotDuration: 30, defaultServiceDuration: 90 },
    { trainerId: 't-14', workingDays: [1, 3, 5], workingHours: { 1: { start: '18:00', end: '21:00' }, 3: { start: '18:00', end: '21:00' }, 5: { start: '18:00', end: '21:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
    { trainerId: 't-15', workingDays: [2, 4, 6], workingHours: { 2: { start: '07:00', end: '11:00' }, 4: { start: '07:00', end: '11:00' }, 6: { start: '10:00', end: '16:00' } }, slotDuration: 30, defaultServiceDuration: 75 },
    
    // Boxing trainers
    { trainerId: 't-16', workingDays: [1, 2, 3, 4, 5, 6], workingHours: { 1: { start: '10:00', end: '20:00' }, 2: { start: '10:00', end: '20:00' }, 3: { start: '10:00', end: '20:00' }, 4: { start: '10:00', end: '20:00' }, 5: { start: '10:00', end: '20:00' }, 6: { start: '09:00', end: '15:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
    { trainerId: 't-17', workingDays: [1, 3, 5, 6], workingHours: { 1: { start: '16:00', end: '21:00' }, 3: { start: '16:00', end: '21:00' }, 5: { start: '16:00', end: '21:00' }, 6: { start: '10:00', end: '18:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
    { trainerId: 't-18', workingDays: [2, 4, 6], workingHours: { 2: { start: '06:00', end: '14:00' }, 4: { start: '06:00', end: '14:00' }, 6: { start: '08:00', end: '16:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
    { trainerId: 't-19', workingDays: [1, 3, 5, 0], workingHours: { 1: { start: '17:00', end: '21:00' }, 3: { start: '17:00', end: '21:00' }, 5: { start: '17:00', end: '21:00' }, 0: { start: '11:00', end: '17:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
    { trainerId: 't-20', workingDays: [1, 2, 4, 5], workingHours: { 1: { start: '18:00', end: '22:00' }, 2: { start: '18:00', end: '22:00' }, 4: { start: '18:00', end: '22:00' }, 5: { start: '18:00', end: '22:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
    
    // Swimming trainers
    { trainerId: 't-21', workingDays: [1, 2, 3, 4, 5], workingHours: { 1: { start: '08:00', end: '16:00' }, 2: { start: '08:00', end: '16:00' }, 3: { start: '08:00', end: '16:00' }, 4: { start: '08:00', end: '16:00' }, 5: { start: '08:00', end: '16:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
    { trainerId: 't-22', workingDays: [2, 4, 6, 0], workingHours: { 2: { start: '06:00', end: '10:00' }, 4: { start: '06:00', end: '10:00' }, 6: { start: '07:00', end: '15:00' }, 0: { start: '07:00', end: '15:00' } }, slotDuration: 30, defaultServiceDuration: 90 },
    { trainerId: 't-23', workingDays: [1, 3, 5], workingHours: { 1: { start: '09:00', end: '17:00' }, 3: { start: '09:00', end: '17:00' }, 5: { start: '09:00', end: '17:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
    { trainerId: 't-24', workingDays: [2, 4, 6], workingHours: { 2: { start: '16:00', end: '21:00' }, 4: { start: '16:00', end: '21:00' }, 6: { start: '09:00', end: '18:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
    { trainerId: 't-25', workingDays: [1, 3, 5, 6], workingHours: { 1: { start: '05:30', end: '08:30' }, 3: { start: '05:30', end: '08:30' }, 5: { start: '05:30', end: '08:30' }, 6: { start: '07:00', end: '12:00' } }, slotDuration: 30, defaultServiceDuration: 75 },
    
    // Tennis trainers
    { trainerId: 't-26', workingDays: [1, 2, 3, 4, 5, 6, 0], workingHours: { 1: { start: '09:00', end: '17:00' }, 2: { start: '09:00', end: '17:00' }, 3: { start: '09:00', end: '17:00' }, 4: { start: '09:00', end: '17:00' }, 5: { start: '09:00', end: '17:00' }, 6: { start: '08:00', end: '16:00' }, 0: { start: '08:00', end: '16:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
    { trainerId: 't-27', workingDays: [1, 2, 3, 4, 6, 0], workingHours: { 1: { start: '15:00', end: '20:00' }, 2: { start: '15:00', end: '20:00' }, 3: { start: '15:00', end: '20:00' }, 4: { start: '15:00', end: '20:00' }, 6: { start: '09:00', end: '18:00' }, 0: { start: '09:00', end: '18:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
    { trainerId: 't-28', workingDays: [2, 4, 6, 0], workingHours: { 2: { start: '17:00', end: '21:00' }, 4: { start: '17:00', end: '21:00' }, 6: { start: '10:00', end: '18:00' }, 0: { start: '10:00', end: '16:00' } }, slotDuration: 30, defaultServiceDuration: 75 },
    { trainerId: 't-29', workingDays: [1, 3, 5], workingHours: { 1: { start: '10:00', end: '15:00' }, 3: { start: '10:00', end: '15:00' }, 5: { start: '10:00', end: '15:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
    { trainerId: 't-30', workingDays: [1, 3, 5, 6], workingHours: { 1: { start: '08:00', end: '14:00' }, 3: { start: '08:00', end: '14:00' }, 5: { start: '08:00', end: '14:00' }, 6: { start: '09:00', end: '17:00' } }, slotDuration: 30, defaultServiceDuration: 60 },
  ] as (TrainerSettings & { trainerId: string })[],
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