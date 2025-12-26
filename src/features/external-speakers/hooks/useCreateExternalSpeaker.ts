import { useState, useEffect } from 'react'
import { CreateExternalSpeakerData } from '../types'

interface UseCreateExternalSpeakerProps {
  isOpen: boolean
  onSuccess: (message: string) => void
  onError: (message: string) => void
}

export function useCreateExternalSpeaker({ isOpen, onSuccess, onError }: UseCreateExternalSpeakerProps) {
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

  const resetForm = () => {
    setFirstName('')
    setLastName('')
    setTitle('')
    setOrganization('')
    setDepartment('')
    setEmail('')
    setPhone('')
    setAddress('')
    setExpertise([])
    setExpertiseInput('')
    setBio('')
    setIsActive(true)
    setNotes('')
  }

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
    if (!firstName.trim() || !lastName.trim()) {
      onError('Ad ve soyad zorunludur')
      return
    }

    setIsSubmitting(true)
    try {
      const data: CreateExternalSpeakerData = {
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

      const res = await fetch('/api/external-speakers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (res.ok) {
        onSuccess('Dış konuşmacı başarıyla oluşturuldu')
        resetForm()
      } else {
        onError(result.error || 'Dış konuşmacı oluşturulamadı')
      }
    } catch (error) {
      console.error('Create external speaker error:', error)
      onError('Sunucu hatası')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Modal açıldığında formu sıfırla
  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen])

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
    resetForm,
  }
}
