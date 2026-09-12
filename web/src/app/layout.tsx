import type {Metadata} from 'next'
import {draftMode} from 'next/headers'
import localFont from 'next/font/local'
import {VisualEditing} from 'next-sanity/visual-editing'
import {PortfolioShell} from '@/components/portfolio-shell'
import {getLocale} from '@/i18n/locale'
import {getSiteChrome} from '@/sanity/lib/content'
import {SanityLive} from '@/sanity/lib/live'
import {buildMetadata} from '@/sanity/lib/metadata'
import './globals.css'

const montreal = localFont({
  src: './fonts/montreal-regular.otf',
  variable: '--font-montreal',
  display: 'swap',
  weight: '400',
  style: 'normal',
})

const haasDisplay = localFont({
  src: './fonts/neue-haas-grotesk-display-light-trial.otf',
  variable: '--font-haas-display',
  display: 'swap',
  weight: '300',
  style: 'normal',
})

const neueMontrealMono = localFont({
  src: './fonts/pp-neue-montreal-mono-book.ttf',
  variable: '--font-neue-montreal-mono',
  display: 'swap',
  weight: '400',
  style: 'normal',
})

export async function generateMetadata(): Promise<Metadata> {
  const language = await getLocale()
  const {settings} = await getSiteChrome(language)
  const metadata = buildMetadata({
    fallbackTitle: settings.displayName,
    seo: settings.defaultSeo,
    site: settings,
  })

  return {
    ...metadata,
    metadataBase: settings.siteUrl ? new URL(settings.siteUrl) : undefined,
  }
}

export default async function RootLayout({children}: LayoutProps<'/'>) {
  const language = await getLocale()
  const [chrome, preview] = await Promise.all([getSiteChrome(language), draftMode()])

  return (
    <html
      className={`${montreal.variable} ${haasDisplay.variable} ${neueMontrealMono.variable}`}
      lang={language}
    >
      <body>
        <PortfolioShell content={chrome} language={language}>
          {children}
        </PortfolioShell>
        <SanityLive />
        {preview.isEnabled ? <VisualEditing /> : null}
      </body>
    </html>
  )
}
