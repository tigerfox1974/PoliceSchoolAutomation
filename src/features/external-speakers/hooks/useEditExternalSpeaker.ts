import { useState, useEffect } from 'react'
import { ExternalSpeaker, EditExternalSpeakerData } from '../types'

interface UseEditExternalSpeakerProps {
  isOpen: boolean
  externalSpeaker: ExternalSpeaker | null
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function useEditExternalSpeaker({ isOpen, externalSpeaker, onSuccess, onError }: UseEditExternalSpeakerProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [title, setTitle] = useState('')
  const [organization, setOrganization] = useState('')
  const [department, setDepartment] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [expertise, setExpertise] = useState<string[]>([])
  const [expertiseInput, setExpertiseInput] = useState('')
  const [bio, setBio] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // ExternalSpeaker değiştiğinde formu doldur
  useEffect(() => {
    if (externalSpeaker && isOpen) {
      setFirstName(externalSpeaker.firstName)
      setLastName(externalSpeaker.lastName)
      setTitle(externalSpeaker.title || '')
      setOrganization(externalSpeaker.organization || '')
      setDepartment(externalSpeaker.department || '')
      setEmail(externalSpeaker.email || '')
      setPhone(externalSpeaker.phone || '')
      setAddress(externalSpeaker.address || '')
      setExpertise(Array.isArray(externalSpeaker.expertise) ? externalSpeaker.expertise : [])
      setExpertiseInput('')
      setBio(externalSpeaker.bio || '')
      setIsActive(externalSpeaker.isActive)
      setNotes(externalSpeaker.notes || '')
    }
  }, [externalSpeaker, isOpen])

  const addExpertise = () => {
    if (expertiseInput.trim() && !expertise.includes(expertiseInput.trim())) {
      setExpertise([...expertise, expertiseInput.trim()])
      setExpertiseInput('')
    }
  }

  const removeExpertise = (index: number) => {
    setExpertise(expertise.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!externalSpeaker) return

    if (!firstName.trim() || !lastName.trim()) {
      onError('Ad ve soyad zorunludur')
      return
    }

    setIsSubmitting(true)
    try {
      const data: EditExternalSpeakerData = {
        id: externalSpeaker.id,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        title: title.trim() || undefined,
        organization: organization.trim() || undefined,
        department: department.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        expertise: expertise.length > 0 ? expertise : undefined,
        bio: bio.trim() || undefined,
        isActive,
        notes: notes.trim() || undefined,
      }

      const res = await fetch(`/api/external-speakers/${externalSpeaker.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (res.ok) {
        onSuccess('Dış konuşmacı başarıyla güncellendi')
      } else {
        onError(result.error || 'Dış konuşmacı güncellenemedi')
      }
    } catch (error) {
      console.error('Edit external speaker error:', error)
      onError('Sunucu hatası')
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
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
  }
}
