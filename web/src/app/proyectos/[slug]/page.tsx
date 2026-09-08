import { notFound } from "next/navigation";
import { getProject, projects } from "../projects";
import { ProjectsView } from "../projects-view";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;

  if (!getProject(slug)) {
    notFound();
  }

  return <ProjectsView selectedSlug={slug} />;
}
