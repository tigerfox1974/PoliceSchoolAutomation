'use client'

import { FormEvent } from 'react'
import { Modal } from '@/shared/components'
import { useCreateTerm } from '../hooks/useCreateTerm'

interface CreateTermModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function CreateTermModal({ isOpen, onClose, onSuccess, onError }: CreateTermModalProps) {
  const {
    selectedType,
    suggestedNumber,
    currentTermNumber,
    selectedDuration,
    startDate,
    endDate,
    isSubmitting,
    setSelectedType,
    setCurrentTermNumber,
    setSelectedDuration,
    setStartDate,
    setEndDate,
    handleSubmit,
    resetForm,
  } = useCreateTerm({ isOpen, onSuccess, onError })

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await handleSubmit()
    onClose()
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="🎓 Yeni Dönem Oluştur"
      size="lg"
    >
      <form onSubmit={onSubmit} className="space-y-4">
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
          disabled={isSubmitting}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Oluşturuluyor...' : 'Dönem Oluştur'}
        </button>
      </form>
    </Modal>
  )
}
