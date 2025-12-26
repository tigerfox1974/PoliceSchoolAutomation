import { useState, useEffect } from 'react'
import { ExternalSpeaker } from '../types'

export function useExternalSpeakers() {
  const [externalSpeakers, setExternalSpeakers] = useState<ExternalSpeaker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExternalSpeakers = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/external-speakers')
      const data = await res.json()
      if (res.ok) {
        setExternalSpeakers(data.externalSpeakers || [])
      } else {
        setError(data.error || 'Dış konuşmacılar yüklenemedi')
      }
    } catch (err) {
      setError('Sunucu hatası')
      console.error('External speakers fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExternalSpeakers()
  }, [])

  return {
    externalSpeakers,
    loading,
    error,
    refetch: fetchExternalSpeakers,
  }
}
