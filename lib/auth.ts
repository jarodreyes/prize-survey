// Simple cookie-based session management
export interface SimpleUser {
  id: string
  name: string
  email: string
}

export function createUserSession(user: SimpleUser): string {
  // Create a simple session token
  return Buffer.from(JSON.stringify(user)).toString('base64')
}

export function getUserFromSession(sessionToken: string | undefined): SimpleUser | null {
  if (!sessionToken) return null
  
  try {
    const userData = Buffer.from(sessionToken, 'base64').toString('utf-8')
    return JSON.parse(userData) as SimpleUser
  } catch {
    return null
  }
}

export function generateUserId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}
