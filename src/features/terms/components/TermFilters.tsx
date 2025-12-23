'use client'

import { Icon } from '@iconify/react'
import { Modal } from '@/shared/components'
import { TermFilters as TermFiltersType } from '../types'

interface TermFiltersProps {
  isOpen: boolean
  onClose: () => void
  filters: TermFiltersType
  onFiltersChange: (filters: TermFiltersType) => void
  onClearFilters: () => void
}

export default function TermFilters({ isOpen, onClose, filters, onFiltersChange, onClearFilters }: TermFiltersProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="🔍 Gelişmiş Arama ve Filtreler" size="lg">
      <div className="space-y-6">
        {/* Type Filter */}
        <div className="mb-6">
          <label className="block mb-3 font-semibold">📚 Dönem Tipi</label>
          <div className="space-y-2">
            {[
              { value: 'POLICE', label: 'Polis Temel Eğitimi' },
              { value: 'FIRE', label: 'İtfaiye Temel Eğitimi' },
            ].map((type) => (
              <label
                key={type.value}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.termType.includes(type.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onFiltersChange({ ...filters, termType: [...filters.termType, type.value] })
                    } else {
                      onFiltersChange({ ...filters, termType: filters.termType.filter(t => t !== type.value) })
                    }
                  }}
                  className="w-5 h-5 rounded"
                />
                <span className="font-medium">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        <div className="mb-6">
          <label className="block mb-3 font-semibold">🎯 Durum</label>
          <div className="space-y-2">
            {[
              { value: 'ACTIVE', label: 'Aktif' },
              { value: 'PAUSED', label: 'Pasif / Duraklatıldı' },
              { value: 'ARCHIVED', label: 'Arşiv' },
            ].map((s) => (
              <label
                key={s.value}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.status.includes(s.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onFiltersChange({ ...filters, status: [...filters.status, s.value] })
                    } else {
                      onFiltersChange({ ...filters, status: filters.status.filter(st => st !== s.value) })
                    }
                  }}
                  className="w-5 h-5 rounded"
                />
                <span className="font-medium">{s.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Duration Filter */}
        <div className="mb-6">
          <label className="block mb-3 font-semibold">⏱️ Kurs Süresi</label>
          <div className="space-y-2">
            {[
              { value: 'FOUR_MONTHS', label: '4 Ay' },
              { value: 'SIX_MONTHS', label: '6 Ay' },
            ].map((duration) => (
              <label
                key={duration.value}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={filters.duration.includes(duration.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onFiltersChange({ ...filters, duration: [...filters.duration, duration.value] })
                    } else {
                      onFiltersChange({ ...filters, duration: filters.duration.filter(d => d !== duration.value) })
                    }
                  }}
                  className="w-5 h-5 rounded"
                />
                <span className="font-medium">{duration.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6">
          <label className="block mb-3 font-semibold">📅 Tarih Aralığı</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-2 text-sm text-gray-600 dark:text-gray-400">Başlangıç</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm text-gray-600 dark:text-gray-400">Bitiş</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
            Seçilen aralıkla kesişen dönemler listelenir.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={onClearFilters}
            className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white py-2 rounded transition-colors flex items-center justify-center gap-2"
          >
            <Icon icon="ph:x-bold" width="18" />
            Tümünü Temizle
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors"
          >
            Uygula
          </button>
        </div>
      </div>
    </Modal>
  )
}
