import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        background: '#020617',
        color: '#e5e7eb',
        padding: '24px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: '#0f172a',
          borderRadius: '16px',
          padding: '16px 16px 24px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
        }}
      >
        {children}
      </div>
    </div>
  )
}
