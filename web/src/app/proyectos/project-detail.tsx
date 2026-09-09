import Image from "next/image";
import Link from "next/link";
import type { Project } from "./projects";
import styles from "./page.module.css";

type ProjectDetailProps = {
  project: Project;
};

export function ProjectDetail({ project }: ProjectDetailProps) {
  const metaParts = project.meta.split(" / ");
  const year = metaParts.at(-1) ?? "";
  const disciplines = metaParts.slice(0, -1).join(" / ");
  const projectName = project.title.toUpperCase();
  const galleryImages = [
    {
      src: project.preview.src,
      alt: project.preview.alt,
    },
    {
      src: "/projects/kaomaxi/hero.png",
      alt: `Vista amplia del proyecto ${project.title}`,
    },
    {
      src: "/projects/kaomaxi/preview.png",
      alt: `Vista secundaria del proyecto ${project.title}`,
    },
  ];

  return (
    <div className={styles.modalLayer}>
      <Link
        aria-hidden="true"
        className={styles.modalBackdrop}
        href="/proyectos"
        scroll={false}
        tabIndex={-1}
      />

      <section
        aria-labelledby="project-detail-title"
        aria-modal="true"
        className={styles.projectModal}
        role="dialog"
      >
        <div className={styles.projectDetail}>
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

          <h2 className={styles.projectDetailTitle} id="project-detail-title">
            {project.title}
          </h2>

          <div className={styles.projectDetailMeta}>
            <span>{disciplines}</span>
            <span>{year}</span>
          </div>

          <div className={styles.projectDetailCopy}>
            <p>
              DISEÑO Y DESARROLLO DEL SITIO WEB DE {projectName}, CREADO PARA
              TRASLADAR SU IDENTIDAD A UNA EXPERIENCIA DIGITAL CLARA, DINÁMICA
              Y VISUALMENTE ATRACTIVA.
            </p>
            <p>
              EL PROYECTO COMBINA UNA INTERFAZ CONTEMPORÁNEA, NAVEGACIÓN
              INTUITIVA Y DISEÑO RESPONSIVO PARA OFRECER UNA EXPERIENCIA FLUIDA
              EN CUALQUIER DISPOSITIVO.
            </p>
          </div>

          <span className={styles.projectDetailAction}>
            VISITAR
            <Image
              alt=""
              height={17}
              src="/icons/up-right-arrow.svg"
              width={17}
            />
          </span>
        </div>

        <div className={styles.projectMediaViewport}>
          <div
            aria-label={`Imágenes del proyecto ${project.title}`}
            className={styles.projectMediaCarousel}
            role="region"
            tabIndex={0}
          >
            {galleryImages.map((image, index) => (
              <figure
                className={styles.projectDetailMedia}
                key={`${image.src}-${index}`}
              >
                <Image
                  alt={image.alt}
                  className={styles.projectDetailImage}
                  fill
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="45vw"
                  src={image.src}
                />
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
