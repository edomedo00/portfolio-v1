import { SanityLive, sanityFetch } from "@/sanity/lib/live";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await sanityFetch({
    query: SITE_SETTINGS_QUERY,
    stega: false,
  });

  const title =
    settings?.defaultSeo?.title ??
    settings?.siteTitle ??
    "Next.js + Sanity Starter";

  const description =
    settings?.defaultSeo?.description ??
    "A reusable Next.js and Sanity starter.";

  const seoImage = settings?.defaultSeo?.image;

  const image = seoImage?.asset
    ? {
        url: urlFor(seoImage).width(1200).height(630).fit("crop").url(),
        width: 1200,
        height: 630,
        alt: seoImage.alt ?? title,
      }
    : undefined;

  return {
    metadataBase: settings?.siteUrl ? new URL(settings.siteUrl) : undefined,
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
    robots: settings?.defaultSeo?.noIndex
      ? { index: false, follow: false }
      : undefined,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        {children}
        <SanityLive />
      </body>
    </html>
  );
}
