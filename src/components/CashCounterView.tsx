// src/components/CashCounterView.tsx
import { useEffect, useState } from 'react'
import type { Transaction } from '../db'

interface Props {
  items: Transaction[]
}

function getTodayKey() {
  const d = new Date()
  return d.toISOString().slice(0, 10) // YYYY-MM-DD
}

export function CashCounterView({ items }: Props) {
  const [startingCash, setStartingCash] = useState<string>('0')

  useEffect(() => {
    const key = `startingCash:${getTodayKey()}`
    const saved = localStorage.getItem(key)
    if (saved) setStartingCash(saved)
  }, [])

  const saveStartingCash = (val: string) => {
    setStartingCash(val)
    const key = `startingCash:${getTodayKey()}`
    localStorage.setItem(key, val || '0')
  }

  const today = new Date()
  const isToday = (transaction: Transaction) => {
    const d = new Date(transaction.date) // Assuming `Transaction` has a `date` field
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    )
  }

  const todayTx = items.filter(isToday)

  const cashSales = todayTx
    .filter(t => t.type === 'income' && (t.paymentMethod ?? 'cash') === 'cash')
    .reduce((s, t) => s + t.amount, 0)

  const onlineSales = todayTx
    .filter(
      t => t.type === 'income' && (t.paymentMethod ?? 'cash') === 'online'
    )
    .reduce((s, t) => s + t.amount, 0)

  const cashPaidOut = todayTx
    .filter(t => t.type === 'expense' && (t.paymentMethod ?? 'cash') === 'cash')
    .reduce((s, t) => s + t.amount, 0)

  const expectedCash =
    parseFloat(startingCash || '0') + cashSales - cashPaidOut

  const formatMoney = (value: number) =>
    `₹${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        flex: 1
      }}
    >
      <div
        style={{
          background: '#0f172a',
          borderRadius: '16px',
          padding: '10px'
        }}
      >
        <div
          style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}
        >
          Starting cash in drawer (today)
        </div>
        <input
          type="text"
          inputMode="decimal"
          value={startingCash}
          onChange={e => saveStartingCash(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid #1f2937',
            background: '#020617',
            color: '#e5e7eb',
            fontSize: '16px'
          }}
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0,1fr))',
          gap: '8px'
        }}
      >
        <div
          style={{
            background: '#0f172a',
            borderRadius: '16px',
            padding: '10px'
          }}
        >
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Cash sales</div>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>
            {formatMoney(cashSales)}
          </div>
        </div>

        <div
          style={{
            background: '#0f172a',
            borderRadius: '16px',
            padding: '10px'
          }}
        >
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>Online sales</div>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>
            {formatMoney(onlineSales)}
          </div>
        </div>

        <div
          style={{
            background: '#0f172a',
            borderRadius: '16px',
            padding: '10px'
          }}
        >
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            Cash paid out
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600 }}>
            {formatMoney(cashPaidOut)}
          </div>
        </div>

        <div
          style={{
            background: '#0f172a',
            borderRadius: '16px',
            padding: '10px'
          }}
        >
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            Expected cash in drawer
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 600,
              color: expectedCash >= 0 ? '#22c55e' : '#ef4444'
            }}
          >
            {formatMoney(expectedCash)}
          </div>
        </div>
      </div>
    </div>
  )
}
