import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getLocale } from "@/i18n/locale";
import { buildProjectMetadata } from "@/sanity/lib/project-metadata";
import { getProjectsContent } from "@/sanity/lib/projects";
import { ProjectsView } from "./projects-view";

export async function generateMetadata(): Promise<Metadata> {
  const language = await getLocale();
  const { page } = await getProjectsContent(language);
  return buildProjectMetadata(page.heading, page.seo);
}

export default async function ProjectsLayout({ children }: { children: ReactNode }) {
  const language = await getLocale();
  const { page, projects } = await getProjectsContent(language);

  return (
    <ProjectsView
      heading={page.heading}
      introduction={page.introduction}
      language={language}
      projects={projects}
    >
      {children}
    </ProjectsView>
  );
}
