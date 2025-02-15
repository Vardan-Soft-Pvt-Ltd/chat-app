import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
const API_URL = import.meta.env.VITE_API_URL;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function urlWithParams(baseUrl: string, params: any) {
  const url = new URL(baseUrl);
  url.search = (new URLSearchParams(params)).toString();
  return url.toString();
}

export const BASE_URL = process.env.NODE_ENV === 'production' ? API_URL : 'http://localhost:5000';
