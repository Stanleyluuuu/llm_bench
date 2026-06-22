import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Replace underscores and hyphens with spaces for display. */
export function formatProjectName(name: string): string {
  return name.replace(/[_-]/g, ' ')
}
