import { useMemo, useState } from 'react'
import type { Transaction } from '../db'
import { TransactionList } from './Transactionlist'

type TypeFilter = 'all' | 'income' | 'expense'

interface Props {
  items: Transaction[]
  onDelete: (id: string) => void
}

export function HistoryView({ items, onDelete }: Props) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return items.filter(tx => {
      const d = new Date(tx.date)

      if (typeFilter !== 'all' && tx.type !== typeFilter) return false

      if (fromDate) {
        const from = new Date(fromDate)
        if (d < from) return false
      }

      if (toDate) {
        const to = new Date(toDate)
        // include transactions up to end-of-day
        to.setHours(23, 59, 59, 999)
        if (d > to) return false
      }

      if (search) {
        const q = search.toLowerCase()
        if (
          !tx.category.toLowerCase().includes(q) &&
          !(tx.note || '').toLowerCase().includes(q)
        ) {
          return false
        }
      }

      return true
    })
  }, [items, typeFilter, fromDate, toDate, search])

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        flex: 1,
        minHeight: 0
      }}
    >
      {/* filters */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '8px',
          marginBottom: '4px'
        }}
      >
        <div>
          <label style={{ fontSize: '11px', color: '#9ca3af' }}>From</label>
          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              borderRadius: '8px',
              border: '1px solid #1f2937',
              background: '#020617',
              color: '#e5e7eb'
            }}
          />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: '#9ca3af' }}>To</label>
          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            style={{
              width: '100%',
              padding: '6px',
              borderRadius: '8px',
              border: '1px solid #1f2937',
              background: '#020617',
              color: '#e5e7eb'
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '4px'
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: '6px',
            flex: 1
          }}
        >
          {(['all', 'income', 'expense'] as TypeFilter[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              style={{
                flex: 1,
                padding: '6px 0',
                fontSize: '11px',
                borderRadius: '999px',
                border: '1px solid #1f2937',
                background:
                  typeFilter === t ? '#22c55e' : 'rgba(15, 23, 42, 0.9)',
                color: typeFilter === t ? '#020617' : '#e5e7eb',
                cursor: 'pointer'
              }}
            >
              {t === 'all' ? 'All' : t === 'income' ? 'Income' : 'Expense'}
            </button>
          ))}
        </div>
      </div>

      <input
        type="text"
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search by category or note"
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid #1f2937',
          background: '#020617',
          color: '#e5e7eb',
          marginBottom: '4px'
        }}
      />

      <div style={{ flex: 1, minHeight: 0 }}>
        <TransactionList items={filtered} onDelete={onDelete} />
      </div>
    </div>
  )
}
