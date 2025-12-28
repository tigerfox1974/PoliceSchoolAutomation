'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { ConfirmDialog, ToastContainer } from '@/shared/components'
import EditClassModal from '@/features/classes/components/EditClassModal'

interface Class {
  id: string
  name: string
  code: string
  capacity: number
  _count: {
    students: number
  }
}

interface Term {
  id: string
  name: string
  termCode: string
  termType: 'POLICE' | 'FIRE'
}

export default function ClassesPage() {
  const params = useParams()
  const router = useRouter()
  const termId = params.id as string

  const [term, setTerm] = useState<Term | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState<Array<{
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
  }>>([])
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
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

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning') => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  useEffect(() => {
    fetchTerm()
    fetchClasses()
  }, [termId])

  const fetchTerm = async () => {
    try {
      const res = await fetch(`/api/terms/${termId}`)
      const data = await res.json()
      setTerm(data.term)
    } catch (error) {
      console.error('Term fetch error:', error)
    }
  }

  const fetchClasses = async () => {
    try {
      const res = await fetch(`/api/terms/${termId}/classes`)
      const data = await res.json()
      setClasses(data.classes || [])
    } catch (error) {
      console.error('Classes fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const createDefaultClasses = async () => {
    if (!term) return
    
    const isPolice = term.termType === 'POLICE'
    
    const defaultClasses = [
      { name: 'A Sınıfı', capacity: 30 },
      { name: 'B Sınıfı', capacity: 30 },
      { name: 'C Sınıfı', capacity: 30 },
      { name: 'D Sınıfı', capacity: 30 },
      { name: 'E Sınıfı', capacity: 30 },
      { name: 'F Sınıfı', capacity: 30 },
      { name: 'Bilgisayar Laboratuvarı', capacity: 30 },
    ]

    let success = 0
    let failed = 0

    for (const classData of defaultClasses) {
      try {
        const res = await fetch(`/api/terms/${termId}/classes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(classData),
        })

        if (res.ok) {
          success++
        } else {
          failed++
        }
      } catch (error) {
        failed++
      }
    }

    if (success > 0) {
      showToast(`${success} sınıf başarıyla oluşturuldu!`, 'success')
      fetchClasses()
    }
    if (failed > 0) {
      showToast(`${failed} sınıf oluşturulamadı`, 'warning')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
      />
      <EditClassModal
        isOpen={editingClass !== null || showCreateModal}
        onClose={() => {
          setEditingClass(null)
          setShowCreateModal(false)
        }}
        onSuccess={(msg) => {
          showToast(msg, 'success')
          fetchClasses()
          setEditingClass(null)
          setShowCreateModal(false)
        }}
        onError={(msg) => showToast(msg, 'error')}
        classItem={editingClass}
        termId={termId}
      />

      <div className="mb-8">
        <Link href={`/terms/${termId}`} className="text-blue-600 hover:underline mb-2 inline-flex items-center gap-2">
          <Icon icon="ph:arrow-left-bold" width="20" />
          Döneme Dön
        </Link>
        {term && (
          <div className="mt-4">
            <h1 className="text-3xl font-bold">🏫 Sınıf Yönetimi</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {term.name} - {term.termCode}
            </p>
          </div>
        )}
      </div>

      {/* Quick Action - Sadece sınıf yoksa göster */}
      {classes.length === 0 && (
        <div className="mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Icon icon="ph:info-bold" width="32" className="text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Henüz sınıf oluşturulmamış
                </h3>
                <p className="text-blue-800 dark:text-blue-200 mb-4">
                  Sistemi kullanmaya başlamak için standart sınıfları (A-F + Lab) otomatik oluşturabilirsiniz.
                </p>
                <button
                  onClick={createDefaultClasses}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Icon icon="ph:magic-wand-bold" width="20" />
                  Standart Sınıfları Otomatik Oluştur (7 Sınıf)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sınıf Listesi Başlığı */}
      {classes.length > 0 && (
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Sınıflar ({classes.length})</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <Icon icon="ph:plus-bold" width="16" />
            Yeni Sınıf Ekle
          </button>
        </div>
      )}

      {/* Sınıf Listesi */}
      {classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all p-6 border-l-4 border-blue-500"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl font-bold text-blue-600">
                  {classItem.code}
                </div>
                {classItem.name.includes('Bilgisayar') && (
                  <Icon icon="ph:desktop-tower-bold" width="32" className="text-blue-500" />
                )}
              </div>

              <h3 className="text-xl font-bold mb-4">{classItem.name}</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Kapasite:</span>
                  <span className="font-semibold">{classItem.capacity} kişi</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Öğrenci:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 font-bold">
                    {classItem._count.students}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Doluluk:</span>
                  <span className="font-semibold">
                    {classItem.capacity > 0 
                      ? `%${Math.round((classItem._count.students / classItem.capacity) * 100)}`
                      : '0%'}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${classItem.capacity > 0 
                        ? Math.min((classItem._count.students / classItem.capacity) * 100, 100)
                        : 0}%`
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setEditingClass(classItem)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  title="Sınıfı düzenle"
                >
                  <Icon icon="ph:pencil-bold" width="16" />
                  Düzenle
                </button>
                <button
                  onClick={() => showToast(`Sınıf: ${classItem.name}, Kapasite: ${classItem.capacity}, Öğrenci: ${classItem._count.students}`, 'info')}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  title="Sınıf detayları"
                >
                  <Icon icon="ph:eye-bold" width="16" />
                  Detay
                </button>
                <button
                  onClick={() => {
                    setConfirmDialog({
                      isOpen: true,
                      title: 'Sınıfı Sil',
                      message: `"${classItem.name}" sınıfını silmek istediğinize emin misiniz?${classItem._count.students > 0 ? `\n\n⚠️ Bu sınıfta ${classItem._count.students} öğrenci bulunmaktadır. Veriler korunacaktır.` : ''}`,
                      type: 'danger',
                      onConfirm: async () => {
                        try {
                          const res = await fetch(`/api/terms/${termId}/classes/${classItem.id}`, {
                            method: 'DELETE',
                          })
                          const data = await res.json()

                          if (res.ok) {
                            showToast('✅ Sınıf başarıyla silindi!', 'success')
                            if (data.warning) {
                              showToast(`⚠️ ${data.warning}`, 'warning')
                            }
                            fetchClasses()
                          } else {
                            showToast(`❌ Hata: ${data.error || 'Sınıf silinemedi'}`, 'error')
                          }
                        } catch (error) {
                          console.error('Class delete error:', error)
                          showToast('❌ Sunucu hatası', 'error')
                        } finally {
                          setConfirmDialog({ ...confirmDialog, isOpen: false })
                        }
                      },
                    })
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  title="Sınıfı sil"
                >
                  <Icon icon="ph:trash-bold" width="16" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

