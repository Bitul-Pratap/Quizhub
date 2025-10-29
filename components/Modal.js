import React, { useEffect, useRef } from 'react'

/**
 * Reusable Modal component
 * Props:
 * - isOpen: boolean
 * - onClose: function
 * - type: 'info' | 'success' | 'error' | 'warning' | 'confirm'
 * - title: string or React node
 * - content: string or React node
 * - actions: [{ label, onClick, variant: 'primary'|'secondary'|'danger' }]
 * - size: 'sm'|'md'|'lg'
 */

const TYPE_STYLES = {
  info: { color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/10' },
  success: { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
  error: { color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-900/10' },
  warning: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10' },
  confirm: { color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/10' },
}

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

function focusableSelectors() {
  return [
    'a[href]',
    'area[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    'button:not([disabled])',
    'iframe',
    'object',
    'embed',
    '[contenteditable]',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',')
}

export default function Modal({
  isOpen = false,
  onClose = () => {},
  type = 'info',
  title = null,
  content = null,
  actions = [],
  size = 'md',
  ariaId = 'modal-title',
  ariaDescId = 'modal-desc',
}) {
  const overlayRef = useRef(null)
  const modalRef = useRef(null)
  const previousActiveRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      previousActiveRef.current = document.activeElement
      // focus first focusable element in modal after open
      setTimeout(() => {
        const focusable = modalRef.current?.querySelectorAll(focusableSelectors()) || []
        if (focusable.length) {
          focusable[0].focus()
        } else if (modalRef.current) {
          modalRef.current.focus()
        }
      }, 50)

      const onKeyDown = (e) => {
        if (e.key === 'Escape') {
          e.stopPropagation()
          onClose()
        }
        if (e.key === 'Tab') {
          // trap focus
          const focusable = Array.from(modalRef.current.querySelectorAll(focusableSelectors()))
          if (focusable.length === 0) {
            e.preventDefault()
            return
          }
          const first = focusable[0]
          const last = focusable[focusable.length - 1]
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }

      document.addEventListener('keydown', onKeyDown)
      return () => {
        document.removeEventListener('keydown', onKeyDown)
      }
    } else {
      // restore focus
      if (previousActiveRef.current && previousActiveRef.current.focus) {
        try { previousActiveRef.current.focus() } catch (e) {}
      }
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const typeStyle = TYPE_STYLES[type] || TYPE_STYLES.info

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-hidden={!isOpen}
    >
      {/* backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => onClose()}
      />

      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ariaId}
        aria-describedby={ariaDescId}
        tabIndex={-1}
        className={`relative w-full mx-4 ${SIZE_CLASSES[size] || SIZE_CLASSES.md} ${typeStyle.bg} rounded-lg shadow-lg dark:shadow-black/40 border border-slate-200 dark:border-slate-700`}
      >
        <div className="flex items-start justify-between gap-4 p-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${typeStyle.bg} ${typeStyle.color} shrink-0`}> 
                {/* simple icon placeholder */}
                {type === 'success' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                )}
                {type === 'error' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                )}
                {type === 'warning' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>
                )}
                {type === 'info' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
                )}
                {type === 'confirm' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4" /></svg>
                )}
              </div>

              <div className="min-w-0">
                {title && (
                  <h3 id={ariaId} className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
                )}
              </div>
            </div>

            <div id={ariaDescId} className="mt-3 text-sm text-center text-slate-700 dark:text-slate-300">
              {typeof content === 'string' ? <p>{content}</p> : content}
            </div>
          </div>

          <div className="flex items-start">
            <button
              onClick={() => onClose()}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
              aria-label="Close dialog"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </button>
          </div>
        </div>

        {actions && actions.length > 0 && (
          <div className="flex items-center justify-end gap-3 p-4 pt-0 border-t border-slate-200 dark:border-slate-700">
            {actions.map((act, idx) => {
              const variant = act.variant || 'primary'
              const base = 'px-4 py-2 rounded-md text-sm font-medium'
              const variants = {
                primary: 'bg-gradient-to-r from-orange-400 to-[#FF5F1F] text-white hover:from-orange-500 hover:to-orange-500',
                secondary: 'bg-white/80 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
                danger: 'bg-rose-500 text-white hover:bg-rose-600',
              }
              return (
                <button
                  key={idx}
                  onClick={act.onClick}
                  className={`${base} ${variants[variant] || variants.primary}`}
                >
                  {act.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
