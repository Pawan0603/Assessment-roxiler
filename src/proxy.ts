import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(request: NextRequest) {
  let cookies = request.cookies.get('token');
  const token = cookies?.value;

  if (cookies && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!cookies && (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/owner'))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if(token){
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const userRole = payload.role;

    if(userRole !== 'admin' && request.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if(userRole !== 'owner' && request.nextUrl.pathname.startsWith('/owner')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
}

export const config = {
  matcher: [
    '/login/:path*',
    '/signup/:path*',
    '/admin/:path*',
    '/owner/:path*',
  ],
}