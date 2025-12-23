'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Term } from '../types'
import { getStatusConfig } from '../utils'

interface TermListItemProps {
  term: Term
  onEdit: (term: Term) => void
  onStatusChange: (id: string, name: string, newStatus: 'ACTIVE' | 'PAUSED' | 'ARCHIVED') => void
  onDelete: (term: Term) => void
}

export default function TermListItem({ term, onEdit, onStatusChange, onDelete }: TermListItemProps) {
  const statusConfig = getStatusConfig(term.status)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <span className={`${statusConfig.color} text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 shrink-0`}>
            <span>{statusConfig.icon}</span>
            <span>{statusConfig.label}</span>
          </span>

          <div className="min-w-0">
            <Link href={`/terms/${term.id}`} className="block">
              <div className="font-bold truncate">{term.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{term.termCode}</div>
            </Link>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
              <span>{term.termType === 'POLICE' ? '🚔' : '🚒'} {term.termType === 'POLICE' ? 'Polis' : 'İtfaiye'}</span>
              <span>⏱️ {term.duration === 'FOUR_MONTHS' ? '4 Ay' : '6 Ay'}</span>
              <span>📅 {new Date(term.startDate).toLocaleDateString('tr-TR')}</span>
              <span>👨‍🎓 {term._count.students}</span>
              <span>🏫 {term._count.classes}</span>
              <span>👨‍🏫 {term._count.instructorTerms}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onEdit(term)}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded transition-colors flex items-center gap-2"
          >
            <Icon icon="ph:pencil-bold" width="16" />
            Düzenle
          </button>

          {term.status === 'ACTIVE' && (
            <button
              onClick={() => onStatusChange(term.id, term.name, 'PAUSED')}
              className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded transition-colors flex items-center gap-2"
            >
              <Icon icon="ph:pause-bold" width="16" />
              Duraklat
            </button>
          )}

          {term.status === 'PAUSED' && (
            <button
              onClick={() => onStatusChange(term.id, term.name, 'ACTIVE')}
              className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors flex items-center gap-2"
            >
              <Icon icon="ph:play-bold" width="16" />
              Aktifleştir
            </button>
          )}

          {term.status === 'ARCHIVED' && (
            <button
              onClick={() => onStatusChange(term.id, term.name, 'ACTIVE')}
              className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm rounded transition-colors flex items-center gap-2"
            >
              <Icon icon="ph:arrow-counter-clockwise-bold" width="16" />
              Geri Al
            </button>
          )}

          {term.status !== 'ARCHIVED' && (
            <button
              onClick={() => onStatusChange(term.id, term.name, 'ARCHIVED')}
              className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded transition-colors flex items-center gap-2"
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
            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors flex items-center gap-2"
          >
            <Icon icon="ph:trash-bold" width="16" />
            Sil
          </button>
        </div>
      </div>
    </div>
  )
}
