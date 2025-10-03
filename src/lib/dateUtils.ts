// Stage 5: Timezone Support
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

export const getUserTimezone = () => 
  Intl.DateTimeFormat().resolvedOptions().timeZone;

export const toLocalTime = (utcDate: Date | string) => 
  toZonedTime(new Date(utcDate), getUserTimezone());

export const toUTCTime = (localDate: Date) => 
  fromZonedTime(localDate, getUserTimezone());

export const formatDateForDisplay = (date: Date | string) => {
  const localDate = toLocalTime(date);
  return localDate.toLocaleString('pl-PL', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
};
