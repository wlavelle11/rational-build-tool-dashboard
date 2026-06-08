'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (res?.error) {
      setError('Invalid email or password')
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-bg)',
      padding: 'var(--space-6)',
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48,
            height: 48,
            background: '#18181b',
            borderRadius: 'var(--radius-lg)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 900,
            color: 'white',
            letterSpacing: '0.04em',
            marginBottom: 16,
          }}>
            RBD
          </div>
          <h1 style={{
            fontSize: 'var(--font-size-xl)',
            fontWeight: 700,
            color: 'var(--color-text)',
            letterSpacing: '-0.025em',
            marginBottom: 4,
          }}>
            Rational Build
          </h1>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-3)',
          }}>
            Sign in to the Investment Dashboard
          </p>
        </div>

        {/* Login card */}
        <div className="card" style={{ padding: 0 }}>
          <form onSubmit={handleSubmit} style={{ padding: 'var(--space-6)' }}>
            <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
              />
            </div>

            <div className="form-field" style={{ marginBottom: 'var(--space-6)' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--color-danger-bg)',
                border: '1px solid var(--color-danger-border)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-danger-text)',
                marginBottom: 'var(--space-4)',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', height: 42 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{
          textAlign: 'center',
          fontSize: 'var(--font-size-xs)',
          color: 'var(--color-text-muted)',
          marginTop: 24,
        }}>
          Rational Build Design — Confidential
        </p>
      </div>
    </div>
  )
}
