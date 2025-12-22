'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Term {
  id: string
  termCode: string
  name: string
  termNumber: number
  termType: 'POLICE' | 'FIRE'
  duration: 'FOUR_MONTHS' | 'SIX_MONTHS'
  startDate: string
  endDate: string
  isActive: boolean
  _count: {
    students: number
    classes: number
    instructorTerms: number
  }
}

export default function TermsPage() {
  const [terms, setTerms] = useState<Term[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedType, setSelectedType] = useState<'POLICE' | 'FIRE'>('POLICE')
  const [suggestedNumber, setSuggestedNumber] = useState<number>(1)
  const [currentTermNumber, setCurrentTermNumber] = useState<number>(0)
  const [selectedDuration, setSelectedDuration] = useState<'FOUR_MONTHS' | 'SIX_MONTHS'>('FOUR_MONTHS')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    fetchTerms()
  }, [])

  useEffect(() => {
    if (showCreateForm) {
      fetchSuggestion(selectedType)
    }
  }, [selectedType, showCreateForm])

  useEffect(() => {
    if (startDate && selectedDuration) {
      calculateEndDate(startDate, selectedDuration)
    }
  }, [startDate, selectedDuration])

  const fetchSuggestion = async (type: 'POLICE' | 'FIRE') => {
    try {
      const res = await fetch(`/api/terms/suggest?termType=${type}`)
      const data = await res.json()
      const suggested = data.suggestedNumber || 1
      setSuggestedNumber(suggested)
      setCurrentTermNumber(suggested)
    } catch (error) {
      console.error('Öneri alınamadı:', error)
      setSuggestedNumber(1)
      setCurrentTermNumber(1)
    }
  }

  const calculateEndDate = (start: string, duration: 'FOUR_MONTHS' | 'SIX_MONTHS') => {
    const startDateObj = new Date(start)
    const endDateObj = new Date(startDateObj)
    
    if (duration === 'FOUR_MONTHS') {
      endDateObj.setMonth(endDateObj.getMonth() + 4)
    } else {
      endDateObj.setMonth(endDateObj.getMonth() + 6)
    }
    
    setEndDate(endDateObj.toISOString().split('T')[0])
  }

  const fetchTerms = async () => {
    try {
      const res = await fetch('/api/terms')
      const data = await res.json()
      setTerms(data.terms || [])
    } catch (error) {
      console.error('Dönemler yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTerm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data = {
      termNumber: formData.get('termNumber'),
      termType: selectedType,
      duration: selectedDuration,
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      isActive: formData.get('isActive') === 'on',
    }

    try {
      const res = await fetch('/api/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setShowCreateForm(false)
        fetchTerms()
        ;(e.target as HTMLFormElement).reset()
        setStartDate('')
        setEndDate('')
        setCurrentTermNumber(0)
      } else {
        const error = await res.json()
        alert(error.error || 'Dönem oluşturulamadı')
      }
    } catch (error) {
      console.error('Dönem oluşturma hatası:', error)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">🎓 Dönem Yönetimi</h1>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {showCreateForm ? 'İptal' : '+ Yeni Dönem Oluştur'}
        </button>
      </div>

      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Yeni Dönem Oluştur</h2>
          <form onSubmit={handleCreateTerm} className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Dönem Tipi</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as 'POLICE' | 'FIRE')}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="POLICE">Polis Temel Eğitimi</option>
                <option value="FIRE">İtfaiye Temel Eğitimi</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium">Dönem Numarası</label>
              <input
                type="number"
                name="termNumber"
                required
                min="1"
                value={currentTermNumber || ''}
                onChange={(e) => setCurrentTermNumber(parseInt(e.target.value) || 0)}
                placeholder="Dönem numarasını girin"
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
              <p className="text-sm text-gray-500 mt-1">
                💡 Önerilen: {suggestedNumber}. dönem (Son kayıtlara göre)
              </p>
            </div>

            {currentTermNumber > 0 && (
              <div>
                <label className="block mb-2 font-medium">Dönem Kodu (Otomatik)</label>
                <input
                  type="text"
                  value={`${selectedType === 'POLICE' ? 'PTE' : 'İTE'}-${String(currentTermNumber).padStart(2, '0')}`}
                  disabled
                  className="w-full px-4 py-2 border rounded bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed"
                />
                <p className="text-sm text-gray-500 mt-1">
                  🔒 Otomatik oluşturulur, değiştirilemez
                </p>
              </div>
            )}

            {currentTermNumber > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  📝 Tam Adı: <strong>{currentTermNumber}. {selectedType === 'POLICE' ? 'Polis Temel Eğitimi' : 'İtfaiye Temel Eğitimi'}</strong>
                </p>
              </div>
            )}

            <div>
              <label className="block mb-2 font-medium">Kurs Süresi</label>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(e.target.value as 'FOUR_MONTHS' | 'SIX_MONTHS')}
                className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              >
                <option value="FOUR_MONTHS">4 Ay</option>
                <option value="SIX_MONTHS">6 Ay</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">Başlangıç Tarihi</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
              
              <div>
                <label className="block mb-2 font-medium">Bitiş Tarihi</label>
                <input
                  type="date"
                  name="endDate"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                />
                {startDate && (
                  <p className="text-sm text-gray-500 mt-1">
                    ⚡ Otomatik hesaplandı (değiştirebilirsiniz)
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                className="mr-2"
              />
              <label htmlFor="isActive">Aktif Dönem</label>
            </div>

            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Dönem Oluştur
            </button>
          </form>
        </div>
      )}

      {terms.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Henüz dönem oluşturulmamış
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            Sistemi kullanmaya başlamak için önce bir dönem oluşturun
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {terms.map((term) => (
            <Link
              key={term.id}
              href={`/terms/${term.id}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{term.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {term.termCode}
                  </p>
                </div>
                {term.isActive && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Aktif
                  </span>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <p>
                  {term.termType === 'POLICE' ? '🚔' : '🚒'} {term.termType === 'POLICE' ? 'Polis Eğitimi' : 'İtfaiye Eğitimi'}
                </p>
                <p>
                  ⏱️ Süre: {term.duration === 'FOUR_MONTHS' ? '4 Ay' : '6 Ay'}
                </p>
                <p>
                  📅 {new Date(term.startDate).toLocaleDateString('tr-TR')} -{' '}
                  {new Date(term.endDate).toLocaleDateString('tr-TR')}
                </p>
                <div className="flex justify-between pt-4 border-t">
                  <span>👨‍🎓 {term._count.students}</span>
                  <span>🏫 {term._count.classes}</span>
                  <span>👨‍🏫 {term._count.instructorTerms}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
