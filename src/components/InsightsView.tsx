// src/components/InsightsView.tsx
import { useMemo } from 'react'
import type { Transaction } from '../db'

interface Props {
  items: Transaction[]
  dailyTarget: number
}

export function InsightsView({ items, dailyTarget }: Props) {
  const {
    income,
    expense,
    profit,
    categoryStats,
    weekly,
    bestDay,
    worstDay
  } = useMemo(() => {
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
      .sort((a, b) => b.expense - a.expense)

    // last 7 days
    const today = new Date()
    const days: { label: string; profit: number; dateKey: string }[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - i
      )
      const key = d.toISOString().slice(0, 10)
      days.push({
        label: d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' }),
        profit: 0,
        dateKey: key
      })
    }

    const byDate = new Map<string, { income: number; expense: number }>()
    for (const tx of items) {
      const key = tx.date.slice(0, 10)
      const cur = byDate.get(key) || { income: 0, expense: 0 }
      if (tx.type === 'income') cur.income += tx.amount
      else cur.expense += tx.amount
      byDate.set(key, cur)
    }

    for (const d of days) {
      const res = byDate.get(d.dateKey)
      if (res) d.profit = res.income - res.expense
    }

    let bestDay = null as null | string
    let worstDay = null as null | string
    if (days.length) {
      let max = -Infinity
      let min = Infinity
      for (const d of days) {
        if (d.profit > max) {
          max = d.profit
          bestDay = d.label
        }
        if (d.profit < min) {
          min = d.profit
          worstDay = d.label
        }
      }
    }

    return { income, expense, profit, categoryStats, weekly: days, bestDay, worstDay }
  }, [items])

  const formatMoney = (value: number) =>
    `₹${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`

  const maxAbsProfit =
    weekly.reduce((m, d) => Math.max(m, Math.abs(d.profit)), 0) || 1

  // today's profit for daily target
  const todayKey = new Date().toISOString().slice(0, 10)
  const todayProfit =
    weekly.find(d => d.dateKey === todayKey)?.profit ?? 0
  const progress =
    dailyTarget > 0 ? Math.min(100, (todayProfit / dailyTarget) * 100) : 0

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        flex: 1
      }}
    >
      {/* high-level cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0,1fr))',
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
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#22c55e' }}>
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
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#ef4444' }}>
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

      {/* daily target card */}
      <div
        style={{
          background: '#0f172a',
          borderRadius: '16px',
          padding: '10px'
        }}
      >
        <div
          style={{
            fontSize: '12px',
            color: '#9ca3af',
            marginBottom: '4px'
          }}
        >
          Daily sales target vs today&apos;s profit
        </div>
        <div style={{ fontSize: '13px', marginBottom: '4px' }}>
          Target: {dailyTarget > 0 ? formatMoney(dailyTarget) : 'Not set'}
        </div>
        <div
          style={{
            width: '100%',
            height: '8px',
            borderRadius: '999px',
            background: '#020617',
            overflow: 'hidden',
            marginBottom: '4px'
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: progress >= 100 ? '#22c55e' : '#fbbf24',
              transition: 'width 0.2s ease-out'
            }}
          />
        </div>
        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
          Today: {formatMoney(todayProfit)} –{' '}
          {dailyTarget <= 0
            ? 'set a target in Home tab'
            : progress >= 100
            ? 'Ahead of target 🎉'
            : progress >= 60
            ? 'On track ✅'
            : 'Behind target ⚠️'}
        </div>
      </div>

      {/* weekly bar chart */}
      <div
        style={{
          background: '#0f172a',
          borderRadius: '16px',
          padding: '10px'
        }}
      >
        <div
          style={{
            fontSize: '12px',
            color: '#9ca3af',
            marginBottom: '6px'
          }}
        >
          Last 7 days profit
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '6px',
            height: '120px',
            marginBottom: '6px'
          }}
        >
          {weekly.map(d => {
            const ratio = Math.abs(d.profit) / maxAbsProfit
            const height = 20 + ratio * 80
            const positive = d.profit >= 0
            const isBest = bestDay === d.label
            const isWorst = worstDay === d.label

            return (
              <div
                key={d.label}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                  fontSize: '10px'
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: `${height}px`,
                    borderRadius: '6px 6px 0 0',
                    background: positive ? '#22c55e' : '#ef4444',
                    opacity: isBest || isWorst ? 1 : 0.8,
                    boxShadow:
                      isBest || isWorst
                        ? '0 0 0 1px rgba(250,250,250,0.3)'
                        : undefined
                  }}
                />
                <div style={{ marginTop: '2px' }}>{d.label}</div>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
          Best day: {bestDay || '–'} · Worst day: {worstDay || '–'}
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
          <div style={{ fontSize: '13px', color: '#9ca3af' }}>
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
                    <div style={{ fontSize: '13px', fontWeight: 500 }}>
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
