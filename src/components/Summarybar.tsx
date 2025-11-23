// import { Transaction } from '../db'
import type { Transaction } from '../db'


interface Props {
  items: Transaction[]
}

export function SummaryBar({ items }: Props) {
  const income = items
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const expense = items
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = income - expense

  const formatCurrency = (value: number) =>
    `₹${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px',
        marginBottom: '16px'
      }}
    >
      <div
        style={{
          background: '#020617',
          borderRadius: '12px',
          padding: '8px 10px'
        }}
      >
        <div
          style={{
            fontSize: '12px',
            color: '#9ca3af'
          }}
        >
          Income
        </div>
        <div style={{ fontWeight: 600, fontSize: '14px', color: '#22c55e' }}>
          {formatCurrency(income)}
        </div>
      </div>

      <div
        style={{
          background: '#020617',
          borderRadius: '12px',
          padding: '8px 10px'
        }}
      >
        <div
          style={{
            fontSize: '12px',
            color: '#9ca3af'
          }}
        >
          Expense
        </div>
        <div style={{ fontWeight: 600, fontSize: '14px', color: '#ef4444' }}>
          {formatCurrency(expense)}
        </div>
      </div>

      <div
        style={{
          background: '#020617',
          borderRadius: '12px',
          padding: '8px 10px'
        }}
      >
        <div
          style={{
            fontSize: '12px',
            color: '#9ca3af'
          }}
        >
          Balance
        </div>
        <div style={{ fontWeight: 600, fontSize: '14px', color: '#fbbf24' }}>
          {formatCurrency(balance)}
        </div>
      </div>
    </div>
  )
}
