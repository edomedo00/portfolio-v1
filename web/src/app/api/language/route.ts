import {cookies} from 'next/headers'
import {NextResponse} from 'next/server'
import {languageCookie} from '@/i18n/locale'

export async function POST(request: Request) {
  const body = (await request.json()) as {language?: unknown}

  if (body.language !== 'en' && body.language !== 'es') {
    return NextResponse.json({error: 'Unsupported language'}, {status: 400})
  }

  const cookieStore = await cookies()
  cookieStore.set(languageCookie, body.language, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })

  return NextResponse.json({language: body.language})
}
