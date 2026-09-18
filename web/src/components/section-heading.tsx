import styles from './section-heading.module.css'

export function SectionHeading({children}: {children: string}) {
  return <h1 className={styles.heading}>{children}</h1>
}
