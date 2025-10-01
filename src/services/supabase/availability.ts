import { supabase } from '@/integrations/supabase/client';
import { bookingsService } from './bookings';
import { timeOffService, manualBlocksService } from './timeOff';

interface TimeSlot {
  start: string;
  end: string;
}

/**
 * Check if a specific time slot is available for a trainer
 */
export const isTimeSlotAvailable = async (
  trainerId: string,
  datetime: Date,
  durationMinutes: number
): Promise<boolean> => {
  const endTime = new Date(datetime.getTime() + durationMinutes * 60000);
  
  // Check bookings
  const dateStr = datetime.toISOString().split('T')[0];
  const bookings = await bookingsService.getByTrainerAndDate(trainerId, dateStr);
  
  for (const booking of bookings) {
    const bookingStart = new Date(booking.scheduled_at);
    const bookingEnd = new Date(bookingStart.getTime() + 60 * 60000); // Assume 60min default
    
    // Check for overlap
    if (datetime < bookingEnd && endTime > bookingStart) {
      return false;
    }
  }
  
  // Check manual blocks
  const manualBlocks = await manualBlocksService.getByTrainerId(trainerId);
  for (const block of manualBlocks) {
    const blockDate = new Date(block.date).toISOString().split('T')[0];
    const checkDate = datetime.toISOString().split('T')[0];
    
    if (blockDate === checkDate) {
      const blockStart = new Date(`${block.date}T${block.start_time}`);
      const blockEnd = new Date(`${block.date}T${block.end_time}`);
      
      if (datetime < blockEnd && endTime > blockStart) {
        return false;
      }
    }
  }
  
  // Check time off
  const timeOffs = await timeOffService.getByTrainerId(trainerId);
  for (const timeOff of timeOffs) {
    const offStart = new Date(timeOff.start_date);
    const offEnd = new Date(timeOff.end_date);
    
    if (datetime >= offStart && datetime <= offEnd) {
      return false;
    }
  }
  
  return true;
};

/**
 * Get available dates for a trainer within a date range
 */
export const getAvailableDates = async (
  trainerId: string,
  fromDate: Date,
  toDate: Date
): Promise<Date[]> => {
  const availableDates: Date[] = [];
  const currentDate = new Date(fromDate);
  
  while (currentDate <= toDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Check if trainer has any available slots on this day
    // For simplicity, check a few common hours (9am, 12pm, 3pm, 6pm)
    const testHours = [9, 12, 15, 18];
    let hasAvailableSlot = false;
    
    for (const hour of testHours) {
      const testTime = new Date(currentDate);
      testTime.setHours(hour, 0, 0, 0);
      
      const isAvailable = await isTimeSlotAvailable(trainerId, testTime, 60);
      if (isAvailable) {
        hasAvailableSlot = true;
        break;
      }
    }
    
    if (hasAvailableSlot) {
      availableDates.push(new Date(currentDate));
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return availableDates;
};

/**
 * Get available hours for a specific date
 */
export const getAvailableHours = async (
  trainerId: string,
  date: Date
): Promise<string[]> => {
  const availableHours: string[] = [];
  
  // Check hours from 6am to 10pm
  for (let hour = 6; hour <= 22; hour++) {
    const testTime = new Date(date);
    testTime.setHours(hour, 0, 0, 0);
    
    const isAvailable = await isTimeSlotAvailable(trainerId, testTime, 60);
    if (isAvailable) {
      availableHours.push(`${hour.toString().padStart(2, '0')}:00`);
    }
  }
  
  return availableHours;
};

/**
 * Get all available slots for a trainer on a specific date
 */
export const getAvailableSlots = async (
  trainerId: string,
  date: string
): Promise<TimeSlot[]> => {
  const slots: TimeSlot[] = [];
  const dateObj = new Date(date);
  
  // Check hours from 6am to 10pm in 30-minute increments
  for (let hour = 6; hour <= 22; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const testTime = new Date(dateObj);
      testTime.setHours(hour, minute, 0, 0);
      
      const isAvailable = await isTimeSlotAvailable(trainerId, testTime, 60);
      if (isAvailable) {
        const endTime = new Date(testTime.getTime() + 60 * 60000);
        slots.push({
          start: testTime.toISOString(),
          end: endTime.toISOString()
        });
      }
    }
  }
  
  return slots;
};

export const availabilityService = {
  isTimeSlotAvailable,
  getAvailableDates,
  getAvailableHours,
  getAvailableSlots
};
