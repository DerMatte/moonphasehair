import { clsx, type ClassValue } from "clsx"
import { headers } from "next/headers";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const formatDateTime = (date: Date) => {
  return date.toLocaleString('en-GB', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const baseUrl =
  (process.env.VERCEL_URL) ? process.env.VERCEL_URL : "http://localhost:3000";
