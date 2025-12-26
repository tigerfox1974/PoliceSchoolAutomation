import { useState, useEffect } from 'react'
import { SpecialEvent } from '../types'

export function useSpecialEvents() {
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSpecialEvents = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/special-events')
      const data = await res.json()
      if (res.ok) {
        setSpecialEvents(data.specialEvents || [])
      } else {
        setError(data.error || 'Özel etkinlikler yüklenemedi')
      }
    } catch (err) {
      setError('Sunucu hatası')
      console.error('Special events fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpecialEvents()
  }, [])

  return {
    specialEvents,
    loading,
    error,
    refetch: fetchSpecialEvents,
  }
}
