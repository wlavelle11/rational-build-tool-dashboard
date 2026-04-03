'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

export function DeleteLeadButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = () => {
    startTransition(async () => {
      const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' })
      if (res.ok) router.push('/leads')
    })
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>Delete this lead?</span>
        <button
          onClick={handleDelete}
          disabled={pending}
          className="btn btn-danger"
          style={{ height: 32, fontSize: 12 }}
        >
          {pending ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="btn btn-outline"
          style={{ height: 32, fontSize: 12 }}
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="btn btn-outline"
      style={{ height: 32, fontSize: 12, color: 'var(--color-danger, #e53e3e)' }}
    >
      <Trash2 size={13} />
      Delete
    </button>
  )
}
