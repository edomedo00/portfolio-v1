import type {Metadata} from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {AnimatedRoutePanel} from '@/components/animated-route-panel'
import {RichText} from '@/components/rich-text'
import {getLocale} from '@/i18n/locale'
import {getAboutContent, getSiteChrome} from '@/sanity/lib/content'
import {buildMetadata} from '@/sanity/lib/metadata'
import styles from './page.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const language = await getLocale()
  const [content, {settings}] = await Promise.all([
    getAboutContent(language),
    getSiteChrome(language),
  ])
  return buildMetadata({fallbackTitle: content.heading, seo: content.seo, site: settings})
}

export default async function AboutPage() {
  const language = await getLocale()
  const [content, chrome] = await Promise.all([
    getAboutContent(language),
    getSiteChrome(language),
  ])
  const closeLabel = language === 'es' ? 'Cerrar acerca de' : 'Close about'
  const socialsLabel = language === 'es' ? 'Redes sociales' : 'Social links'

  return (
    <AnimatedRoutePanel className={styles.panel} labelledBy="about-title">
      <div className={styles.panelContent}>
        <header className={styles.panelHeader}>
          <Link className={styles.close} href="/" aria-label={closeLabel}>
            <Image
              className={styles.closeIcon}
              src="/icons/cross.svg"
              width={14}
              height={14}
              alt=""
            />
          </Link>

          <h2 className={styles.heading} id="about-title">
            {content.heading}
          </h2>
        </header>

        <div className={styles.description}>
          <RichText value={content.body} />
        </div>

        <div className={styles.socials} aria-label={socialsLabel}>
          {chrome.settings.socialLinks.map((link) => (
            <a
              className={styles.socialLink}
              href={link.url}
              key={link._key}
              target="_blank"
              rel="noreferrer"
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </AnimatedRoutePanel>
  )
}
