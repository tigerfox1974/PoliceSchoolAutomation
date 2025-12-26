'use client'

import { Conference, CONFERENCE_STATUS_CONFIG } from '../types'
import { Icon } from '@iconify/react'

interface ConferenceListItemProps {
  conference: Conference
  onEdit: (conference: Conference) => void
  onDelete: (conference: Conference) => void
}

export default function ConferenceListItem({
  conference,
  onEdit,
  onDelete,
}: ConferenceListItemProps) {
  const statusConfig = CONFERENCE_STATUS_CONFIG[conference.status]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded ${statusConfig.bgColor}`}>
              <Icon icon={statusConfig.icon} width="24" className={statusConfig.color} />
            </div>
            <div>
              <h3 className="text-lg font-bold">{conference.conferenceTitle}</h3>
              <span className={`text-sm font-medium ${statusConfig.color}`}>{statusConfig.label}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{conference.topic}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        {conference.externalSpeaker && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">Konuşmacı:</span>
            <p className="font-medium">
              {conference.externalSpeaker.title ? `${conference.externalSpeaker.title} ` : ''}
              {conference.externalSpeaker.firstName} {conference.externalSpeaker.lastName}
            </p>
            {conference.externalSpeaker.organization && (
              <p className="text-xs text-gray-500">{conference.externalSpeaker.organization}</p>
            )}
          </div>
        )}
        {conference.scheduledDate && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">Tarih:</span>
            <p className="font-medium">{new Date(conference.scheduledDate).toLocaleDateString('tr-TR')}</p>
          </div>
        )}
        <div>
          <span className="text-gray-500 dark:text-gray-400">Süre:</span>
          <p className="font-medium">{conference.duration} ders saati</p>
        </div>
        {conference.startSlot && conference.endSlot && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">Ders Saatleri:</span>
            <p className="font-medium">{conference.startSlot}. - {conference.endSlot}. ders</p>
          </div>
        )}
        <div>
          <span className="text-gray-500 dark:text-gray-400">Kullanım:</span>
          <p className="font-medium">{conference._count?.dailyLessons || 0} kayıt</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {conference.isAllClasses && (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
            Tüm Sınıflar
          </span>
        )}
        {conference.requiresSpecialRoom && (
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
            Özel Salon
          </span>
        )}
        {conference.countsTowardCurriculum && (
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded text-xs">
            Müfredattan Sayılır
          </span>
        )}
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={() => onEdit(conference)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
        >
          <Icon icon="ph:pencil-bold" width="16" />
          Düzenle
        </button>
        <button
          onClick={() => onDelete(conference)}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
        >
          <Icon icon="ph:trash-bold" width="16" />
          Sil
        </button>
      </div>
    </div>
  )
}
