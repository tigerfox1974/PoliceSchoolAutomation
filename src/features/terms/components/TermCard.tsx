/**
 * TermCard Component
 * Grid görünümünde dönem kartı
 */

'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import type { Term } from '../types'
import { getStatusConfig } from '../utils'

interface TermCardProps {
  term: Term
  onEdit: (term: Term) => void
  onStatusChange: (id: string, name: string, status: Term['status']) => void
  onDelete: (term: Term) => void
}

export default function TermCard({
  term,
  onEdit,
  onStatusChange,
  onDelete,
}: TermCardProps) {
  const statusConfig = getStatusConfig(term.status)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 relative">
      <Link href={`/terms/${term.id}`} className="block">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold">{term.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {term.termCode}
            </p>
          </div>
          <span
            className={`${statusConfig.color} text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1`}
          >
            <span>{statusConfig.icon}</span>
            <span>{statusConfig.label}</span>
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <p>
            {term.termType === 'POLICE' ? '🚔' : '🚒'}{' '}
            {term.termType === 'POLICE' ? 'Polis Eğitimi' : 'İtfaiye Eğitimi'}
          </p>
          <p>⏱️ Süre: {term.duration === 'FOUR_MONTHS' ? '4 Ay' : '6 Ay'}</p>
          <p>
            📅 {new Date(term.startDate).toLocaleDateString('tr-TR')} -{' '}
            {new Date(term.endDate).toLocaleDateString('tr-TR')}
          </p>
          <div className="flex justify-between pt-4 border-t">
            <span>👨‍🎓 {term._count.students}</span>
            <span>🏫 {term._count.classes}</span>
            <span>👨‍🏫 {term._count.instructorTerms}</span>
          </div>
        </div>
      </Link>

      <div className="mt-4 pt-4 border-t space-y-2">
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onEdit(term)
            }}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
          >
            <Icon icon="ph:pencil-bold" width="16" />
            Düzenle
          </button>

          {term.status === 'ACTIVE' && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onStatusChange(term.id, term.name, 'PAUSED')
              }}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
            >
              <Icon icon="ph:pause-bold" width="16" />
              Duraklat
            </button>
          )}

          {term.status === 'PAUSED' && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onStatusChange(term.id, term.name, 'ACTIVE')
              }}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
            >
              <Icon icon="ph:play-bold" width="16" />
              Aktifleştir
            </button>
          )}

          {term.status === 'ARCHIVED' && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onStatusChange(term.id, term.name, 'ACTIVE')
              }}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
            >
              <Icon icon="ph:arrow-counter-clockwise-bold" width="16" />
              Geri Al
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {term.status !== 'ARCHIVED' && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onStatusChange(term.id, term.name, 'ARCHIVED')
              }}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
            >
              <Icon icon="ph:archive-bold" width="16" />
              Arşivle
            </button>
          )}

          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onDelete(term)
            }}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
          >
            <Icon icon="ph:trash-bold" width="16" />
            Sil
          </button>
        </div>
      </div>
    </div>
  )
}
