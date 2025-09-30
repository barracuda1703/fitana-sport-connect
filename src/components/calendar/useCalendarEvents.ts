import { useState, useEffect } from 'react';
import { dataStore, Booking, ManualBlock, TimeOff } from '@/services/DataStore';
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
          const bookings = dataStore.getBookings(userId);
          const manualBlocks = dataStore.getManualBlocks(userId);
          const timeOffs = dataStore.getTimeOffs(userId);

          // Convert bookings to calendar events
          const bookingEvents: CalendarEvent[] = bookings.map(booking => {
            try {
              const startDate = new Date(booking.scheduledAt);
              if (isNaN(startDate.getTime())) {
                console.warn('Invalid booking date:', booking.scheduledAt);
                return null;
              }
              const endDate = new Date(startDate.getTime() + booking.duration * 60000);
              return {
                id: `booking-${booking.id}`,
                title: `${booking.clientName} - ${booking.serviceName}`,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                status: booking.status === 'confirmed' ? 'confirmed' : 
                       booking.status === 'pending' ? 'pending' : 'canceled',
                location: booking.location,
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
              const startDateTime = `${block.date}T${block.startTime}:00`;
              const endDateTime = `${block.date}T${block.endTime}:00`;
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
              const startDate = new Date(timeOff.start);
              const endDate = new Date(timeOff.end);
              
              if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                console.warn('Invalid time off date:', timeOff);
                return null;
              }
              
              return {
                id: `timeoff-${timeOff.id}`,
                title: timeOff.note || (timeOff.allDay ? 'Wolne' : 'Wolne'),
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
          const bookings = dataStore.getBookings(userId);

          calendarEvents = bookings.map(booking => {
            try {
              const startDate = new Date(booking.scheduledAt);
              if (isNaN(startDate.getTime())) {
                console.warn('Invalid booking date:', booking.scheduledAt);
                return null;
              }
              const endDate = new Date(startDate.getTime() + booking.duration * 60000);
              return {
                id: `booking-${booking.id}`,
                title: `${booking.serviceName} z ${booking.trainerName}`,
                start: startDate.toISOString(),
                end: endDate.toISOString(),
                status: booking.status === 'confirmed' ? 'confirmed' : 
                       booking.status === 'pending' ? 'pending' : 'canceled',
                location: booking.location,
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
