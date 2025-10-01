import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isPreviewDomain(): boolean {
  return window.location.hostname.includes('lovableproject.com');
}

export function isProductionDomain(): boolean {
  return window.location.hostname === 'fitana.pl';
}
