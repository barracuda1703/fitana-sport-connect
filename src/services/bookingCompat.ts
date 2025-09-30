// Temporary compatibility layer for migration from DataStore to Supabase
import { Booking as SupabaseBooking, RescheduleRequest } from './supabase';

// Legacy DataStore booking type (camelCase) to maintain compatibility
export interface DataStoreBooking {
  id: string;
  clientId: string;
  trainerId: string;
  serviceId: string;
  scheduledAt: string;
  status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled';
  notes?: string;
  rescheduleRequests: RescheduleRequest[];
  duration?: number;
  location?: string;
  clientName?: string;
  serviceName?: string;
  trainerName?: string;
  createdAt: string;
}

// Convert Supabase booking (snake_case) to DataStore booking (camelCase)
export function toDataStoreBooking(booking: SupabaseBooking): DataStoreBooking {
  return {
    id: booking.id,
    clientId: booking.client_id,
    trainerId: booking.trainer_id,
    serviceId: booking.service_id,
    scheduledAt: booking.scheduled_at,
    status: booking.status,
    notes: booking.notes,
    rescheduleRequests: booking.reschedule_requests || [],
    createdAt: booking.created_at,
  };
}

// Convert DataStore booking (camelCase) to Supabase booking (snake_case)
export function toSupabaseBooking(booking: Partial<DataStoreBooking>): Partial<SupabaseBooking> {
  const result: any = {};
  
  if (booking.id) result.id = booking.id;
  if (booking.clientId) result.client_id = booking.clientId;
  if (booking.trainerId) result.trainer_id = booking.trainerId;
  if (booking.serviceId) result.service_id = booking.serviceId;
  if (booking.scheduledAt) result.scheduled_at = booking.scheduledAt;
  if (booking.status) result.status = booking.status;
  if (booking.notes !== undefined) result.notes = booking.notes;
  if (booking.rescheduleRequests) result.reschedule_requests = booking.rescheduleRequests;
  
  return result;
}

export type { RescheduleRequest };
export type Booking = DataStoreBooking;
