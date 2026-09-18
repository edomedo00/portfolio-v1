import { defineQuery } from "next-sanity";

export const SITE_SETTINGS_QUERY = defineQuery(`
  *[_id == "siteSettings"][0] {
    _id,
    "siteTitle": displayName,
    siteUrl,
    defaultSeo {
      "title": coalesce(title[language == "es"][0].value, title[0].value),
      "description": coalesce(
        description[language == "es"][0].value,
        description[0].value
      ),
      image {
        ...,
        "alt": coalesce(alt[language == "es"][0].value, alt[0].value)
      },
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
      "title": coalesce(title[language == "es"][0].value, title[0].value),
      "description": coalesce(
        description[language == "es"][0].value,
        description[0].value
      ),
      image {
        ...,
        "alt": coalesce(alt[language == "es"][0].value, alt[0].value)
      },
      noIndex
    }
  }
`);

export const PROJECTS_CONTENT_QUERY = defineQuery(`
  {
    "page": *[_id == "projectsPage"][0] {
      "navigationLabel": coalesce(
        navigationLabel[language == $language][0].value,
        navigationLabel[language == "es"][0].value,
        navigationLabel[0].value,
        heading[language == $language][0].value,
        heading[language == "es"][0].value,
        heading[0].value
      ),
      "heading": coalesce(
        heading[language == $language][0].value,
        heading[language == "es"][0].value,
        heading[0].value
      ),
      "introduction": coalesce(
        introduction[language == $language][0].value,
        introduction[language == "es"][0].value,
        introduction[0].value
      ),
      seo {
        "title": coalesce(
          title[language == $language][0].value,
          title[language == "es"][0].value,
          title[0].value
        ),
        "description": coalesce(
          description[language == $language][0].value,
          description[language == "es"][0].value,
          description[0].value
        ),
        image {
          _key,
          _type,
          asset,
          crop,
          hotspot,
          isDecorative,
          "alt": coalesce(
            alt[language == $language][0].value,
            alt[language == "es"][0].value,
            alt[0].value
          )
        },
        noIndex
      }
    },
    "projects": *[_type == "project" && defined(slug.current)]
      | order(order asc, year desc, title asc) {
        _id,
        title,
        "slug": slug.current,
        order,
        year,
        disciplines,
        "projectType": coalesce(
          projectType[language == $language][0].value,
          projectType[language == "es"][0].value,
          projectType[0].value
        ),
        "body": coalesce(
          body[language == $language][0].value,
          body[language == "es"][0].value,
          body[0].value
        ),
        websiteUrl,
        codeUrl,
        gallery[] {
          _key,
          _type,
          asset,
          crop,
          hotspot,
          isDecorative,
          "alt": coalesce(
            alt[language == $language][0].value,
            alt[language == "es"][0].value,
            alt[0].value
          ),
          "caption": coalesce(
            caption[language == $language][0].value,
            caption[language == "es"][0].value,
            caption[0].value
          )
        },
        seo {
          "title": coalesce(
            title[language == $language][0].value,
            title[language == "es"][0].value,
            title[0].value
          ),
          "description": coalesce(
            description[language == $language][0].value,
            description[language == "es"][0].value,
            description[0].value
          ),
          image {
            _key,
            _type,
            asset,
            crop,
            hotspot,
            isDecorative,
            "alt": coalesce(
              alt[language == $language][0].value,
              alt[language == "es"][0].value,
              alt[0].value
            )
          },
          noIndex
        }
      }
  }
`);

export const PROJECT_BY_SLUG_QUERY = defineQuery(`
  *[_type == "project" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    order,
    year,
    disciplines,
    "projectType": coalesce(
      projectType[language == $language][0].value,
      projectType[language == "es"][0].value,
      projectType[0].value
    ),
    "body": coalesce(
      body[language == $language][0].value,
      body[language == "es"][0].value,
      body[0].value
    ),
    websiteUrl,
    codeUrl,
    gallery[] {
      _key,
      _type,
      asset,
      crop,
      hotspot,
      isDecorative,
      "alt": coalesce(
        alt[language == $language][0].value,
        alt[language == "es"][0].value,
        alt[0].value
      ),
      "caption": coalesce(
        caption[language == $language][0].value,
        caption[language == "es"][0].value,
        caption[0].value
      )
    },
    seo {
      "title": coalesce(
        title[language == $language][0].value,
        title[language == "es"][0].value,
        title[0].value
      ),
      "description": coalesce(
        description[language == $language][0].value,
        description[language == "es"][0].value,
        description[0].value
      ),
      image {
        _key,
        _type,
        asset,
        crop,
        hotspot,
        isDecorative,
        "alt": coalesce(
          alt[language == $language][0].value,
          alt[language == "es"][0].value,
          alt[0].value
        )
      },
      noIndex
    }
  }
`);

export const PROJECT_SLUGS_QUERY = defineQuery(`
  *[_type == "project" && defined(slug.current)] | order(order asc) {
    "slug": slug.current
  }
`);

export const SITE_CHROME_QUERY = defineQuery(`
  {
    "settings": *[_id == "siteSettings"][0] {
      displayName,
      "compactTitle": coalesce(compactTitle, displayName),
      "role": coalesce(
        role[language == $language][0].value,
        role[language == "es"][0].value,
        role[0].value
      ),
      siteUrl,
      timeZone,
      socialLinks[] {
        _key,
        url,
        "label": coalesce(
          label[language == $language][0].value,
          label[language == "es"][0].value,
          label[0].value
        )
      },
      defaultSeo {
        "title": coalesce(
          title[language == $language][0].value,
          title[language == "es"][0].value,
          title[0].value
        ),
        "description": coalesce(
          description[language == $language][0].value,
          description[language == "es"][0].value,
          description[0].value
        ),
        image {
          _key,
          _type,
          asset,
          crop,
          hotspot,
          isDecorative,
          "alt": coalesce(
            alt[language == $language][0].value,
            alt[language == "es"][0].value,
            alt[0].value
          )
        },
        noIndex
      }
    },
    "navigation": {
      "home": coalesce(
        *[_id == "homePage"][0].navigationLabel[language == $language][0].value,
        *[_id == "homePage"][0].navigationLabel[language == "es"][0].value,
        *[_id == "homePage"][0].navigationLabel[0].value
      ),
      "projects": coalesce(
        *[_id == "projectsPage"][0].navigationLabel[language == $language][0].value,
        *[_id == "projectsPage"][0].navigationLabel[language == "es"][0].value,
        *[_id == "projectsPage"][0].navigationLabel[0].value
      ),
      "archive": coalesce(
        *[_id == "archivePage"][0].navigationLabel[language == $language][0].value,
        *[_id == "archivePage"][0].navigationLabel[language == "es"][0].value,
        *[_id == "archivePage"][0].navigationLabel[0].value
      ),
      "cells": coalesce(
        *[_id == "cellsPage"][0].navigationLabel[language == $language][0].value,
        *[_id == "cellsPage"][0].navigationLabel[language == "es"][0].value,
        *[_id == "cellsPage"][0].navigationLabel[0].value
      ),
      "about": coalesce(
        *[_id == "aboutPage"][0].navigationLabel[language == $language][0].value,
        *[_id == "aboutPage"][0].navigationLabel[language == "es"][0].value,
        *[_id == "aboutPage"][0].navigationLabel[0].value
      ),
      "contact": coalesce(
        *[_id == "contactPage"][0].navigationLabel[language == $language][0].value,
        *[_id == "contactPage"][0].navigationLabel[language == "es"][0].value,
        *[_id == "contactPage"][0].navigationLabel[0].value
      )
    }
  }
`);

export const ARCHIVE_QUERY = defineQuery(`
  {
    "page": *[_id == "archivePage"][0] {
      "navigationLabel": coalesce(
        navigationLabel[language == $language][0].value,
        navigationLabel[language == "es"][0].value,
        navigationLabel[0].value,
        heading[language == $language][0].value,
        heading[language == "es"][0].value,
        heading[0].value
      ),
      "heading": coalesce(
        heading[language == $language][0].value,
        heading[language == "es"][0].value,
        heading[0].value
      ),
      "introduction": coalesce(
        introduction[language == $language][0].value,
        introduction[language == "es"][0].value,
        introduction[0].value
      ),
      "comingSoonLabel": coalesce(
        comingSoonLabel[language == $language][0].value,
        comingSoonLabel[language == "es"][0].value,
        comingSoonLabel[0].value
      ),
      seo {
        "title": coalesce(title[language == $language][0].value, title[language == "es"][0].value, title[0].value),
        "description": coalesce(description[language == $language][0].value, description[language == "es"][0].value, description[0].value),
        image {
          _key,
          _type,
          asset,
          crop,
          hotspot,
          isDecorative,
          "alt": coalesce(alt[language == $language][0].value, alt[language == "es"][0].value, alt[0].value)
        },
        noIndex
      }
    },
    "projects": *[_type == "archiveProject" && defined(slug.current)]
      | order(order asc, archiveId asc) {
        _id,
        archiveId,
        title,
        "slug": slug.current,
        order,
        "detailTitle": coalesce(
          detailTitle[language == $language][0].value,
          detailTitle[language == "es"][0].value,
          detailTitle[0].value
        ),
        "body": coalesce(
          body[language == $language][0].value,
          body[language == "es"][0].value,
          body[0].value
        ),
        websiteUrl,
        codeUrl,
        "previewImage": coalesce(previewImage, gallery[0]) {
          _key,
          _type,
          asset,
          crop,
          hotspot,
          isDecorative,
          "alt": coalesce(alt[language == $language][0].value, alt[language == "es"][0].value, alt[0].value),
          "caption": coalesce(caption[language == $language][0].value, caption[language == "es"][0].value, caption[0].value)
        },
        gallery[] {
          _key,
          _type,
          asset,
          crop,
          hotspot,
          isDecorative,
          "alt": coalesce(alt[language == $language][0].value, alt[language == "es"][0].value, alt[0].value),
          "caption": coalesce(caption[language == $language][0].value, caption[language == "es"][0].value, caption[0].value)
        },
        seo {
          "title": coalesce(title[language == $language][0].value, title[language == "es"][0].value, title[0].value),
          "description": coalesce(description[language == $language][0].value, description[language == "es"][0].value, description[0].value),
          image {
            _key,
            _type,
            asset,
            crop,
            hotspot,
            isDecorative,
            "alt": coalesce(alt[language == $language][0].value, alt[language == "es"][0].value, alt[0].value)
          },
          noIndex
        }
      }
  }
`);

export const ARCHIVE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "archiveProject" && slug.current == $slug][0] {
    _id,
    archiveId,
    title,
    "slug": slug.current,
    order,
    "detailTitle": coalesce(
      detailTitle[language == $language][0].value,
      detailTitle[language == "es"][0].value,
      detailTitle[0].value
    ),
    "body": coalesce(
      body[language == $language][0].value,
      body[language == "es"][0].value,
      body[0].value
    ),
    websiteUrl,
    codeUrl,
    "previewImage": coalesce(previewImage, gallery[0]) {
      _key,
      _type,
      asset,
      crop,
      hotspot,
      isDecorative,
      "alt": coalesce(alt[language == $language][0].value, alt[language == "es"][0].value, alt[0].value),
      "caption": coalesce(caption[language == $language][0].value, caption[language == "es"][0].value, caption[0].value)
    },
    gallery[] {
      _key,
      _type,
      asset,
      crop,
      hotspot,
      isDecorative,
      "alt": coalesce(alt[language == $language][0].value, alt[language == "es"][0].value, alt[0].value),
      "caption": coalesce(caption[language == $language][0].value, caption[language == "es"][0].value, caption[0].value)
    },
    seo {
      "title": coalesce(title[language == $language][0].value, title[language == "es"][0].value, title[0].value),
      "description": coalesce(description[language == $language][0].value, description[language == "es"][0].value, description[0].value),
      image {
        _key,
        _type,
        asset,
        crop,
        hotspot,
        isDecorative,
        "alt": coalesce(alt[language == $language][0].value, alt[language == "es"][0].value, alt[0].value)
      },
      noIndex
    }
  }
`);

export const ABOUT_PAGE_QUERY = defineQuery(`
  *[_id == "aboutPage"][0] {
    "heading": coalesce(heading[language == $language][0].value, heading[language == "es"][0].value, heading[0].value),
    "browserTitle": coalesce(
      browserTitle[language == $language][0].value,
      browserTitle[language == "es"][0].value,
      browserTitle[0].value,
      heading[language == $language][0].value,
      heading[language == "es"][0].value,
      heading[0].value
    ),
    "body": coalesce(body[language == $language][0].value, body[language == "es"][0].value, body[0].value),
    seo {
      "title": coalesce(title[language == $language][0].value, title[language == "es"][0].value, title[0].value),
      "description": coalesce(description[language == $language][0].value, description[language == "es"][0].value, description[0].value),
      image {
        _key,
        _type,
        asset,
        crop,
        hotspot,
        isDecorative,
        "alt": coalesce(alt[language == $language][0].value, alt[language == "es"][0].value, alt[0].value)
      },
      noIndex
    }
  }
`);

export const CONTACT_PAGE_QUERY = defineQuery(`
  *[_id == "contactPage"][0] {
    "heading": coalesce(heading[language == $language][0].value, heading[language == "es"][0].value, heading[0].value),
    "introduction": coalesce(introduction[language == $language][0].value, introduction[language == "es"][0].value, introduction[0].value),
    email,
    "emailLabel": coalesce(emailLabel[language == $language][0].value, emailLabel[language == "es"][0].value, emailLabel[0].value),
    seo {
      "title": coalesce(title[language == $language][0].value, title[language == "es"][0].value, title[0].value),
      "description": coalesce(description[language == $language][0].value, description[language == "es"][0].value, description[0].value),
      image {
        _key,
        _type,
        asset,
        crop,
        hotspot,
        isDecorative,
        "alt": coalesce(alt[language == $language][0].value, alt[language == "es"][0].value, alt[0].value)
      },
      noIndex
    }
  }
`);

export const CELLS_PAGE_QUERY = defineQuery(`
  *[_id == "cellsPage"][0] {
    "title": coalesce(title[language == $language][0].value, title[language == "es"][0].value, title[0].value),
    "description": coalesce(description[language == $language][0].value, description[language == "es"][0].value, description[0].value),
    backgroundSettingsJson,
    seo {
      "title": coalesce(title[language == $language][0].value, title[language == "es"][0].value, title[0].value),
      "description": coalesce(description[language == $language][0].value, description[language == "es"][0].value, description[0].value),
      image {
        _key,
        _type,
        asset,
        crop,
        hotspot,
        isDecorative,
        "alt": coalesce(alt[language == $language][0].value, alt[language == "es"][0].value, alt[0].value)
      },
      noIndex
    }
  }
`);

export const ARCHIVE_SLUGS_QUERY = defineQuery(`
  *[_type == "archiveProject" && defined(slug.current)] | order(order asc) {
    "slug": slug.current
  }
`);
