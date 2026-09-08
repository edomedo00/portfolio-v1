import Image from "next/image";
import Link from "next/link";
import { PortfolioShell } from "@/components/portfolio-shell";
import { ProjectsGallery } from "./projects-gallery";
import { getProject, projects } from "./projects";
import styles from "./page.module.css";

type ProjectsViewProps = {
  selectedSlug?: string;
};

export function ProjectsView({ selectedSlug }: ProjectsViewProps) {
  const selectedProject = selectedSlug ? getProject(selectedSlug) : undefined;

  return (
    <PortfolioShell
      activeItem="projects"
      headerVariant="compact"
      showLocalTime
    >
      <h1 className={styles.visuallyHidden}>Proyectos</h1>

      <p className={styles.collectionIntro}>
        UNA COLECCIÓN DE PROYECTOS DE DISEÑO Y DESARROLLO WEB_
      </p>

      <ProjectsGallery projects={projects} />

      {selectedProject ? (
        <div className={styles.modalLayer}>
          <section
            aria-label={`Proyecto ${selectedProject.title}`}
            className={styles.projectModal}
          >
            <Link
              aria-label="Cerrar proyecto"
              className={styles.modalClose}
              href="/proyectos"
              scroll={false}
            >
              <Image
                alt=""
                className={styles.modalCloseIcon}
                height={14}
                src="/icons/cross.svg"
                width={14}
              />
            </Link>
          </section>
        </div>
      ) : null}
    </PortfolioShell>
  );
}
