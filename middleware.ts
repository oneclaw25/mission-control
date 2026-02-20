import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Basic Authentication Middleware with Cookie Session

const AUTH_COOKIE = 'mission_control_auth'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip auth for health check and static assets
  if (
    pathname === '/api/health' ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/images/') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next()
  }

  // Get credentials from environment
  const validUser = process.env.AUTH_USER || 'admin'
  const validPass = process.env.AUTH_PASS || 'mission2026'
  const validToken = Buffer.from(`${validUser}:${validPass}`).toString('base64')

  // Check for auth cookie first
  const authCookie = request.cookies.get(AUTH_COOKIE)?.value
  if (authCookie === validToken) {
    return NextResponse.next()
  }

  // Check authorization header
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return new NextResponse('Authentication Required', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Mission Control"',
        'Content-Type': 'text/plain',
      },
    })
  }

  // Validate credentials
  try {
    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
    const [user, pass] = credentials.split(':')

    if (user !== validUser || pass !== validPass) {
      return new NextResponse('Invalid Credentials', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Mission Control"',
          'Content-Type': 'text/plain',
        },
      })
    }

    // Set auth cookie for future requests
    const response = NextResponse.next()
    response.cookies.set({
      name: AUTH_COOKIE,
      value: validToken,
      maxAge: COOKIE_MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })

    return response
  } catch {
    return new NextResponse('Invalid Authorization', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Mission Control"',
      },
    })
  }
}

// Match all paths except static assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
