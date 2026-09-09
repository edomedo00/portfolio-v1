import { notFound } from "next/navigation";
import { archiveProjects, getArchiveProject } from "../archive-projects";
import { ArchiveProjectDetail } from "../archive-view";

type ArchiveProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return archiveProjects.map((project) => ({ slug: project.slug }));
}

export default async function ArchiveProjectPage({
  params,
}: ArchiveProjectPageProps) {
  const { slug } = await params;
  const project = getArchiveProject(slug);

  if (!project) notFound();

  return <ArchiveProjectDetail project={project} />;
}
