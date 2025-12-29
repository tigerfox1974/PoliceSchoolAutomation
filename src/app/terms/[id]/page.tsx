'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ToastContainer } from '@/shared/components'

interface Term {
  id: string
  termCode: string
  name: string
  type: string
  startDate: string
  endDate: string
  isActive: boolean
  _count: {
    students: number
    classes: number
    courses: number
  }
}

export default function TermDetailPage() {
  const params = useParams()
  const [term, setTerm] = useState<Term | null>(null)
  const [loading, setLoading] = useState(true)
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

  useEffect(() => {
    if (params.id) {
      fetchTerm()
    }
  }, [params.id])

  const fetchTerm = async () => {
    try {
      const res = await fetch(`/api/terms/${params.id}`)
      const data = await res.json()
      setTerm(data.term)
    } catch (error) {
      console.error('Dönem yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Yükleniyor...</div>
      </div>
    )
  }

  if (!term) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Dönem bulunamadı</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {/* Başlık */}
      <div className="mb-8">
        <Link href="/terms" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Dönemler
        </Link>
        <h1 className="text-3xl font-bold">{term.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">{term.termCode}</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">👥 Toplam Öğrenci</h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{term._count.students}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">🏫 Sınıf Sayısı</h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">{term._count.classes}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">📚 Ders Sayısı</h3>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{term._count.courses}</p>
        </div>
      </div>

      {/* Hızlı Erişim Butonları */}
      <div className="mb-8 flex flex-wrap gap-4">
        <Link
          href={`/terms/${params.id}/settings`}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 flex items-center gap-2 font-medium"
        >
          ⚙️ Dönem Ayarları
        </Link>
        <Link
          href={`/terms/${params.id}/plan`}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 flex items-center gap-2 font-medium"
        >
          📋 Dönem Planı
        </Link>
        <Link
          href={`/terms/${params.id}/classes`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
        >
          🏫 Sınıf Yönetimi
        </Link>
        <Link
          href={`/terms/${params.id}/instructor-assignments`}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 flex items-center gap-2 font-medium"
        >
          👨‍🏫 Eğitmen Atamaları
        </Link>
        <Link
          href={`/terms/${params.id}/dormitories`}
          className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 flex items-center gap-2 font-medium"
        >
          🏠 Koğuş Yönetimi
        </Link>
      </div>

    </div>
  )
}
