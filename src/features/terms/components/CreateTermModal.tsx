'use client'

import { useState, useEffect, FormEvent } from 'react'
import { Modal } from '@/shared/components'

interface CreateTermModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateTermModal({ isOpen, onClose, onSuccess }: CreateTermModalProps) {
  const [selectedType, setSelectedType] = useState<'POLICE' | 'FIRE'>('POLICE')
  const [suggestedNumber, setSuggestedNumber] = useState<number>(1)
  const [currentTermNumber, setCurrentTermNumber] = useState<number>(0)
  const [selectedDuration, setSelectedDuration] = useState<'FOUR_MONTHS' | 'SIX_MONTHS'>('FOUR_MONTHS')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchSuggestion(selectedType)
    }
  }, [selectedType, isOpen])

  useEffect(() => {
    if (startDate && selectedDuration) {
      calculateEndDate(startDate, selectedDuration)
    }
  }, [startDate, selectedDuration])

  const fetchSuggestion = async (type: 'POLICE' | 'FIRE') => {
    try {
      const res = await fetch(`/api/terms/suggest?termType=${type}`)
      const data = await res.json()
      const suggested = data.suggestedNumber
      
      if (suggested === null) {
        setSuggestedNumber(0)
        setCurrentTermNumber(0)
      } else {
        setSuggestedNumber(suggested || 1)
        setCurrentTermNumber(suggested || 1)
      }
    } catch (error) {
      console.error('Öneri alınamadı:', error)
      setSuggestedNumber(0)
      setCurrentTermNumber(0)
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

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
        onSuccess()
        onClose()
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose()
        setCurrentTermNumber(0)
        setStartDate('')
        setEndDate('')
      }}
      title="🎓 Yeni Dönem Oluştur"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
          {suggestedNumber > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              💡 Önerilen: {suggestedNumber}. dönem (Son kayıtlara göre)
            </p>
          )}
        </div>

        <div>
          <label className="block mb-2 font-medium">Dönem Kodu (Otomatik)</label>
          <input
            type="text"
            value={currentTermNumber > 0 ? `${selectedType === 'POLICE' ? 'PTE' : 'İTE'}-${String(currentTermNumber).padStart(2, '0')}` : ''}
            disabled
            placeholder={currentTermNumber > 0 ? '' : 'Dönem numarası girilince otomatik üretilecektir'}
            className="w-full px-4 py-2 border rounded bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 cursor-not-allowed"
          />
          <p className="text-sm text-gray-500 mt-1">
            🔒 Otomatik oluşturulur, değiştirilemez
          </p>
        </div>

        {currentTermNumber > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              📝 Dönem Adı: <strong>{currentTermNumber}. {selectedType === 'POLICE' ? 'Polis Temel Eğitimi' : 'İtfaiye Temel Eğitimi'}</strong>
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
          <label htmlFor="isActive">Aktif Dönem Olarak Başlat</label>
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Dönem Oluştur
        </button>
      </form>
    </Modal>
  )
}
