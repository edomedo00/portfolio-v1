import {CogIcon} from '@sanity/icons/Cog'
import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      S.divider(),
      ...S.documentTypeListItems().filter((item) => item.getId() !== 'siteSettings'),
    ])
