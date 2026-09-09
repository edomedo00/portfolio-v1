import Image from "next/image";
import Link from "next/link";
import { AnimatedRoutePanel } from "@/components/animated-route-panel";
import styles from "./page.module.css";

export default function ContactPage() {
  return (
    <AnimatedRoutePanel className={styles.panel} labelledBy="contact-title">
      <div className={styles.panelContent}>
          <header className={styles.panelHeader}>
            <Link className={styles.close} href="/" aria-label="Cerrar contacto">
              <Image
                className={styles.closeIcon}
                src="/icons/cross.svg"
                width={14}
                height={14}
                alt=""
              />
            </Link>

            <h2 className={styles.heading} id="contact-title">
              CONTACTO
            </h2>
          </header>

          <form className={styles.form}>
            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="contact-name">NOMBRE*</label>
                <input
                  autoComplete="name"
                  id="contact-name"
                  name="name"
                  required
                  type="text"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="contact-email">CORREO*</label>
                <input
                  autoComplete="email"
                  id="contact-email"
                  name="email"
                  required
                  type="email"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="contact-subject">ASUNTO*</label>
              <input id="contact-subject" name="subject" required type="text" />
            </div>

            <div className={styles.field}>
              <label htmlFor="contact-message">MENSAJE*</label>
              <textarea id="contact-message" name="message" required />
            </div>

            <button className={styles.submit} type="submit">
              ENVIAR
            </button>
          </form>
      </div>
    </AnimatedRoutePanel>
  );
}
