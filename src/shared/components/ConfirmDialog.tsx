'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Onayla',
  cancelText = 'İptal',
  type = 'warning',
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!isOpen || !mounted) return null

  const typeColors = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-orange-600 hover:bg-orange-700',
    info: 'bg-blue-600 hover:bg-blue-700',
  }

  const typeIcons = {
    danger: '🗑️',
    warning: '⚠️',
    info: 'ℹ️',
  }

  const dialogContent = (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl transform transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 text-3xl bg-gray-100 dark:bg-gray-700 rounded-full">
              {typeIcons[type]}
            </div>
            
            {/* Title */}
            <h3 className="text-lg font-semibold text-center mb-2">
              {title}
            </h3>
            
            {/* Message */}
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6 whitespace-pre-line">
              {message}
            </p>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm()
                  onClose()
                }}
                className={`flex-1 px-4 py-2 ${typeColors[type]} text-white rounded-lg transition-colors`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(dialogContent, document.body)
}
