'use client'

import { Icon } from '@iconify/react'
import { useEffect } from 'react'

export interface ToastProps {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
  onClose: (id: string) => void
}

export default function Toast({ id, message, type, duration = 4000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const config = {
    success: {
      icon: 'ph:check-circle-bold',
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      progressColor: 'bg-green-700',
    },
    error: {
      icon: 'ph:x-circle-bold',
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      progressColor: 'bg-red-700',
    },
    warning: {
      icon: 'ph:warning-bold',
      bgColor: 'bg-orange-500',
      textColor: 'text-white',
      progressColor: 'bg-orange-700',
    },
    info: {
      icon: 'ph:info-bold',
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      progressColor: 'bg-blue-700',
    },
  }[type]

  return (
    <div
      className={`${config.bgColor} ${config.textColor} rounded-lg shadow-xl p-4 min-w-[300px] max-w-md animate-slide-in-right relative overflow-hidden`}
    >
      <div className="flex items-start gap-3">
        <Icon icon={config.icon} width="24" className="flex-shrink-0 mt-0.5" />
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <Icon icon="ph:x-bold" width="20" />
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-20">
        <div
          className={`${config.progressColor} h-full animate-progress`}
          style={{ animationDuration: `${duration}ms` }}
        />
      </div>
    </div>
  )
}
