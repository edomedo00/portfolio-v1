import { defineQuery } from "next-sanity";

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_id == "siteSettings"][0] {
    _id,
    siteTitle,
    siteUrl,
    defaultSeo {
      title,
      description,
      image,
      noIndex
    }
  }
`);

export const PAGE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "page" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    seo {
      title,
      description,
      image,
      noIndex
    }
  }
`);
