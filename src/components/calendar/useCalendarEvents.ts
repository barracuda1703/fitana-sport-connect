import { useState, useEffect } from 'react';
import { bookingsService, manualBlocksService, timeOffService } from '@/services/supabase';
import { CalendarEvent } from './CalendarGrid';

interface UseCalendarEventsProps {
  role: 'trainer' | 'client';
  userId: string;
}

export const useCalendarEvents = ({ role, userId }: UseCalendarEventsProps) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        let calendarEvents: CalendarEvent[] = [];

        if (role === 'trainer') {
          // For trainers: get their bookings + manual blocks + time offs
          const bookings = await bookingsService.getByUserId(userId);
          const manualBlocks = await manualBlocksService.getByTrainerId(userId);
          const timeOffs = await timeOffService.getByTrainerId(userId);

          // Convert bookings to calendar events
          const bookingEvents: CalendarEvent[] = bookings.map(booking => {
            try {
              const startDate = new Date(booking.scheduled_at);
              if (isNaN(startDate.getTime())) {
                console.warn('Invalid booking date:', booking.scheduled_at);
                return null;
              }
              const endDate = new Date(startDate.getTime() + 60 * 60000); // Default 60 min
              return {
                id: `booking-${booking.id}`,
                title: `Booking - ${booking.service_id}`,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                status: booking.status === 'confirmed' ? 'confirmed' : 
                       booking.status === 'pending' ? 'pending' : 'canceled',
                type: 'booking'
              };
            } catch (error) {
              console.warn('Error processing booking:', booking.id, error);
              return null;
            }
          }).filter(Boolean) as CalendarEvent[];

          // Convert manual blocks to calendar events
          const blockEvents: CalendarEvent[] = manualBlocks.map(block => {
            try {
              const startDateTime = `${block.date}T${block.start_time}:00`;
              const endDateTime = `${block.date}T${block.end_time}:00`;
              const startDate = new Date(startDateTime);
              const endDate = new Date(endDateTime);
              
              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                console.warn('Invalid block date/time:', block);
                return null;
              }
              
              return {
                id: `block-${block.id}`,
                title: block.title,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                status: 'confirmed' as const,
                type: 'block'
              };
            } catch (error) {
              console.warn('Error processing block:', block.id, error);
              return null;
            }
          }).filter(Boolean) as CalendarEvent[];

          // Convert time offs to calendar events
          const timeOffEvents = timeOffs.map(timeOff => {
            try {
              const startDate = new Date(timeOff.start_date);
              const endDate = new Date(timeOff.end_date);
              
              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                console.warn('Invalid time off date:', timeOff);
                return null;
              }
              
              return {
                id: `timeoff-${timeOff.id}`,
                title: timeOff.note || (timeOff.all_day ? 'Wolne' : 'Wolne'),
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                status: 'confirmed' as const,
                type: 'block'
              };
            } catch (error) {
              console.warn('Error processing time off:', timeOff.id, error);
              return null;
            }
          }).filter(Boolean) as CalendarEvent[];

          calendarEvents = [...bookingEvents, ...blockEvents, ...timeOffEvents];
        } else {
          // For clients: get only their bookings
          const bookings = await bookingsService.getByUserId(userId);

          calendarEvents = bookings.map(booking => {
            try {
              const startDate = new Date(booking.scheduled_at);
              if (isNaN(startDate.getTime())) {
                console.warn('Invalid booking date:', booking.scheduled_at);
                return null;
              }
              const endDate = new Date(startDate.getTime() + 60 * 60000);
              return {
                id: `booking-${booking.id}`,
                title: `Booking - ${booking.service_id}`,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                status: booking.status === 'confirmed' ? 'confirmed' : 
                       booking.status === 'pending' ? 'pending' : 'canceled',
                type: 'booking'
              };
            } catch (error) {
              console.warn('Error processing booking:', booking.id, error);
              return null;
            }
          }).filter(Boolean) as CalendarEvent[];
        }

        setEvents(calendarEvents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Wystąpił błąd podczas ładowania wydarzeń');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [role, userId]);

  return { events, loading, error };
};
