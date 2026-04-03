'use client'

import { useState, useEffect, useRef } from 'react'
import { Zap, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react'

type Status = 'idle' | 'running' | 'done' | 'error'

export function GenerateLeadsButton() {
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [lastRunAt, setLastRunAt] = useState<string | null>(null)
  const [lastRunResult, setLastRunResult] = useState<'success' | 'error' | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
  }

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/leads/generate')
      const d = await res.json()
      if (d.lastRunAt) setLastRunAt(d.lastRunAt)
      if (d.lastRunResult) setLastRunResult(d.lastRunResult)
      if (!d.running && status === 'running') {
        stopPolling()
        if (d.lastRunResult === 'error') {
          setStatus('error')
          setMessage('Pipeline finished with errors — check pipeline.log for details.')
        } else {
          setStatus('done')
          setMessage('Pipeline complete — refresh to see updated leads.')
        }
      }
    } catch { /* non-fatal */ }
  }

  // On mount, check if pipeline is already running and load last run info
  useEffect(() => {
    fetch('/api/leads/generate')
      .then(r => r.json())
      .then(d => {
        if (d.lastRunAt) setLastRunAt(d.lastRunAt)
        if (d.lastRunResult) setLastRunResult(d.lastRunResult)
        if (d.running) {
          setStatus('running')
          setMessage('Pipeline already running — will complete in a few minutes.')
        }
      })
      .catch(() => {})
  }, [])

  // Poll every 10s while running
  useEffect(() => {
    if (status === 'running') {
      pollRef.current = setInterval(checkStatus, 10_000)
    } else {
      stopPolling()
    }
    return stopPolling
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

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
        setMessage('Pipeline already running — will complete in a few minutes.')
      } else {
        setMessage('Pipeline started — leads will sync in ~10 minutes.')
      }
    } catch (err) {
      setStatus('error')
      setMessage(String(err))
    }
  }

  const isRunning = status === 'running'

  const lastRunLabel = lastRunAt
    ? new Date(lastRunAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
      <button
        onClick={handleGenerate}
        disabled={isRunning}
        className="btn btn-brand"
        style={{ height: 36, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, opacity: isRunning ? 0.7 : 1 }}
      >
        {isRunning
          ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />Running Pipeline…</>
          : status === 'done'
            ? <><CheckCircle2 size={14} />Done — Refresh</>
            : status === 'error'
              ? <><XCircle size={14} />Retry Pipeline</>
              : <><Zap size={14} />Generate Leads</>
        }
      </button>

      {message && (
        <p style={{ fontSize: 12, color: status === 'error' ? 'var(--color-danger, #e53e3e)' : status === 'done' ? 'var(--color-success, #38a169)' : 'var(--color-text-secondary)', maxWidth: 300, textAlign: 'right' }}>
          {message}
        </p>
      )}

      {lastRunLabel && !message && (
        <p style={{ fontSize: 11, color: 'var(--color-text-tertiary)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Clock size={11} />
          Last run: {lastRunLabel}
          {lastRunResult === 'error' && <span style={{ color: 'var(--color-danger, #e53e3e)' }}> · had errors</span>}
        </p>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
