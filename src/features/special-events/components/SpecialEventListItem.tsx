'use client'

import { SpecialEvent, EVENT_TYPE_CONFIG, DAY_OF_WEEK_LABELS } from '../types'
import { Icon } from '@iconify/react'

interface SpecialEventListItemProps {
  specialEvent: SpecialEvent
  onEdit: (event: SpecialEvent) => void
  onDelete: (event: SpecialEvent) => void
}

export default function SpecialEventListItem({
  specialEvent,
  onEdit,
  onDelete,
}: SpecialEventListItemProps) {
  const config = EVENT_TYPE_CONFIG[specialEvent.eventType]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded ${config.bgColor}`}>
              <Icon icon={config.icon} width="24" className={config.color} />
            </div>
            <div>
              <h3 className="text-lg font-bold">{specialEvent.eventTitle}</h3>
              <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
            </div>
          </div>
          {specialEvent.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{specialEvent.description}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Süre:</span>
          <p className="font-medium">{specialEvent.duration} ders saati</p>
        </div>
        {specialEvent.dayOfWeek && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">Gün:</span>
            <p className="font-medium">{DAY_OF_WEEK_LABELS[specialEvent.dayOfWeek]}</p>
          </div>
        )}
        {specialEvent.slotIndex && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">Ders Saati:</span>
            <p className="font-medium">{specialEvent.slotIndex}. ders</p>
          </div>
        )}
        <div>
          <span className="text-gray-500 dark:text-gray-400">Kullanım:</span>
          <p className="font-medium">{specialEvent._count?.dailyLessons || 0} kayıt</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {specialEvent.requiresInstructor && (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
            Eğitmen Gerekli
          </span>
        )}
        {specialEvent.allClassesTogether && (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
            Tüm Sınıflar
          </span>
        )}
        {specialEvent.countsTowardCurriculum && (
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
            Müfredattan Sayılır
          </span>
        )}
        {specialEvent.managedBy && (
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
            {specialEvent.managedBy}
          </span>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={() => onEdit(specialEvent)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
        >
          <Icon icon="ph:pencil-bold" width="16" />
          Düzenle
        </button>
        <button
          onClick={() => onDelete(specialEvent)}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
        >
          <Icon icon="ph:trash-bold" width="16" />
          Sil
        </button>
      </div>
    </div>
  )
}
