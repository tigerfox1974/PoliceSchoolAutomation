import Link from 'next/link'
import { Icon } from '@iconify/react'
import { Instructor } from '../types'

interface Props {
  instructors: Instructor[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort: (field: string) => void
  onEdit: (instructor: Instructor) => void
  onDelete: (instructor: Instructor) => void
}

export function InstructorTableView({
  instructors,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
}: Props) {
  const typeLabels = {
    CADRE: '👮 Kadrolu',
    EXTERNAL: '🎓 Dış',
  }

  const SortIcon = ({ field }: { field: string }) => {
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
                onClick={() => onSort('name')}
              >
                <div className="flex items-center gap-1">
                  Ad Soyad
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => onSort('rank')}
              >
                <div className="flex items-center gap-1">
                  Rütbe/Ünvan
                  <SortIcon field="rank" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => onSort('branch')}
              >
                <div className="flex items-center gap-1">
                  Branş
                  <SortIcon field="branch" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tip
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => onSort('courses')}
              >
                <div className="flex items-center gap-1">
                  Dersler
                  <SortIcon field="courses" />
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {instructors.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  Eğitmen bulunamadı
                </td>
              </tr>
            ) : (
              instructors.map((instructor) => (
                <tr
                  key={instructor.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-300">
                        {instructor.firstName.charAt(0)}
                        {instructor.lastName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {instructor.firstName} {instructor.lastName}
                        </div>
                        {instructor.email && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                            {instructor.email}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {instructor.rank || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-gray-100">
                      {instructor.branch || '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        instructor.instructorType === 'CADRE'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}
                    >
                      {typeLabels[instructor.instructorType]}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1 max-w-[400px]">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {instructor._count.courseInstructors} ders
                      </span>
                      {instructor.courseInstructors.length > 0 && (
                        <div className="text-xs text-gray-700 dark:text-gray-300 space-y-0.5">
                          {instructor.courseInstructors.map((ci) => (
                            <div key={ci.id} className="font-medium">
                              • {ci.course.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        instructor.isActive
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {instructor.isActive ? '✓ Aktif' : '⏸ Pasif'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/instructors/${instructor.id}`}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Detay"
                      >
                        <Icon icon="ph:eye-bold" width="18" />
                      </Link>
                      <button
                        onClick={() => onEdit(instructor)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                        title="Düzenle"
                      >
                        <Icon icon="ph:pencil-bold" width="18" />
                      </button>
                      <button
                        onClick={() => onDelete(instructor)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Sil"
                      >
                        <Icon icon="ph:trash-bold" width="18" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

