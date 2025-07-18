import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Calculate age from date of birth
export const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--
  }

  return age
}

// Format phone number to xxx-xxx-xxxx format
export const formatPhoneNumber = (
  phoneNumber: string | null | undefined
): string => {
  if (!phoneNumber) return '-'

  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '')

  // Check if it's a valid US phone number (10 digits)
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }

  // If it's 11 digits and starts with 1, format as US number
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }

  // Otherwise, return the original
  return phoneNumber
}
