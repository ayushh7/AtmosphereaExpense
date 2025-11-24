import { useMemo } from 'react'
import type { Transaction } from '../db'

interface Props {
  items: Transaction[]
}

export function InsightsView({ items }: Props) {
  const { income, expense, profit, categoryStats } = useMemo(() => {
    let income = 0
    let expense = 0
    const catMap = new Map<
      string,
      { income: number; expense: number; count: number }
    >()

    for (const tx of items) {
      if (tx.type === 'income') income += tx.amount
      else expense += tx.amount

      const key = tx.category || 'Other'
      const entry = catMap.get(key) || { income: 0, expense: 0, count: 0 }
      if (tx.type === 'income') entry.income += tx.amount
      else entry.expense += tx.amount
      entry.count += 1
      catMap.set(key, entry)
    }

    const profit = income - expense

    const categoryStats = Array.from(catMap.entries())
      .map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => b.expense - a.expense) // highest expense first

    return { income, expense, profit, categoryStats }
  }, [items])

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
        gap: '12px',
        flex: 1,
        minHeight: 0
      }}
    >
      {/* high-level cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '8px'
        }}
      >
        <div
          style={{
            background: '#0f172a',
            borderRadius: '12px',
            padding: '8px'
          }}
        >
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>Revenue</div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#22c55e'
            }}
          >
            {formatMoney(income)}
          </div>
        </div>

        <div
          style={{
            background: '#0f172a',
            borderRadius: '12px',
            padding: '8px'
          }}
        >
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>Expenses</div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#ef4444'
            }}
          >
            {formatMoney(expense)}
          </div>
        </div>

        <div
          style={{
            background: '#0f172a',
            borderRadius: '12px',
            padding: '8px'
          }}
        >
          <div style={{ fontSize: '11px', color: '#9ca3af' }}>Profit</div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: profit >= 0 ? '#fbbf24' : '#ef4444'
            }}
          >
            {formatMoney(profit)}
          </div>
        </div>
      </div>

      {/* category breakdown */}
      <div
        style={{
          background: '#0f172a',
          borderRadius: '16px',
          padding: '10px',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div
          style={{
            fontSize: '12px',
            color: '#9ca3af',
            marginBottom: '6px'
          }}
        >
          Top expense & revenue categories
        </div>

        {categoryStats.length === 0 ? (
          <div
            style={{
              fontSize: '13px',
              color: '#9ca3af'
            }}
          >
            Add a few transactions to see insights.
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              overflowY: 'auto'
            }}
          >
            {categoryStats.map(cat => {
              const net = cat.income - cat.expense
              return (
                <div
                  key={cat.category}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '6px 8px',
                    borderRadius: '10px',
                    background: '#020617'
                  }}
                >
                  <div>
                    <div
                      style={{ fontSize: '13px', fontWeight: 500 }}
                    >
                      {cat.category}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: '#9ca3af',
                        marginTop: '1px'
                      }}
                    >
                      Entries: {cat.count}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '11px' }}>
                    <div style={{ color: '#22c55e' }}>
                      + {formatMoney(cat.income)}
                    </div>
                    <div style={{ color: '#ef4444' }}>
                      − {formatMoney(cat.expense)}
                    </div>
                    <div
                      style={{
                        marginTop: '2px',
                        color: net >= 0 ? '#fbbf24' : '#ef4444'
                      }}
                    >
                      Net: {formatMoney(net)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
