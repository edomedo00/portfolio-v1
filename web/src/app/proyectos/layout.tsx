import type { ReactNode } from "react";
import { ProjectsView } from "./projects-view";

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return <ProjectsView>{children}</ProjectsView>;
}
