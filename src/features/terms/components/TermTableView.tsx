'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Term } from '../types'
import { getStatusConfig } from '../utils'

type SortField = 'name' | 'termType' | 'duration' | 'status' | 'endDate' | 'students' | 'classes' | 'instructors'
type SortOrder = 'asc' | 'desc'

interface TermTableViewProps {
  terms: Term[]
  sortBy: SortField
  sortOrder: SortOrder
  onSort: (field: SortField) => void
  onEdit: (term: Term) => void
  onStatusChange: (id: string, name: string, newStatus: 'ACTIVE' | 'PAUSED' | 'ARCHIVED') => void
  onDelete: (term: Term) => void
}

export default function TermTableView({
  terms,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onStatusChange,
  onDelete,
}: TermTableViewProps) {
  const renderSortButton = (field: SortField, label: string) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-2 font-semibold text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
    >
      {label}
      <span className="text-xs">
        {sortBy === field && (sortOrder === 'asc' ? '↑' : '↓')}
        {sortBy !== field && '↕'}
      </span>
    </button>
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">
                {renderSortButton('status', 'Durum')}
              </th>
              <th className="px-4 py-3 text-left">
                {renderSortButton('name', 'Dönem Adı')}
              </th>
              <th className="px-4 py-3 text-left">
                {renderSortButton('termType', 'Tip')}
              </th>
              <th className="px-4 py-3 text-left">
                {renderSortButton('duration', 'Süre')}
              </th>
              <th className="px-4 py-3 text-left">
                {renderSortButton('endDate', 'Bitiş Tarihi')}
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => onSort('students')}
                  className="flex items-center gap-2 font-semibold text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mx-auto"
                >
                  👨‍🎓 Öğrenci
                  <span className="text-xs">
                    {sortBy === 'students' && (sortOrder === 'asc' ? '↑' : '↓')}
                    {sortBy !== 'students' && '↕'}
                  </span>
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => onSort('classes')}
                  className="flex items-center gap-2 font-semibold text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mx-auto"
                >
                  🏫 Sınıf
                  <span className="text-xs">
                    {sortBy === 'classes' && (sortOrder === 'asc' ? '↑' : '↓')}
                    {sortBy !== 'classes' && '↕'}
                  </span>
                </button>
              </th>
              <th className="px-4 py-3 text-center">
                <button
                  onClick={() => onSort('instructors')}
                  className="flex items-center gap-2 font-semibold text-sm text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mx-auto"
                >
                  👨‍🏫 Eğitmen
                  <span className="text-xs">
                    {sortBy === 'instructors' && (sortOrder === 'asc' ? '↑' : '↓')}
                    {sortBy !== 'instructors' && '↕'}
                  </span>
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <span className="font-semibold text-sm text-gray-700 dark:text-gray-200">İşlemler</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {terms.map((term) => {
              const statusConfig = getStatusConfig(term.status)

              return (
                <tr key={term.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`${statusConfig.color} text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 w-fit`}>
                      <span>{statusConfig.icon}</span>
                      <span>{statusConfig.label}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/terms/${term.id}`} className="block hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <div className="font-semibold">{term.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{term.termCode}</div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {term.termType === 'POLICE' ? '🚔 Polis' : '🚒 İtfaiye'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {term.duration === 'FOUR_MONTHS' ? '4 Ay' : '6 Ay'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {new Date(term.endDate).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-medium">
                    {term._count.students}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-medium">
                    {term._count.classes}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-medium">
                    {term._count.instructorTerms}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit(term)}
                        className="px-3 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                        title="Düzenle"
                      >
                        <Icon icon="ph:pencil-bold" width="20" />
                      </button>

                      {term.status === 'ACTIVE' && (
                        <button
                          onClick={() => onStatusChange(term.id, term.name, 'PAUSED')}
                          className="px-3 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded transition-colors"
                          title="Duraklat"
                        >
                          <Icon icon="ph:pause-bold" width="20" />
                        </button>
                      )}

                      {term.status === 'PAUSED' && (
                        <button
                          onClick={() => onStatusChange(term.id, term.name, 'ACTIVE')}
                          className="px-3 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                          title="Aktifleştir"
                        >
                          <Icon icon="ph:play-bold" width="20" />
                        </button>
                      )}

                      {term.status === 'ARCHIVED' && (
                        <button
                          onClick={() => onStatusChange(term.id, term.name, 'ACTIVE')}
                          className="px-3 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                          title="Geri Al"
                        >
                          <Icon icon="ph:arrow-counter-clockwise-bold" width="20" />
                        </button>
                      )}

                      {term.status !== 'ARCHIVED' && (
                        <button
                          onClick={() => onStatusChange(term.id, term.name, 'ARCHIVED')}
                          className="px-3 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
                          title="Arşivle"
                        >
                          <Icon icon="ph:archive-bold" width="20" />
                        </button>
                      )}

                      <button
                        onClick={() => onDelete(term)}
                        className="px-3 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                        title="Sil"
                      >
                        <Icon icon="ph:trash-bold" width="20" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
