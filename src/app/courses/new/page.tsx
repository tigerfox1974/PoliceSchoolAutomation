'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icon } from '@iconify/react'

export default function NewCoursePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    fourMonthHours: '',
    sixMonthHours: '',
    requiresLab: false,
    programScope: 'COMMON',
    credit: '',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        alert('✅ Ders başarıyla oluşturuldu!')
        router.push('/courses')
      } else {
        alert('❌ Hata: ' + (data.error || 'Ders oluşturulamadı'))
      }
    } catch (error) {
      console.error('Create course error:', error)
      alert('❌ Sunucu hatası')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="mb-8">
        <Link href="/courses" className="text-blue-600 hover:underline mb-2 inline-flex items-center gap-2">
          <Icon icon="ph:arrow-left-bold" width="20" />
          Derslere Dön
        </Link>
        <h1 className="text-3xl font-bold mt-4">📚 Yeni Ders Oluştur</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
        {/* Temel Bilgiler */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Temel Bilgiler</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Ders Adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Örn: Ceza Yasası"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Ders Kodu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Örn: CZH101"
              required
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 uppercase"
            />
            <p className="text-sm text-gray-500 mt-1">Otomatik olarak büyük harfe çevrilecek</p>
          </div>
        </div>

        {/* Saat Hedefleri */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Dönem Hedef Saatleri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                4 Aylık Dönem (Saat)
              </label>
              <input
                type="number"
                name="fourMonthHours"
                value={formData.fourMonthHours}
                onChange={handleChange}
                placeholder="40"
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                6 Aylık Dönem (Saat)
              </label>
              <input
                type="number"
                name="sixMonthHours"
                value={formData.sixMonthHours}
                onChange={handleChange}
                placeholder="60"
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
          <p className="text-sm text-gray-500">En az birini girmeniz gerekiyor</p>
        </div>

        {/* Program Kapsamı */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Program Özellikleri</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Program Kapsamı <span className="text-red-500">*</span>
            </label>
            <select
              name="programScope"
              value={formData.programScope}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="COMMON">🔵 Ortak (Hem Polis hem İtfaiye)</option>
              <option value="POLIS_ONLY">🟢 Sadece Polis</option>
              <option value="ITFAIYE_ONLY">🔴 Sadece İtfaiye</option>
            </select>
          </div>

          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <input
              type="checkbox"
              name="requiresLab"
              checked={formData.requiresLab}
              onChange={handleChange}
              className="w-5 h-5 rounded text-blue-600"
            />
            <div>
              <label className="font-medium cursor-pointer">
                💻 Bilgisayar Laboratuvarı Gerekli
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Bu ders Bilgisayar Lab'da yapılacak
              </p>
            </div>
          </div>
        </div>

        {/* Opsiyonel Bilgiler */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2">Ek Bilgiler (Opsiyonel)</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">Kredi</label>
            <input
              type="number"
              name="credit"
              value={formData.credit}
              onChange={handleChange}
              placeholder="3"
              min="0"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Açıklama</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Dersin içeriği ve detayları..."
              rows={4}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => router.push('/courses')}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Icon icon="ph:circle-notch" width="20" className="animate-spin" />
                Oluşturuluyor...
              </>
            ) : (
              <>
                <Icon icon="ph:check-bold" width="20" />
                Dersi Oluştur
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

