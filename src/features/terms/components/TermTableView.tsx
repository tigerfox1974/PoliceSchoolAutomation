'use client'

import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Term, SortOption, SortOrder } from '../types'
import { getStatusConfig } from '../utils'

interface TermTableViewProps {
  terms: Term[]
  sortBy: SortOption
  sortOrder: SortOrder
  onSort: (field: SortOption) => void
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
  // Modern SortIcon komponenti (CourseTableView ile aynı)
  const SortIcon = ({ field }: { field: SortOption }) => {
    if (sortBy !== field) {
      return <Icon icon="ph:arrows-down-up-bold" width="14" className="text-gray-400" />
    }
    return sortOrder === 'asc' ? (
      <Icon icon="ph:arrow-up-bold" width="14" className="text-blue-600" />
    ) : (
      <Icon icon="ph:arrow-down-bold" width="14" className="text-blue-600" />
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => onSort('status')}
              >
                <div className="flex items-center gap-1">
                  Durum
                  <SortIcon field="status" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => onSort('name')}
              >
                <div className="flex items-center gap-1">
                  Dönem Adı
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => onSort('termType')}
              >
                <div className="flex items-center justify-center gap-1">
                  Tip
                  <SortIcon field="termType" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => onSort('duration')}
              >
                <div className="flex items-center justify-center gap-1">
                  Süre
                  <SortIcon field="duration" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => onSort('endDate')}
              >
                <div className="flex items-center justify-center gap-1">
                  Bitiş Tarihi
                  <SortIcon field="endDate" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => onSort('students')}
              >
                <div className="flex items-center justify-center gap-1">
                  Öğrenci
                  <SortIcon field="students" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => onSort('classes')}
              >
                <div className="flex items-center justify-center gap-1">
                  Sınıf
                  <SortIcon field="classes" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => onSort('instructors')}
              >
                <div className="flex items-center justify-center gap-1">
                  Eğitmen
                  <SortIcon field="instructors" />
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {terms.map((term) => {
              const statusConfig = getStatusConfig(term.status)

              return (
                <tr key={term.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
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
                  <td className="px-4 py-3 text-center text-sm">
                    {term.termType === 'POLICE' ? '🚔 Polis' : '🚒 İtfaiye'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {term.duration === 'FOUR_MONTHS' ? '4 Ay' : '6 Ay'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm">
                    {new Date(term.endDate).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium">
                      {term._count.students}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium">
                      {term._count.classes}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm font-medium">
                      {term._count.instructorTerms}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      {/* Düzenle */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEdit(term)
                        }}
                        className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400 transition-colors"
                        title="Düzenle"
                      >
                        <Icon icon="ph:pencil-bold" width="18" />
                      </button>

                      {/* Durum Değiştirme */}
                      {term.status === 'ACTIVE' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onStatusChange(term.id, term.name, 'PAUSED')
                          }}
                          className="text-orange-600 hover:text-orange-900 dark:hover:text-orange-400 transition-colors"
                          title="Duraklat"
                        >
                          <Icon icon="ph:pause-bold" width="18" />
                        </button>
                      )}

                      {term.status === 'PAUSED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onStatusChange(term.id, term.name, 'ACTIVE')
                          }}
                          className="text-green-600 hover:text-green-900 dark:hover:text-green-400 transition-colors"
                          title="Aktifleştir"
                        >
                          <Icon icon="ph:play-bold" width="18" />
                        </button>
                      )}

                      {term.status === 'ARCHIVED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onStatusChange(term.id, term.name, 'ACTIVE')
                          }}
                          className="text-green-600 hover:text-green-900 dark:hover:text-green-400 transition-colors"
                          title="Geri Al"
                        >
                          <Icon icon="ph:arrow-counter-clockwise-bold" width="18" />
                        </button>
                      )}

                      {/* Arşivle */}
                      {term.status !== 'ARCHIVED' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onStatusChange(term.id, term.name, 'ARCHIVED')
                          }}
                          className="text-gray-600 hover:text-gray-900 dark:hover:text-gray-400 transition-colors"
                          title="Arşivle"
                        >
                          <Icon icon="ph:archive-bold" width="18" />
                        </button>
                      )}

                      {/* Sil */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onDelete(term)
                        }}
                        className="text-red-600 hover:text-red-900 dark:hover:text-red-400 transition-colors"
                        title="Sil"
                      >
                        <Icon icon="ph:trash-bold" width="18" />
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
