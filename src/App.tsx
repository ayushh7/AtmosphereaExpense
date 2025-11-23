import { useEffect, useState } from 'react'
import { db} from './db'
import type{ Transaction } from './db'
import { Layout } from './components/Layout'
import { SummaryBar } from './components/Summarybar'
import { TransactionForm } from './components/Transactionform'
import { TransactionList } from './components/Transactionlist'

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const loadTransactions = async () => {
    const all = await db.transactions
      .orderBy('createdAt')
      .reverse()
      .toArray()
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
    a.download = 'finance-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Layout>
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
            Finance Tracker
          </h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
            Offline · Private · On your device
          </p>
        </div>
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
      </header>

      <SummaryBar items={transactions} />
      <TransactionForm onTransactionAdded={loadTransactions} />

      {loading ? (
        <div style={{ fontSize: '13px', color: '#9ca3af' }}>Loading…</div>
      ) : (
        <TransactionList items={transactions} onDelete={handleDelete} />
      )}
    </Layout>
  )
}

export default App
