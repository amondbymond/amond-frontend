import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Log INICIS return requests
  if (request.nextUrl.pathname === '/payment/inicis-return') {
    console.log('INICIS Return Request:', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/payment/:path*'
};