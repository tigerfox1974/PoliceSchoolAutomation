'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { ToastContainer } from '@/shared/components'

interface Instructor {
  id: string
  firstName: string
  lastName: string
  fullName: string
  rank: string | null
  branch: string | null
  instructorType: string
  assignedAt: string
  hoursAssigned: number | null
}

interface Assignment {
  courseId: string
  courseName: string
  courseCode: string
  instructors: Instructor[]
}

export default function InstructorAssignmentsPage() {
  const params = useParams()
  const router = useRouter()
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [instructors, setInstructors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInstructors, setSelectedInstructors] = useState<Record<string, string>>({})
  const [toasts, setToasts] = useState<Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  }>>([])

  const termId = Array.isArray(params.id) ? params.id[0] : (params.id as string)

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  useEffect(() => {
    if (termId) {
      fetchData()
    }
  }, [termId])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Dönem atamalarını getir
      const assignmentsRes = await fetch(`/api/terms/${termId}/instructor-assignments`)
      if (!assignmentsRes.ok) {
        const errorData = await assignmentsRes.json().catch(() => ({}))
        console.error('Assignments API error:', errorData)
        throw new Error(errorData.error || 'Atamalar yüklenemedi')
      }
      const assignmentsData = await assignmentsRes.json()
      setAssignments(assignmentsData.assignments || [])

      // Tüm eğitmenleri getir
      const instructorsRes = await fetch('/api/instructors')
      if (!instructorsRes.ok) {
        const errorData = await instructorsRes.json().catch(() => ({}))
        console.error('Instructors API error:', {
          status: instructorsRes.status,
          statusText: instructorsRes.statusText,
          error: errorData,
        })
        showToast(`Eğitmenler yüklenemedi: ${errorData.error || instructorsRes.statusText}`, 'error')
        setInstructors([])
        return
      }
      const instructorsData = await instructorsRes.json()
      console.log('Instructors loaded:', instructorsData.instructors?.length || 0, 'instructors')
      console.log('Instructors data:', instructorsData)
      
      if (!instructorsData.instructors || instructorsData.instructors.length === 0) {
        console.warn('No instructors found in database')
        showToast('Veritabanında eğitmen bulunamadı', 'warning')
      }
      
      setInstructors(instructorsData.instructors || [])
    } catch (error) {
      console.error('Fetch error:', error)
      showToast(error instanceof Error ? error.message : 'Veriler yüklenemedi', 'error')
      setInstructors([])
    } finally {
      setLoading(false)
    }
  }

  // Eğitmenleri alfabetik sırala (Türkçe karakter desteği ile)
  const sortedInstructors = useMemo(() => {
    return [...instructors].sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLocaleLowerCase('tr')
      const nameB = `${b.firstName} ${b.lastName}`.toLocaleLowerCase('tr')
      return nameA.localeCompare(nameB, 'tr', { sensitivity: 'base', numeric: true })
    })
  }, [instructors])

  const handleAssign = async (courseId: string) => {
    const instructorId = selectedInstructors[courseId]
    if (!instructorId) {
      showToast('Lütfen bir eğitmen seçin', 'warning')
      return
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/instructors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instructorId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Atama yapılamadı')
      }

      const data = await response.json()
      showToast(data.message || 'Eğitmen başarıyla atandı', 'success')
      
      // Seçimi temizle
      setSelectedInstructors(prev => {
        const next = { ...prev }
        delete next[courseId]
        return next
      })

      // Sadece ilgili assignment'ı güncelle (tüm listeyi yeniden yükleme)
      const selectedInstructor = sortedInstructors.find(inst => inst.id === instructorId)
      if (selectedInstructor) {
        setAssignments(prev => prev.map(assignment => {
          if (assignment.courseId === courseId) {
            // Eğitmen zaten atanmış mı kontrol et
            const alreadyAssigned = assignment.instructors.some(inst => inst.id === instructorId)
            if (!alreadyAssigned) {
              return {
                ...assignment,
                instructors: [
                  ...assignment.instructors,
                  {
                    id: selectedInstructor.id,
                    firstName: selectedInstructor.firstName,
                    lastName: selectedInstructor.lastName,
                    fullName: `${selectedInstructor.firstName} ${selectedInstructor.lastName}`,
                    rank: selectedInstructor.rank,
                    branch: selectedInstructor.branch,
                    instructorType: selectedInstructor.instructorType,
                    assignedAt: new Date().toISOString(),
                    hoursAssigned: null,
                  }
                ]
              }
            }
          }
          return assignment
        }))
      } else {
        // Eğer instructor bulunamazsa, tüm listeyi yeniden yükle
        await fetchData()
      }
    } catch (error) {
      console.error('Assign error:', error)
      showToast(error instanceof Error ? error.message : 'Atama yapılamadı', 'error')
    }
  }

  const handleRemove = async (courseId: string, instructorId: string) => {
    if (!confirm('Bu eğitmeni kaldırmak istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/courses/${courseId}/instructors/${instructorId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Atama kaldırılamadı')
      }

      const data = await response.json()
      showToast(data.message || 'Eğitmen başarıyla kaldırıldı', 'success')

      // Sadece ilgili assignment'ı güncelle (tüm listeyi yeniden yükleme)
      setAssignments(prev => prev.map(assignment => {
        if (assignment.courseId === courseId) {
          return {
            ...assignment,
            instructors: assignment.instructors.filter(inst => inst.id !== instructorId)
          }
        }
        return assignment
      }))
    } catch (error) {
      console.error('Remove error:', error)
      showToast(error instanceof Error ? error.message : 'Atama kaldırılamadı', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    )
  }

  if (!termId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Dönem ID bulunamadı</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Başlık */}
      <div className="mb-8">
        <Link
          href={`/terms/${termId}`}
          className="text-blue-600 hover:underline mb-4 inline-block flex items-center gap-2"
        >
          <Icon icon="ph:arrow-left-bold" width="20" />
          Dönem Detayına Dön
        </Link>
        <h1 className="text-3xl font-bold mb-2">👨‍🏫 Eğitmen Atamaları</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Dönem planındaki derslere eğitmen atayın
        </p>
      </div>

      {/* Bilgi Kutusu */}
      {assignments.length === 0 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 dark:text-yellow-200">
            ⚠️ Henüz dönem planına ders eklenmemiş. Önce{' '}
            <Link href={`/terms/${termId}/plan`} className="underline font-semibold">
              Dönem Planı
            </Link>{' '}
            sayfasından ders ekleyin.
          </p>
        </div>
      )}

      {/* İstatistikler */}
      {assignments.length > 0 && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Toplam Ders</p>
            <p className="text-2xl font-bold text-purple-600">{assignments.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Eğitmen Atanmış Ders</p>
            <p className="text-2xl font-bold text-green-600">
              {assignments.filter(a => a.instructors.length > 0).length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Eğitmen Atanmamış Ders</p>
            <p className="text-2xl font-bold text-red-600">
              {assignments.filter(a => a.instructors.length === 0).length}
            </p>
          </div>
        </div>
      )}

      {/* Ders Listesi */}
      {assignments.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Ders Adı</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Kod</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Atanmış Eğitmen(ler)</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">Eğitmen Seç</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {assignments.map((assignment) => (
                  <tr key={assignment.courseId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 font-medium">{assignment.courseName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {assignment.courseCode}
                    </td>
                    <td className="px-6 py-4">
                      {assignment.instructors.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {assignment.instructors.map((instructor) => (
                            <span
                              key={instructor.id}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
                            >
                              {instructor.fullName}
                              {instructor.rank && (
                                <span className="text-xs text-gray-500">({instructor.rank})</span>
                              )}
                              <button
                                onClick={() => handleRemove(assignment.courseId, instructor.id)}
                                className="ml-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                title="Kaldır"
                              >
                                <Icon icon="ph:x-bold" width="14" />
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Atanmamış</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={selectedInstructors[assignment.courseId] || ''}
                        onChange={(e) => {
                          setSelectedInstructors(prev => ({
                            ...prev,
                            [assignment.courseId]: e.target.value,
                          }))
                        }}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Eğitmen seçin...</option>
                        {sortedInstructors.length > 0 ? (
                          sortedInstructors.map((instructor) => (
                            <option key={instructor.id} value={instructor.id}>
                              {instructor.firstName} {instructor.lastName}
                              {instructor.rank && ` (${instructor.rank})`}
                              {instructor.branch && ` - ${instructor.branch}`}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>Eğitmen bulunamadı</option>
                        )}
                      </select>
                      {sortedInstructors.length === 0 && (
                        <p className="text-xs text-red-500 mt-1">⚠️ Eğitmenler yüklenemedi. Konsolu kontrol edin.</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleAssign(assignment.courseId)}
                        disabled={!selectedInstructors[assignment.courseId]}
                        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                      >
                        <Icon icon="ph:user-plus-bold" width="16" />
                        Ata
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

