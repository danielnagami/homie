import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from './Button'

interface ModalProps {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
}

export function Modal({ open, title, subtitle, onClose, children }: ModalProps) {
  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/35 px-4 backdrop-blur-sm sm:items-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
      />
      <section className="relative flex max-h-[85dvh] w-full max-w-md flex-col rounded-t-[2.25rem] rounded-b-4xl bg-white shadow-soft sm:rounded-4xl">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5">
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-lavender-300" />
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-ink">{title}</h2>
              {subtitle && <p className="mt-1 text-sm font-semibold text-pebble">{subtitle}</p>}
            </div>
            <Button variant="ghost" onClick={onClose} aria-label="Close dialog" className="min-h-9 px-3">
              ×
            </Button>
          </div>
          {children}
        </div>
      </section>
    </div>,
    document.body,
  )
}
