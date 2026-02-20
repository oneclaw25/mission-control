import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Basic Authentication Middleware
// Protects the entire Mission Control dashboard

export function middleware(request: NextRequest) {
  // Skip auth for health check (Render needs this)
  if (request.nextUrl.pathname === '/api/health') {
    return NextResponse.next()
  }

  // Get credentials from environment or use defaults
  const validUser = process.env.AUTH_USER || 'admin'
  const validPass = process.env.AUTH_PASS || 'mission2026'

  // Check for authorization header
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

  // Decode and validate credentials
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
  } catch {
    return new NextResponse('Invalid Authorization Header', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Mission Control"',
      },
    })
  }

  return NextResponse.next()
}

// Match all paths except static assets
export const config = {
  matcher: [
    '/',
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
