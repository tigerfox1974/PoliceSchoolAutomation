'use client'

import { FormEvent } from 'react'
import { Modal } from '@/shared/components'
import { useCreateExternalSpeaker } from '../hooks/useCreateExternalSpeaker'
import { Icon } from '@iconify/react'

interface CreateExternalSpeakerModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export default function CreateExternalSpeakerModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: CreateExternalSpeakerModalProps) {
  const {
    firstName,
    lastName,
    title,
    organization,
    department,
    email,
    phone,
    address,
    expertise,
    expertiseInput,
    bio,
    isActive,
    notes,
    isSubmitting,
    setFirstName,
    setLastName,
    setTitle,
    setOrganization,
    setDepartment,
    setEmail,
    setPhone,
    setAddress,
    setExpertiseInput,
    setBio,
    setIsActive,
    setNotes,
    addExpertise,
    removeExpertise,
    handleSubmit,
    resetForm,
  } = useCreateExternalSpeaker({ isOpen, onSuccess, onError })

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await handleSubmit()
    if (!isSubmitting) {
      onClose()
    }
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="👤 Yeni Dış Konuşmacı Ekle" size="lg">
      <form onSubmit={onSubmit} className="space-y-4">
        {/* Ad Soyad */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">
              Ad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">
              Soyad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Unvan ve Kurum */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">Unvan</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Prof. Dr., Doç. Dr."
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Kurum</label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              placeholder="Örn: İstanbul Üniversitesi"
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Bölüm */}
        <div>
          <label className="block mb-2 font-medium">Bölüm</label>
          <input
            type="text"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Örn: Yangın Mühendisliği"
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* İletişim */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-2 font-medium">E-posta</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Telefon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
        </div>

        {/* Adres */}
        <div>
          <label className="block mb-2 font-medium">Adres</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={2}
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Uzmanlık Alanları */}
        <div>
          <label className="block mb-2 font-medium">Uzmanlık Alanları</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={expertiseInput}
              onChange={(e) => setExpertiseInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addExpertise()
                }
              }}
              placeholder="Uzmanlık alanı ekle..."
              className="flex-1 px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
            />
            <button
              type="button"
              onClick={addExpertise}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              <Icon icon="ph:plus-bold" width="20" />
            </button>
          </div>
          {expertise.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {expertise.map((exp, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-sm flex items-center gap-2"
                >
                  {exp}
                  <button
                    type="button"
                    onClick={() => removeExpertise(index)}
                    className="hover:text-blue-900 dark:hover:text-blue-100"
                  >
                    <Icon icon="ph:x-bold" width="16" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Biyografi */}
        <div>
          <label className="block mb-2 font-medium">Biyografi</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Kısa biyografi..."
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Durum */}
        <div>
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-5 h-5 rounded text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <span className="font-medium">Aktif</span>
          </label>
        </div>

        {/* Notlar */}
        <div>
          <label className="block mb-2 font-medium">Notlar</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Ek notlar..."
            className="w-full px-4 py-2 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Oluşturuluyor...' : 'Konuşmacı Ekle'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
