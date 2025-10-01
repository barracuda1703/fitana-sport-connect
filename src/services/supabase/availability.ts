import { supabase } from '@/integrations/supabase/client';
import { bookingsService } from './bookings';
import { timeOffService, manualBlocksService } from './timeOff';

interface TimeSlot {
  start: string;
  end: string;
}

// Cache for availability data to improve performance
const availabilityCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

/**
 * Check if a specific time slot is available for a trainer
 */
export const isTimeSlotAvailable = async (
  trainerId: string,
  datetime: Date,
  durationMinutes: number = 60
): Promise<boolean> => {
  const endTime = new Date(datetime.getTime() + durationMinutes * 60000);
  const dateStr = datetime.toISOString().split('T')[0];
  
  // Batch fetch all availability data for the date
  const cacheKey = `${trainerId}-${dateStr}`;
  let availabilityData;
  
  const cached = availabilityCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    availabilityData = cached.data;
  } else {
    // Fetch all data in parallel
    const [bookings, manualBlocks, timeOffs] = await Promise.all([
      bookingsService.getByTrainerAndDate(trainerId, dateStr),
      manualBlocksService.getByTrainerId(trainerId),
      timeOffService.getByTrainerId(trainerId)
    ]);
    
    availabilityData = { bookings, manualBlocks, timeOffs };
    availabilityCache.set(cacheKey, { data: availabilityData, timestamp: Date.now() });
  }
  
  const { bookings, manualBlocks, timeOffs } = availabilityData;
  
  // Check bookings with proper overlap detection
  for (const booking of bookings) {
    const bookingStart = new Date(booking.scheduled_at);
    // Use actual duration or default to 60 minutes
    const bookingEnd = new Date(bookingStart.getTime() + durationMinutes * 60000);
    
    // Check for any overlap: (StartA < EndB) AND (EndA > StartB)
    if (datetime < bookingEnd && endTime > bookingStart) {
      return false;
    }
  }
  
  // Check manual blocks
  for (const block of manualBlocks) {
    const blockDate = new Date(block.date).toISOString().split('T')[0];
    
    if (blockDate === dateStr) {
      const blockStart = new Date(`${block.date}T${block.start_time}`);
      const blockEnd = new Date(`${block.date}T${block.end_time}`);
      
      if (datetime < blockEnd && endTime > blockStart) {
        return false;
      }
    }
  }
  
  // Check time off periods
  for (const timeOff of timeOffs) {
    const offStart = new Date(timeOff.start_date);
    const offEnd = new Date(timeOff.end_date);
    offEnd.setHours(23, 59, 59, 999); // Include the entire end day
    
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
  
  // Batch process dates more efficiently
  const datePromises: Promise<{ date: Date; available: boolean }>[] = [];
  
  while (currentDate <= toDate) {
    const dateToCheck = new Date(currentDate);
    
    // Check multiple hours in parallel for each date
    const checkDateAvailability = async (date: Date): Promise<{ date: Date; available: boolean }> => {
      const testHours = [9, 12, 15, 18];
      
      for (const hour of testHours) {
        const testTime = new Date(date);
        testTime.setHours(hour, 0, 0, 0);
        
        const isAvailable = await isTimeSlotAvailable(trainerId, testTime, 60);
        if (isAvailable) {
          return { date: new Date(date), available: true };
        }
      }
      
      return { date: new Date(date), available: false };
    };
    
    datePromises.push(checkDateAvailability(dateToCheck));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  // Wait for all date checks to complete
  const results = await Promise.all(datePromises);
  
  // Filter only available dates
  return results
    .filter(result => result.available)
    .map(result => result.date);
};

/**
 * Get available hours for a specific date
 */
export const getAvailableHours = async (
  trainerId: string,
  date: Date
): Promise<string[]> => {
  const availableHours: string[] = [];
  
  // Check hours from 6am to 10pm in parallel
  const hourChecks = [];
  for (let hour = 6; hour <= 22; hour++) {
    const testTime = new Date(date);
    testTime.setHours(hour, 0, 0, 0);
    
    hourChecks.push(
      isTimeSlotAvailable(trainerId, testTime, 60).then(isAvailable => ({
        hour,
        isAvailable
      }))
    );
  }
  
  const results = await Promise.all(hourChecks);
  
  return results
    .filter(result => result.isAvailable)
    .map(result => `${result.hour.toString().padStart(2, '0')}:00`);
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

/**
 * Clear cache for a specific trainer and date (call after booking changes)
 */
export const clearAvailabilityCache = (trainerId: string, date?: string) => {
  if (date) {
    availabilityCache.delete(`${trainerId}-${date}`);
  } else {
    // Clear all cache for this trainer
    const keys = Array.from(availabilityCache.keys());
    keys.forEach(key => {
      if (key.startsWith(trainerId)) {
        availabilityCache.delete(key);
      }
    });
  }
};

export const availabilityService = {
  isTimeSlotAvailable,
  getAvailableDates,
  getAvailableHours,
  getAvailableSlots,
  clearAvailabilityCache
};
