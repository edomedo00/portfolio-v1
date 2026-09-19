'use client'

import {useEffect, useState} from 'react'
import styles from './section-heading.module.css'

const titleTransitionDuration = 720

export function SectionHeading({
  children,
  exiting = false,
  onExitComplete,
}: {
  children: string
  exiting?: boolean
  onExitComplete?: () => void
}) {
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setExpanded(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!exiting) return

    const frame = window.requestAnimationFrame(() => setExpanded(false))
    const timer = window.setTimeout(() => onExitComplete?.(), titleTransitionDuration)
    return () => {
      window.cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [exiting, onExitComplete])

  return (
    <div className={`${styles.slot} ${expanded && !exiting ? styles.expanded : ''}`}>
      <div className={styles.slotInner}>
        <h1 className={styles.heading}>{children}</h1>
      </div>
    </div>
  )
}
