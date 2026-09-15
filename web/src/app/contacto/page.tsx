import type {Metadata} from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {AnimatedRoutePanel} from '@/components/animated-route-panel'
import {getLocale} from '@/i18n/locale'
import {getContactContent, getSiteChrome} from '@/sanity/lib/content'
import {buildMetadata} from '@/sanity/lib/metadata'
import {ContactForm} from './contact-form'
import styles from './page.module.css'

const formCopy = {
  es: {
    close: 'Cerrar contacto',
    name: 'NOMBRE*',
    email: 'CORREO*',
    subject: 'ASUNTO*',
    message: 'MENSAJE*',
    sending: 'ENVIANDO…',
  },
  en: {
    close: 'Close contact',
    name: 'NAME*',
    email: 'EMAIL*',
    subject: 'SUBJECT*',
    message: 'MESSAGE*',
    sending: 'SENDING…',
  },
} as const

export async function generateMetadata(): Promise<Metadata> {
  const language = await getLocale()
  const [content, {settings}] = await Promise.all([
    getContactContent(language),
    getSiteChrome(language),
  ])
  return buildMetadata({fallbackTitle: content.heading, seo: content.seo, site: settings})
}

export default async function ContactPage() {
  const language = await getLocale()
  const content = await getContactContent(language)
  const labels = formCopy[language]

  return (
    <AnimatedRoutePanel className={styles.panel} labelledBy="contact-title">
      <div className={styles.panelContent}>
        <header className={styles.panelHeader}>
          <Link className={styles.close} href="/" aria-label={labels.close}>
            <Image
              className={styles.closeIcon}
              src="/icons/cross.svg"
              width={14}
              height={14}
              alt=""
            />
          </Link>

          <h2 className={styles.heading} id="contact-title">
            {content.heading}
          </h2>
        </header>

        <p className={styles.introduction}>{content.introduction}</p>

        <ContactForm
          labels={labels}
          language={language}
          submitLabel={content.emailLabel}
        />
      </div>
    </AnimatedRoutePanel>
  )
}
