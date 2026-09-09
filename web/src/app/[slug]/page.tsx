import { notFound } from "next/navigation";
import { sanityFetch } from "@/sanity/lib/live";
import { PAGE_BY_SLUG_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const [{ data: page }, { data: settings }] = await Promise.all([
    sanityFetch({
      query: PAGE_BY_SLUG_QUERY,
      params: { slug },
      stega: false,
    }),
    sanityFetch({
      query: SITE_SETTINGS_QUERY,
      stega: false,
    }),
  ]);

  if (!page) return {};

  const title =
    page.seo?.title ??
    page.title ??
    settings?.defaultSeo?.title ??
    settings?.siteTitle ??
    "Untitled page";

  const description =
    page.seo?.description ?? settings?.defaultSeo?.description ?? undefined;

  const seoImage = page.seo?.image ?? settings?.defaultSeo?.image;

  const image = seoImage?.asset
    ? {
        url: urlFor(seoImage).width(1200).height(630).fit("crop").url(),
        width: 1200,
        height: 630,
        alt: seoImage.alt ?? title,
      }
    : undefined;

  const noIndex =
    page.seo?.noIndex === true || settings?.defaultSeo?.noIndex === true;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image.url] : undefined,
    },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  const { data: page } = await sanityFetch({
    query: PAGE_BY_SLUG_QUERY,
    params: { slug },
  });

  if (!page) notFound();

  return (
    <section>
      <h1>{page.title}</h1>
    </section>
  );
}
