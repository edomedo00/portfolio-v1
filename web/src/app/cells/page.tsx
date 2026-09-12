import {NavigationMenu} from '@/components/navigation-menu'
import {getLocale} from '@/i18n/locale'
import {getCellsContent, getSiteChrome} from '@/sanity/lib/content'
import {buildMetadata} from '@/sanity/lib/metadata'
import type {Metadata} from 'next'
import {OrganismExperience} from '../organismo/organism-experience'

export async function generateMetadata(): Promise<Metadata> {
  const language = await getLocale()
  const [content, {settings}] = await Promise.all([
    getCellsContent(language),
    getSiteChrome(language),
  ])
  return buildMetadata({fallbackTitle: content.title, seo: content.seo, site: settings})
}

export default async function CellsPage() {
  const language = await getLocale()
  const [content, chrome] = await Promise.all([
    getCellsContent(language),
    getSiteChrome(language),
  ])

  return (
    <OrganismExperience
      description={content.description}
      displayName={chrome.settings.displayName}
      key={content.backgroundSettingsJson ?? 'default-cells-settings'}
      language={language}
      navigation={
        <NavigationMenu
          labels={chrome.navigation}
          language={language}
        />
      }
      settingsJson={content.backgroundSettingsJson}
      title={content.title}
    />
  )
}
