import {NextResponse, type NextRequest} from 'next/server'
import {languageCookie} from './i18n/config'

export function proxy(request: NextRequest) {
  const language = request.nextUrl.searchParams.get('lang')

  if (
    (request.method !== 'GET' && request.method !== 'HEAD') ||
    (language !== 'es' && language !== 'en')
  ) {
    return NextResponse.next()
  }

  // Apply the shared link's language before rendering, then allow manual switching.
  const destination = request.nextUrl.clone()
  destination.searchParams.delete('lang')
  const response = NextResponse.redirect(destination)
  response.cookies.set(languageCookie, language, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
  response.headers.set('Cache-Control', 'private, no-store')
  return response
}

export const config = {
  matcher: [
    {
      source: '/((?!api(?:/|$)|_next(?:/|$)|.*\\..*).*)',
      has: [{type: 'query', key: 'lang'}],
    },
  ],
}
