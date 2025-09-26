// Fitana App Types

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'trainer';
  avatar?: string;
  language: string;
  createdAt: Date;
}

export interface Client extends User {
  role: 'client';
  city: string;
  sports: string[];
  achievements: Achievement[];
}

export interface Trainer extends User {
  role: 'trainer';
  surname: string;
  gender: 'male' | 'female' | 'other';
  bio: string;
  disciplines: string[];
  locations: Location[];
  services: Service[];
  certificates: Certificate[];
  introVideo?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  subscriptionStatus: 'active' | 'inactive' | 'pending';
}

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  radius: number; // in km
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  duration: number; // in minutes
  type: 'online' | 'gym' | 'court' | 'home_visit';
}

export interface Certificate {
  id: string;
  name: string;
  issuer: string;
  imageUrl: string;
  verifiedAt?: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  unlockedAt: Date;
}

export interface Booking {
  id: string;
  clientId: string;
  trainerId: string;
  serviceId: string;
  locationId: string;
  scheduledAt: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled';
  notes?: string;
  rescheduleRequests: RescheduleRequest[];
}

export interface RescheduleRequest {
  id: string;
  requestedAt: Date;
  requestedBy: 'client' | 'trainer';
  newTime: Date;
  status: 'pending' | 'accepted' | 'declined';
}

export interface Review {
  id: string;
  bookingId: string;
  clientId: string;
  trainerId: string;
  rating: number;
  comment: string;
  photos: string[];
  createdAt: Date;
  trainerReply?: {
    comment: string;
    repliedAt: Date;
  };
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'video_link';
  attachments: string[];
  sentAt: Date;
  readAt?: Date;
}

export interface Language {
  code: 'pl' | 'en' | 'uk' | 'ru';
  name: string;
  nativeName: string;
}

export type SportsCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};