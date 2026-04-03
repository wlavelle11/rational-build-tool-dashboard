'use client'

import { useState, useEffect } from 'react'
import { Zap, Loader2, CheckCircle2 } from 'lucide-react'

type Status = 'idle' | 'running' | 'done' | 'error'

export function GenerateLeadsButton() {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  // On mount, check if pipeline is already running
  useEffect(() => {
    fetch('/api/leads/generate')
      .then(r => r.json())
      .then(d => { if (d.running) setStatus('running') })
      .catch(() => {})
  }, [])

  async function handleGenerate() {
    setStatus('running')
    setMessage('')
    try {
      const res = await fetch('/api/leads/generate', { method: 'POST' })
      const data = await res.json()
      if (data.error) {
        setStatus('error')
        setMessage(data.error)
      } else if (data.running && !data.started) {
        setStatus('running')
        setMessage('Pipeline already running — check back in a few minutes.')
      } else {
        setStatus('running')
        setMessage('Pipeline started — leads will sync in ~10 minutes. Refresh the page when done.')
      }
    } catch (err) {
      setStatus('error')
      setMessage(String(err))
    }
  }

  const isRunning = status === 'running'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
      <button
        onClick={handleGenerate}
        disabled={isRunning}
        className="btn btn-brand"
        style={{ height: 36, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, opacity: isRunning ? 0.7 : 1 }}
      >
        {isRunning
          ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Running Pipeline...</>
          : status === 'done'
            ? <><CheckCircle2 size={14} />Done</>
            : <><Zap size={14} />Generate Leads</>
        }
      </button>
      {message && (
        <p style={{ fontSize: 12, color: status === 'error' ? 'var(--color-danger)' : 'var(--color-text-secondary)', maxWidth: 320, textAlign: 'right' }}>
          {message}
        </p>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
