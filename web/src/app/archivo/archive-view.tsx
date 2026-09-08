import Image from "next/image";
import Link from "next/link";
import { PortfolioShell } from "@/components/portfolio-shell";
import { ArchiveCarousel } from "./archive-carousel";
import styles from "./page.module.css";

const archiveProjects = [
  {
    id: "001",
    title: "ASCII GARDEN",
    image: "/projects/kaomaxi/preview.png",
    imagePosition: "left center",
    kind: "image",
  },
  {
    id: "002",
    title: "ASCII GARDEN",
    image: "/projects/kaomaxi/hero.png",
    imagePosition: "45% center",
    kind: "video",
  },
  {
    id: "004",
    title: "ASCII GARDEN",
    image: "/projects/kaomaxi/hero.png",
    imagePosition: "75% center",
    kind: "video",
  },
  {
    id: "001",
    title: "ASCII GARDEN",
    image: "/projects/kaomaxi/preview.png",
    imagePosition: "left center",
    kind: "image",
  },
] as const;

type ArchiveViewProps = {
  showAsciiFlowers?: boolean;
};

export function ArchiveView({ showAsciiFlowers = false }: ArchiveViewProps) {
  return (
    <PortfolioShell activeItem="archive" headerVariant="compact" showLocalTime>
      <h1 className={styles.visuallyHidden}>Archivo</h1>

      <p className={styles.archiveIntro}>
        UN ESPACIO PARA MOSTRAR CONCEPTOS,
        <br />
        PROYECTOS SECUNDARIOS, EXPERIMENTOS,
        <br />
        COLABORACIONES_
      </p>

      <ArchiveCarousel className={styles.archiveViewport}>
        <section
          aria-label="Proyectos del archivo"
          className={styles.archiveTrack}
        >
          {archiveProjects.map((project, index) => (
            <Link
              className={styles.project}
              href="/archivo/ascii-flowers"
              key={`${project.id}-${index}`}
              scroll={false}
            >
              <article>
                <p className={styles.projectId}>[{project.id}]</p>

                <figure className={styles.projectFigure}>
                  <div className={styles.projectMedia}>
                    <Image
                      alt={`Vista previa de ${project.title}`}
                      className={styles.projectImage}
                      fill
                      loading={index === 0 ? "eager" : "lazy"}
                      sizes="(max-width: 48rem) calc(100vw - 2.5rem), calc(25vw - 2.1875rem)"
                      src={project.image}
                      style={{ objectPosition: project.imagePosition }}
                    />

                    {project.kind === "video" ? (
                      <span className={styles.playIcon} aria-hidden="true">
                        <span className={styles.playTriangle} />
                      </span>
                    ) : null}
                  </div>

                  <figcaption className={styles.projectCaption}>
                    <span>{project.title}</span>
                    <Image
                      alt=""
                      className={styles.projectArrow}
                      height={17}
                      src="/icons/up-right-arrow.svg"
                      width={17}
                    />
                  </figcaption>
                </figure>
              </article>
            </Link>
          ))}
        </section>
      </ArchiveCarousel>

      {showAsciiFlowers ? <AsciiFlowersDetail /> : null}
    </PortfolioShell>
  );
}

function AsciiFlowersDetail() {
  return (
    <div className={styles.modalLayer}>
      <section
        aria-labelledby="archive-detail-title"
        aria-modal="true"
        className={styles.detailPanel}
        role="dialog"
      >
        <div className={styles.detailContent}>
          <Link
            aria-label="Cerrar proyecto de archivo"
            className={styles.detailClose}
            href="/archivo"
            scroll={false}
          >
            <Image alt="" height={14} src="/icons/cross.svg" width={14} />
          </Link>

          <h2 className={styles.detailHeading} id="archive-detail-title">
            ASCII FLOWERS
          </h2>

          <div className={styles.detailCopy}>
            <p>
              THIS IS AN EXPANSION ON THE UNDERSTANDING OF FLOWERS AS CARRIERS
              OF BEAUTY. CHARACTERS AND SYMBOLS CARRY BEAUTY AS POTENTIAL
              EXPRESSORS OF CONCEPTS AND HOLDERS OF ALL POSSIBILITIES. WHITHIN
              THOSE COUNTLESS WAYS OF UNFOLDING LIES THE FIGURE OF A FOWER.
            </p>
            <p>
              THIS PROJECT WAS BUILT WITH THAT ON MIND. IT BUILDS FLOWER FIGURES
              USING ONLY TEXT CHARACTERS THROUGH A PROCEDURAL ALGORITHM,
              RESULTING IN A BEAUTIFUL TEXT GARDEN.
            </p>
          </div>

          <div className={styles.detailActions} aria-label="Enlaces del proyecto">
            <span className={styles.detailAction}>
              VISIT
              <Image alt="" height={17} src="/icons/up-right-arrow.svg" width={17} />
            </span>
            <span className={styles.detailAction}>
              CODE
              <Image alt="" height={17} src="/icons/up-right-arrow.svg" width={17} />
            </span>
          </div>

          <div className={styles.detailGallery} id="archive-gallery">
            <figure className={styles.detailMedia}>
              <Image
                alt="Vista amplia del jardín ASCII"
                className={styles.detailImage}
                fill
                loading="eager"
                sizes="36vw"
                src="/projects/kaomaxi/hero.png"
              />
            </figure>
            <figure className={styles.detailMedia}>
              <Image
                alt="Segunda vista del jardín ASCII"
                className={styles.detailImage}
                fill
                sizes="36vw"
                src="/projects/kaomaxi/preview.png"
              />
            </figure>
          </div>
        </div>
      </section>
    </div>
  );
}
