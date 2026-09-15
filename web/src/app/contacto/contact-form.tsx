'use client'

import {useActionState, useEffect, useRef} from 'react'
import type {Locale} from '@/content/types'
import {sendContactEmail, type ContactFormState} from './actions'
import styles from './page.module.css'

type ContactFormLabels = {
  email: string
  message: string
  name: string
  sending: string
  subject: string
}

type ContactFormProps = {
  labels: ContactFormLabels
  language: Locale
  submitLabel: string
}

const initialState: ContactFormState = {
  message: '',
  status: 'idle',
}

export function ContactForm({labels, language, submitLabel}: ContactFormProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, formAction, pending] = useActionState(
    sendContactEmail.bind(null, language),
    initialState,
  )

  useEffect(() => {
    if (state.status === 'success') formRef.current?.reset()
  }, [state.status])

  return (
    <form action={formAction} className={styles.form} ref={formRef}>
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          autoComplete="off"
          id="contact-website"
          name="website"
          tabIndex={-1}
          type="text"
        />
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor="contact-name">{labels.name}</label>
          <input
            autoComplete="name"
            id="contact-name"
            maxLength={120}
            name="name"
            required
            type="text"
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-email">{labels.email}</label>
          <input
            autoComplete="email"
            id="contact-email"
            maxLength={254}
            name="email"
            required
            type="email"
          />
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-subject">{labels.subject}</label>
        <input
          id="contact-subject"
          maxLength={200}
          name="subject"
          required
          type="text"
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-message">{labels.message}</label>
        <textarea
          id="contact-message"
          maxLength={5000}
          name="message"
          required
        />
      </div>

      <button className={styles.submit} disabled={pending} type="submit">
        {pending ? labels.sending : submitLabel}
      </button>

      {state.message ? (
        <p
          aria-live="polite"
          className={styles.formStatus}
          data-status={state.status}
          role={state.status === 'error' ? 'alert' : 'status'}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  )
}
