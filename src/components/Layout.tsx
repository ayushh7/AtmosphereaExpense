import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: '#020617',
        display: 'flex',
        justifyContent: 'center'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 520,          
          minHeight: '100vh',
          margin: '0 auto',
          padding: '12px 12px 24px',
          display: 'flex',
          flexDirection: 'column',
          background: '#020617'
        }}
      >
        {children}
      </div>
    </div>
  )
}
