import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale } from "@/i18n/locale";
import { buildProjectMetadata } from "@/sanity/lib/project-metadata";
import { getProjectBySlug, getProjectSlugs } from "@/sanity/lib/projects";
import { ProjectDetail } from "../project-detail";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return (await getProjectSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const language = await getLocale();
  const project = await getProjectBySlug(slug, language);
  return project ? buildProjectMetadata(project.title, project.seo) : {};
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const language = await getLocale();
  const project = await getProjectBySlug(slug, language);

  if (!project) {
    notFound();
  }

  return <ProjectDetail language={language} project={project} />;
}
