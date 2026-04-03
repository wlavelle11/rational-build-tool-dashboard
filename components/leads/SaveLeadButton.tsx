'use client'

import { useState, useTransition } from 'react'
import { Bookmark } from 'lucide-react'

export function SaveLeadButton({ id, initialSaved }: { id: string; initialSaved: boolean }) {
  const [saved, setSaved] = useState(initialSaved)
  const [pending, startTransition] = useTransition()

  const toggle = () => {
    startTransition(async () => {
      const res = await fetch(`/api/leads/${id}`, { method: 'PATCH' })
      if (res.ok) {
        const data = await res.json()
        setSaved(data.saved)
      }
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className={saved ? 'btn btn-primary' : 'btn btn-outline'}
      style={{ opacity: pending ? 0.6 : 1 }}
    >
      <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
      {saved ? 'Saved' : 'Save Lead'}
    </button>
  )
}
