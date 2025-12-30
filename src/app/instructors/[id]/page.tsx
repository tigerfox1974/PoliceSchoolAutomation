'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { ConfirmDialog, ToastContainer } from '@/shared/components'
import { EditInstructorModal } from '@/features/instructors/components'
import { Instructor } from '@/features/instructors/types'

export default function InstructorDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [instructor, setInstructor] = useState<Instructor | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)

  // Toast notifications
  const [toasts, setToasts] = useState<Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  }>>([])

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: 'danger' | 'warning' | 'info'
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {},
  })

  useEffect(() => {
    if (params?.id) {
      fetchInstructor()
    }
  }, [params?.id])

  const fetchInstructor = async () => {
    try {
      const res = await fetch(`/api/instructors/${params?.id}`)
      const data = await res.json()
      
      if (res.ok) {
        setInstructor(data.instructor)
      } else {
        showToast(data.error || 'Eğitmen bulunamadı', 'error')
      }
    } catch (error) {
      console.error('Instructor fetch error:', error)
      showToast('Eğitmen bilgisi yüklenirken bir hata oluştu', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setConfirmDialog({
      isOpen: true,
      title: '🗑️ Eğitmeni Sil',
      message: `"${instructor?.firstName} ${instructor?.lastName}" eğitmenini silmek istediğinizden emin misiniz?\n\nBu işlem geri alınamaz!`,
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/instructors/${params?.id}`, {
            method: 'DELETE',
          })

          if (res.ok) {
            showToast('Eğitmen başarıyla silindi', 'success')
            setTimeout(() => {
              router.push('/instructors')
            }, 1000)
          } else {
            const error = await res.json()
            showToast(error.error || 'Eğitmen silinirken bir hata oluştu', 'error')
          }
        } catch (error: any) {
          showToast('Eğitmen silinirken bir hata oluştu', 'error')
        } finally {
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        }
      },
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    )
  }

  if (!instructor) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <div className="text-center py-12">
          <Icon icon="ph:user-circle-x-bold" width="64" className="mx-auto mb-4 text-gray-400" />
          <p className="text-xl text-gray-600 dark:text-gray-400">Eğitmen bulunamadı</p>
          <Link href="/instructors" className="text-blue-600 hover:underline mt-4 inline-block">
            ← Eğitmenlere Dön
          </Link>
        </div>
      </div>
    )
  }

  const typeLabels = {
    CADRE: '👮 Kadrolu Personel',
    EXTERNAL: '🎓 Dıştan Gelen Eğitmen',
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className="mb-8">
        <Link
          href="/instructors"
          className="text-blue-600 hover:underline mb-2 inline-flex items-center gap-2"
        >
          <Icon icon="ph:arrow-left-bold" width="20" />
          Eğitmenlere Dön
        </Link>
        <div className="flex justify-between items-start mt-4">
          <div>
            <h1 className="text-3xl font-bold">
              {instructor.rank && `${instructor.rank} `}
              {instructor.firstName} {instructor.lastName}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span
                className={`text-sm px-3 py-1 rounded ${
                  instructor.instructorType === 'CADRE'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                }`}
              >
                {typeLabels[instructor.instructorType]}
              </span>
              <span
                className={`text-sm px-3 py-1 rounded ${
                  instructor.isActive
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}
              >
                {instructor.isActive ? '✓ Aktif' : '⏸ Pasif'}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Icon icon="ph:pencil-bold" width="20" />
              Düzenle
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
            >
              <Icon icon="ph:trash-bold" width="20" />
              Sil
            </button>
          </div>
        </div>
      </div>

      {/* Bilgiler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Icon icon="ph:info-bold" width="24" className="text-blue-600" />
          Kişisel Bilgiler
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">KKTC Kimlik No</label>
            <p className="text-lg font-mono">{instructor.tcKimlikNo}</p>
          </div>
          {instructor.badgeNumber && (
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Sicil No</label>
              <p className="text-lg">{instructor.badgeNumber}</p>
            </div>
          )}
          {instructor.branch && (
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Branş</label>
              <p className="text-lg">{instructor.branch}</p>
            </div>
          )}
          {instructor.institution && (
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Kurum</label>
              <p className="text-lg">{instructor.institution}</p>
            </div>
          )}
          {instructor.email && (
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">E-posta</label>
              <p className="text-lg">{instructor.email}</p>
            </div>
          )}
          {instructor.phone && (
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Telefon</label>
              <p className="text-lg">{instructor.phone}</p>
            </div>
          )}
        </div>
      </div>

      {/* Dersler */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Icon icon="ph:book-open-bold" width="24" className="text-blue-600" />
          Verdiği Dersler ({instructor.courseInstructors.length})
        </h2>
        {instructor.courseInstructors.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Henüz ders atanmamış</p>
        ) : (
          <div className="space-y-3">
            {instructor.courseInstructors.map((ci) => (
              <Link
                key={ci.id}
                href={`/courses/${ci.course.id}`}
                className="block p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-gray-100">{ci.course.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ci.course.code}</p>
                  </div>
                  <Icon icon="ph:arrow-right-bold" width="20" className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Icon icon="ph:book-bold" width="24" className="text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Günlük Ders Kayıtları</p>
              <p className="text-2xl font-bold">{instructor._count.dailyLessons}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <Icon icon="ph:calendar-bold" width="24" className="text-green-600 dark:text-green-300" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Atandığı Dönemler</p>
              <p className="text-2xl font-bold">{instructor._count.instructorTerms || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditInstructorModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
        }}
        onSuccess={(message) => {
          showToast(message, 'success')
          fetchInstructor()
          setShowEditModal(false)
        }}
        onError={(message) => {
          showToast(message, 'error')
        }}
        instructor={instructor}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
      />
    </div>
  )
}

