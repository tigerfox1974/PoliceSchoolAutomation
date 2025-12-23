'use client'

import Toast, { ToastProps } from './Toast'

interface ToastContainerProps {
  toasts: Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    onClose: (id: string) => void
  }>
}

export default function ToastContainer({ toasts }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}
