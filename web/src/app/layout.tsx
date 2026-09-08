import { SanityLive, sanityFetch } from "@/sanity/lib/live";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const montreal = localFont({
  src: "./fonts/montreal-regular.otf",
  variable: "--font-montreal",
  display: "swap",
  weight: "400",
  style: "normal",
});

const haasDisplay = localFont({
  src: "./fonts/neue-haas-grotesk-display-roman.otf",
  variable: "--font-haas-display",
  display: "swap",
  weight: "400",
  style: "normal",
});

const neueMontrealMono = localFont({
  src: "./fonts/pp-neue-montreal-mono-book.ttf",
  variable: "--font-neue-montreal-mono",
  display: "swap",
  weight: "400",
  style: "normal",
});

export async function generateMetadata(): Promise<Metadata> {
  const { data: settings } = await sanityFetch({
    query: SITE_SETTINGS_QUERY,
    stega: false,
  });

  const title =
    settings?.defaultSeo?.title ??
    settings?.siteTitle ??
    "Portfolio v1";

  const description =
    settings?.defaultSeo?.description ??
    "Personal portfolio.";

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
    <html
      lang="en"
      className={`${montreal.variable} ${haasDisplay.variable} ${neueMontrealMono.variable}`}
    >
      <body>
        {children}
        <SanityLive />
      </body>
    </html>
  );
}
