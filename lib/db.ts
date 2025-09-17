import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// Check if database URL is configured
const isDatabaseConfigured = process.env.POSTGRES_URL && 
  !process.env.POSTGRES_URL.includes('username:password@localhost') &&
  process.env.POSTGRES_URL !== 'postgresql://username:password@localhost:5432/signalfire_survey'

if (!isDatabaseConfigured) {
  console.warn('⚠️  Database not configured. Some features will not work until POSTGRES_URL is set.')
}

// Create postgres pool - this works with both direct and pooled connections
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  max: 1, // Use only 1 connection for development
  idleTimeoutMillis: 20000,
  connectionTimeoutMillis: 10000,
})

export const db = drizzle(pool, { schema })

// Helper to check if database operations should be attempted
export const isDatabaseAvailable = () => isDatabaseConfigured
