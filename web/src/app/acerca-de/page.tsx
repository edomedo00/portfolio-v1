import Image from "next/image";
import Link from "next/link";
import { PortfolioShell } from "@/components/portfolio-shell";
import styles from "./page.module.css";

export default function AboutPage() {
  return (
    <PortfolioShell activeItem="about">
      <section className={styles.panel} aria-labelledby="about-title">
        <div className={styles.panelContent}>
          <header className={styles.panelHeader}>
            <Link
              className={styles.close}
              href="/"
              aria-label="Cerrar acerca de"
            >
              <Image
                className={styles.closeIcon}
                src="/icons/cross.svg"
                width={14}
                height={14}
                alt=""
              />
            </Link>

            <h2 className={styles.heading} id="about-title">
              ACERCA DE
            </h2>
          </header>

          <p className={styles.description}>
            SOY UN <strong>DESARROLLADOR WEB Y PROGRAMADOR CREATIVO.</strong>{" "}
            TRABAJO EN LA INTERSECCIÓN ENTRE TECNOLOGÍA, DISEÑO Y
            EXPERIMENTACIÓN VISUAL PARA CREAR EXPERIENCIAS DIGITALES QUE NO SOLO
            FUNCIONAN BIEN, SINO QUE TAMBIÉN DESPIERTAN{" "}
            <strong>CURIOSIDAD.</strong>
          </p>

          <div className={styles.socials} aria-label="Redes sociales">
            <a
              className={styles.socialLink}
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noreferrer"
            >
              LINKEDIN
            </a>
            <a
              className={styles.socialLink}
              href="https://x.com/"
              target="_blank"
              rel="noreferrer"
            >
              X(TWITTER)
            </a>
          </div>
        </div>
      </section>
    </PortfolioShell>
  );
}
