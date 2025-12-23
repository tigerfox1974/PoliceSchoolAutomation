'use client'

import Toast, { ToastProps } from './Toast'

export default function ToastContainer({ toasts }: { toasts: Omit<ToastProps, 'onClose'>[] & { onClose: (id: string) => void }[] }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}
