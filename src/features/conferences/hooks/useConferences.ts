import { useState, useEffect } from 'react'
import { Conference } from '../types'

export function useConferences() {
  const [conferences, setConferences] = useState<Conference[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchConferences = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch('/api/conferences')
      const data = await res.json()
      if (res.ok) {
        setConferences(data.conferences || [])
      } else {
        setError(data.error || 'Konferanslar yüklenemedi')
      }
    } catch (err) {
      setError('Sunucu hatası')
      console.error('Conferences fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchConferences()
  }, [])

  return {
    conferences,
    loading,
    error,
    refetch: fetchConferences,
  }
}
