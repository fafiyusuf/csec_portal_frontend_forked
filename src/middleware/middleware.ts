import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Define protected routes and their required roles
const protectedRoutes = {
  // Admin routes - only for President and Vice President
  '/main/admin': ['President', 'Vice President'],
  '/admin': ['President', 'Vice President'],
  '/admin/members': ['President', 'Vice President'],
  '/admin/heads': ['President', 'Vice President'],
  '/admin/rules': ['President', 'Vice President'],
  '/admin/divisions': ['President', 'Vice President'],
  '/admin/attendance': ['President', 'Vice President'],
  '/admin/resources': ['President', 'Vice President'],
  '/admin/settings': ['President', 'Vice President'],

  // Division routes - accessible by respective division heads and members
  '/cpd': ['Competitive Programming Division President', 'Member'],
  '/dev': ['Development Division President', 'Member'],
  '/cbd': ['Capacity Building Division President', 'Member'],
  '/sec': ['Cybersecurity Division President', 'Member'],
  '/ds': ['Data Science Division President', 'Member'],

  // Attendance routes - only for division heads and admin
  '/attendance': ['President', 'Vice President', 
    'Competitive Programming Division President',
    'Development Division President',
    'Capacity Building Division President',
    'Cybersecurity Division President',
    'Data Science Division President'
  ],

  // Session and Event routes
  '/sessions/create': ['President', 'Vice President',
    'Competitive Programming Division President',
    'Development Division President',
    'Capacity Building Division President',
    'Cybersecurity Division President',
    'Data Science Division President'
  ],
  '/sessions/edit': ['President', 'Vice President',
    'Competitive Programming Division President',
    'Development Division President',
    'Capacity Building Division President',
    'Cybersecurity Division President',
    'Data Science Division President'
  ],
  '/events/create': ['President', 'Vice President',
    'Competitive Programming Division President',
    'Development Division President',
    'Capacity Building Division President',
    'Cybersecurity Division President',
    'Data Science Division President'
  ],
  '/events/edit': ['President', 'Vice President',
    'Competitive Programming Division President',
    'Development Division President',
    'Capacity Building Division President',
    'Cybersecurity Division President',
    'Data Science Division President'
  ],
};

// Map of division presidents to their respective divisions
const divisionPresidentMap = {
  'Competitive Programming Division President': 'Competitive Programming Division',
  'Development Division President': 'Development Division',
  'Capacity Building Division President': 'Capacity Building Division',
  'Cybersecurity Division President': 'Cybersecurity Division',
  'Data Science Division President': 'Data Science Division',

  
};

const publicRoutes = ['/auth/login', '/auth/register', '/', '/unauthorized'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a public route
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Get the token from both cookies and headers
  const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.split(' ')[1];

  // If no token and not a public route, redirect to login
  if (!token) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For protected routes, verify the token and roles
  const protectedRoute = Object.entries(protectedRoutes).find(([route]) => 
    pathname.startsWith(route)
  );

  if (protectedRoute) {
    try {
      // Verify token and get user roles
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE ;
      const meResponse = await fetch(`${baseUrl}/members/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Handle different response status codes
      if (meResponse.status === 403) {
        // Forbidden - redirect to unauthorized page
        const unauthorizedUrl = new URL('/unauthorized', request.url);
        unauthorizedUrl.searchParams.set('message', 'You do not have permission to access this page');
        return NextResponse.redirect(unauthorizedUrl);
      }

      if (meResponse.status === 401) {
        // Unauthorized - redirect to login
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (!meResponse.ok) {
        throw new Error(`Failed to verify user: ${meResponse.status}`);
      }

      const userData = await meResponse.json();
      const userRole = userData.member?.clubRole;

      if (!userRole) {
        // If user has no role, redirect to unauthorized
        const unauthorizedUrl = new URL('/unauthorized', request.url);
        unauthorizedUrl.searchParams.set('message', 'Your account does not have a valid role');
        return NextResponse.redirect(unauthorizedUrl);
      }

      // Check if user has required role
      const [route, requiredRoles] = protectedRoute;
      const hasRequiredRole = requiredRoles.some(role => userRole === role);

      if (!hasRequiredRole) {
        // Redirect to unauthorized with a message
        const unauthorizedUrl = new URL('/unauthorized', request.url);
        unauthorizedUrl.searchParams.set('message', `You need one of these roles to access ${route}: ${requiredRoles.join(', ')}`);
        return NextResponse.redirect(unauthorizedUrl);
      }

      // Add role to headers for downstream use
      const nextResponse = NextResponse.next();
      nextResponse.headers.set('x-user-role', userRole);
      return nextResponse;

    } catch (error) {
      console.error('Middleware error:', error);
      // If there's an error, redirect to login
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/main/:path*',
    '/admin/:path*',
    '/cpd/:path*',
    '/dev/:path*',
    '/cbd/:path*',
    '/sec/:path*',
    '/ds/:path*',
    '/attendance/:path*',
    '/sessions/:path*',
    '/events/:path*',
  ],
}; 