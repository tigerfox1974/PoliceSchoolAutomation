import Link from 'next/link'
import { Icon } from '@iconify/react'

interface Course {
  id: string
  name: string
  code: string
  fourMonthHours: number | null
  sixMonthHours: number | null
  requiresLab: boolean
  programScope: 'COMMON' | 'POLIS_ONLY' | 'ITFAIYE_ONLY'
  _count: {
    subCourses: number
    courseInstructors: number
    dailyLessons: number
  }
}

interface Props {
  courses: Course[]
  sortBy: string
  sortOrder: 'asc' | 'desc'
  onSort: (field: string) => void
  onDelete: (course: Course) => void
}

export function CourseTableView({ courses, sortBy, sortOrder, onSort, onDelete }: Props) {
  const scopeLabels = {
    COMMON: '🔵 Ortak',
    POLIS_ONLY: '🟢 Polis',
    ITFAIYE_ONLY: '🔴 İtfaiye',
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
                onClick={() => onSort('code')}
              >
                <div className="flex items-center gap-1">
                  Kod
                  <SortIcon field="code" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => onSort('name')}
              >
                <div className="flex items-center gap-1">
                  Ders Adı
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => onSort('fourMonthHours')}
              >
                <div className="flex items-center justify-center gap-1">
                  4 Aylık
                  <SortIcon field="fourMonthHours" />
                </div>
              </th>
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => onSort('sixMonthHours')}
              >
                <div className="flex items-center justify-center gap-1">
                  6 Aylık
                  <SortIcon field="sixMonthHours" />
                </div>
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kapsam
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lab
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
              <th
                className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => onSort('subCourses')}
              >
                <div className="flex items-center justify-center gap-1">
                  Alt Ders
                  <SortIcon field="subCourses" />
                </div>
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="font-mono text-sm font-medium">{course.code}</span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/courses/${course.id}`} className="font-medium hover:text-blue-600">
                    {course.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-semibold">{course.fourMonthHours || '-'}</span>
                  {course.fourMonthHours && <span className="text-sm text-gray-500 ml-1">s</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="font-semibold">{course.sixMonthHours || '-'}</span>
                  {course.sixMonthHours && <span className="text-sm text-gray-500 ml-1">s</span>}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-sm">{scopeLabels[course.programScope]}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  {course.requiresLab ? (
                    <Icon icon="ph:desktop-tower-bold" width="20" className="mx-auto text-blue-600" />
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium">
                    {course._count.courseInstructors}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm font-medium">
                    {course._count.subCourses}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      href={`/courses/${course.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:hover:text-blue-400"
                    >
                      <Icon icon="ph:eye-bold" width="18" />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(course)
                      }}
                      className="text-red-600 hover:text-red-900 dark:hover:text-red-400"
                    >
                      <Icon icon="ph:trash-bold" width="18" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

