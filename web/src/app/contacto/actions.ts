'use server'

import {stegaClean} from '@sanity/client/stega'
import {Resend} from 'resend'
import type {Locale} from '@/content/types'
import {getContactContent} from '@/sanity/lib/content'

export type ContactFormState = {
  message: string
  status: 'idle' | 'success' | 'error'
}

const responseCopy = {
  es: {
    error: 'NO SE PUDO ENVIAR EL MENSAJE. INTÉNTALO DE NUEVO.',
    invalid: 'REVISA LOS CAMPOS E INTÉNTALO DE NUEVO.',
    success: 'MENSAJE ENVIADO. GRACIAS POR ESCRIBIRME.',
  },
  en: {
    error: 'THE MESSAGE COULD NOT BE SENT. PLEASE TRY AGAIN.',
    invalid: 'CHECK THE FIELDS AND TRY AGAIN.',
    success: 'MESSAGE SENT. THANK YOU FOR REACHING OUT.',
  },
} as const

function getFormValue(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;',
    }

    return entities[character]
  })
}

export async function sendContactEmail(
  language: Locale,
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const locale: Locale = language === 'en' ? 'en' : 'es'
  const copy = responseCopy[locale]
  const name = getFormValue(formData, 'name')
  const email = getFormValue(formData, 'email')
  const subject = getFormValue(formData, 'subject').replace(/[\r\n]+/g, ' ')
  const message = getFormValue(formData, 'message')
  const website = getFormValue(formData, 'website')

  if (website) return {message: copy.success, status: 'success'}

  if (
    !name ||
    !email ||
    !subject ||
    !message ||
    name.length > 120 ||
    email.length > 254 ||
    subject.length > 200 ||
    message.length > 5000 ||
    !isValidEmail(email)
  ) {
    return {message: copy.invalid, status: 'error'}
  }

  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.RESEND_FROM_EMAIL?.trim()

  if (!apiKey || !from) {
    return {message: copy.error, status: 'error'}
  }

  try {
    const contact = await getContactContent(locale)
    const recipient = stegaClean(contact.email).trim()

    if (!isValidEmail(recipient)) {
      return {message: copy.error, status: 'error'}
    }

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeSubject = escapeHtml(subject)
    const safeMessage = escapeHtml(message).replace(/\r?\n/g, '<br />')
    const resend = new Resend(apiKey)
    const {error} = await resend.emails.send({
      from,
      html: `
        <h1>Portfolio contact</h1>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Subject:</strong> ${safeSubject}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `,
      replyTo: email,
      subject: `Portfolio — ${subject}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`,
      to: [recipient],
    })

    if (error) return {message: copy.error, status: 'error'}

    return {message: copy.success, status: 'success'}
  } catch {
    return {message: copy.error, status: 'error'}
  }
}
