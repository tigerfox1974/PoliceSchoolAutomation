'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Term {
  id: string
  termCode: string
  name: string
  type: string
  startDate: string
  endDate: string
  isActive: boolean
  classes: Class[]
  _count: {
    students: number
    classes: number
    courses: number
  }
}

interface Class {
  id: string
  name: string
  capacity: number
  _count: {
    students: number
  }
}

export default function TermDetailPage() {
  const params = useParams()
  const [term, setTerm] = useState<Term | null>(null)
  const [loading, setLoading] = useState(true)
  const [showClassForm, setShowClassForm] = useState(false)

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

  const handleCreateClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      name: formData.get('name'),
      capacity: formData.get('capacity'),
    }

    try {
      const res = await fetch(`/api/terms/${params.id}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setShowClassForm(false)
        fetchTerm()
        ;(e.target as HTMLFormElement).reset()
      } else {
        const error = await res.json()
        alert(error.error || 'Sınıf oluşturulamadı')
      }
    } catch (error) {
      console.error('Sınıf oluşturma hatası:', error)
      alert('Sunucu hatası')
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
        <div className="bg-blue-100 dark:bg-blue-900 p-6 rounded-lg">
          <div className="text-3xl font-bold">{term._count.students}</div>
          <div className="text-sm">Toplam Öğrenci</div>
        </div>
        <div className="bg-green-100 dark:bg-green-900 p-6 rounded-lg">
          <div className="text-3xl font-bold">{term._count.classes}</div>
          <div className="text-sm">Sınıf Sayısı</div>
        </div>
        <div className="bg-purple-100 dark:bg-purple-900 p-6 rounded-lg">
          <div className="text-3xl font-bold">{term._count.courses}</div>
          <div className="text-sm">Ders Sayısı</div>
        </div>
      </div>

      {/* Hızlı Erişim Butonları */}
      <div className="mb-8 flex gap-4">
        <Link
          href={`/terms/${params.id}/settings`}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 flex items-center gap-2 font-medium"
        >
          ⚙️ Dönem Ayarları
        </Link>
        <Link
          href={`/terms/${params.id}/classes`}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-medium"
        >
          🏫 Sınıf Yönetimi
        </Link>
      </div>

      {/* Sınıf Yönetimi (DÖNEM ODAKLI) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">🏫 Sınıflar (Dönem İçi Yapı)</h2>
          <button
            onClick={() => setShowClassForm(!showClassForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showClassForm ? 'İptal' : '+ Döneme Sınıf Ekle'}
          </button>
        </div>

        {/* Sınıf Ekleme Formu */}
        {showClassForm && (
          <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg mb-6">
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium">Sınıf Adı</label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Örn: A Şubesi"
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-600"
                  />
                </div>
                <div>
                  <label className="block mb-2 font-medium">Kapasite</label>
                  <input
                    type="number"
                    name="capacity"
                    required
                    min="1"
                    placeholder="Örn: 30"
                    className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-600"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
              >
                Sınıf Oluştur
              </button>
            </form>
          </div>
        )}

        {/* Sınıf Listesi */}
        {term.classes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Bu döneme henüz sınıf eklenmemiş
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {term.classes.map((cls) => (
              <div
                key={cls.id}
                className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <h3 className="text-lg font-bold mb-2">{cls.name}</h3>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Kapasite: {cls.capacity}</p>
                  <p>Mevcut: {cls._count.students} öğrenci</p>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (cls._count.students / cls.capacity) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diğer Modüller (Placeholder) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">👨‍🏫 Eğitmen Atamaları</h3>
          <p className="text-gray-500">Yakında...</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">🏠 Koğuş Yönetimi</h3>
          <p className="text-gray-500">Yakında...</p>
        </div>
      </div>
    </div>
  )
}
