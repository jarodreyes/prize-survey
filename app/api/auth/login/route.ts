import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { createUserSession, generateUserId } from '@/lib/auth'
import { safeParse } from '@/lib/utils'

const loginSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parseResult = safeParse(loginSchema, body)
    
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error },
        { status: 400 }
      )
    }

    const { name, email } = parseResult.data
    
    // Create user session
    const user = {
      id: generateUserId(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
    }
    
    const sessionToken = createUserSession(user)
    
    // Set cookie
    const cookieStore = cookies()
    cookieStore.set('user-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Error in login:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
