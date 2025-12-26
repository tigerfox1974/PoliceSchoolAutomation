'use client'

import { ExternalSpeaker } from '../types'
import { Icon } from '@iconify/react'

interface ExternalSpeakerListItemProps {
  externalSpeaker: ExternalSpeaker
  onEdit: (speaker: ExternalSpeaker) => void
  onDelete: (speaker: ExternalSpeaker) => void
}

export default function ExternalSpeakerListItem({
  externalSpeaker,
  onEdit,
  onDelete,
}: ExternalSpeakerListItemProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded ${externalSpeaker.isActive ? 'bg-green-50 dark:bg-green-900/20' : 'bg-gray-50 dark:bg-gray-900/20'}`}>
              <Icon 
                icon="ph:user-bold" 
                width="24" 
                className={externalSpeaker.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400'} 
              />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {externalSpeaker.title ? `${externalSpeaker.title} ` : ''}
                {externalSpeaker.firstName} {externalSpeaker.lastName}
              </h3>
              {externalSpeaker.organization && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{externalSpeaker.organization}</p>
              )}
            </div>
          </div>
          {externalSpeaker.department && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{externalSpeaker.department}</p>
          )}
        </div>
        <span className={`px-2 py-1 rounded text-xs ${externalSpeaker.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
          {externalSpeaker.isActive ? 'Aktif' : 'Pasif'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        {externalSpeaker.email && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">E-posta:</span>
            <p className="font-medium">{externalSpeaker.email}</p>
          </div>
        )}
        {externalSpeaker.phone && (
          <div>
            <span className="text-gray-500 dark:text-gray-400">Telefon:</span>
            <p className="font-medium">{externalSpeaker.phone}</p>
          </div>
        )}
        <div>
          <span className="text-gray-500 dark:text-gray-400">Konferans:</span>
          <p className="font-medium">{externalSpeaker._count?.conferences || 0} konferans</p>
        </div>
      </div>

      {externalSpeaker.expertise && externalSpeaker.expertise.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {externalSpeaker.expertise.map((exp, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs"
            >
              {exp}
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t">
        <button
          onClick={() => onEdit(externalSpeaker)}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
        >
          <Icon icon="ph:pencil-bold" width="16" />
          Düzenle
        </button>
        <button
          onClick={() => onDelete(externalSpeaker)}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm py-2 px-3 rounded transition-colors flex items-center justify-center gap-1"
        >
          <Icon icon="ph:trash-bold" width="16" />
          Sil
        </button>
      </div>
    </div>
  )
}
