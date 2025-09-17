import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a 6-character session code
export function generateSessionCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Extract first name and last initial from a full name
export function getNameInitial(name: string | null | undefined, login?: string): string {
  if (!name && !login) return 'Anonymous'
  
  const displayName = name || login || 'Anonymous'
  const parts = displayName.trim().split(' ')
  
  if (parts.length === 1) {
    return parts[0]
  }
  
  const firstName = parts[0]
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() || ''
  
  return `${firstName} ${lastInitial}.`
}

// Strip HTML from user input to prevent XSS
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim()
}

// Safe parse with error handling
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.safeParse(data)
    if (result.success) {
      return { success: true, data: result.data }
    }
    return { success: false, error: result.error.errors.map(e => e.message).join(', ') }
  } catch (error) {
    return { success: false, error: 'Invalid data format' }
  }
}
