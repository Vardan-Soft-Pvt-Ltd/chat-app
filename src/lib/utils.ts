import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function urlWithParams(baseUrl: string, params: any) {
  const url = new URL(baseUrl);
  url.search = (new URLSearchParams(params)).toString();
  return url.toString();
}