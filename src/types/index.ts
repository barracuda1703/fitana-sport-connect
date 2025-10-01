// Fitana App Types
// Note: Booking, User, Trainer, Review, and Message types are now in @/services/supabase
// This file contains only UI-specific types that are not in the database

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

export interface Language {
  code: 'pl' | 'en-GB' | 'uk' | 'ru';
  name: string;
  nativeName: string;
}

export type SportsCategory = {
  id: string;
  name: string;
  icon: string;
  color: string;
};
