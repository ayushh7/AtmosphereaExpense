import { useEffect, useMemo, useState } from 'react'
import { Layout } from './components/Layout'
import { SummaryBar } from './components/Summarybar'
import { TransactionForm } from './components/Transactionform'
import { TransactionList } from './components/Transactionlist'
import { HistoryView } from './components/HistoryView'
import { InsightsView } from './components/InsightsView'
import { db } from './db'
import type { Transaction } from './db'

type Tab = 'home' | 'history' | 'insights'

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('home')

  const loadTransactions = async () => {
    const all = await db.transactions.orderBy('createdAt').reverse().toArray()
    setTransactions(all)
  }

  useEffect(() => {
    ;(async () => {
      await loadTransactions()
      setLoading(false)
    })()
  }, [])

  const handleDelete = async (id: string) => {
    await db.transactions.delete(id)
    await loadTransactions()
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(transactions, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cafe-atmospherea.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClearAll = async () => {
    if (
      transactions.length === 0 ||
      !window.confirm('Clear all transactions? This cannot be undone.')
    ) {
      return
    }
    await db.transactions.clear()
    await loadTransactions()
  }

  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions]
  )

  return (
    <Layout>
      {/* header */}
      <header
        style={{
          marginBottom: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '18px',
              margin: 0,
              marginBottom: '2px'
            }}
          >
            Cafe Atmospheréa
          </h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
            Track revenue, expenses & profit – all offline.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={handleExport}
            style={{
              fontSize: '11px',
              padding: '6px 10px',
              borderRadius: '999px',
              border: '1px solid #1f2937',
              background: '#020617',
              color: '#e5e7eb',
              cursor: 'pointer'
            }}
          >
            Export
          </button>
          <button
            onClick={handleClearAll}
            style={{
              fontSize: '11px',
              padding: '6px 10px',
              borderRadius: '999px',
              border: '1px solid #1f2937',
              background: '#111827',
              color: '#f97316',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>
      </header>

      {/* tabs */}
      <div
        style={{
          display: 'flex',
          borderRadius: '999px',
          background: '#020617',
          padding: '3px',
          marginBottom: '12px'
        }}
      >
        {[
          { id: 'home', label: 'Add' },
          { id: 'history', label: 'History' },
          { id: 'insights', label: 'Insights' }
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as Tab)}
            style={{
              flex: 1,
              padding: '6px 0',
              borderRadius: '999px',
              border: 'none',
              background:
                activeTab === tab.id ? '#22c55e' : 'transparent',
              color: activeTab === tab.id ? '#020617' : '#e5e7eb',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* main content area */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        {activeTab === 'home' && (
          <>
            <SummaryBar items={transactions} />
            <TransactionForm onTransactionAdded={loadTransactions} />
            <div style={{ marginTop: '10px' }}>
              <div
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  marginBottom: '4px'
                }}
              >
                Recent transactions
              </div>
              {loading ? (
                <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                  Loading…
                </div>
              ) : (
                <TransactionList
                  items={recentTransactions}
                  onDelete={handleDelete}
                />
              )}
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <>
            {loading ? (
              <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                Loading…
              </div>
            ) : (
              <HistoryView items={transactions} onDelete={handleDelete} />
            )}
          </>
        )}

        {activeTab === 'insights' && (
          <>
            {loading ? (
              <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                Loading…
              </div>
            ) : (
              <InsightsView items={transactions} />
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

export default App
