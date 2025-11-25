// src/App.tsx
import { useEffect, useMemo, useState } from 'react'
import { Layout } from './components/Layout'
import { SummaryBar } from './components/Summarybar'
import { TransactionForm } from './components/Transactionform'
import { TransactionList } from './components/Transactionlist'
import { HistoryView } from './components/HistoryView'
import { InsightsView } from './components/InsightsView'
import { CashCounterView } from './components/CashCounterView'
import { NotesView } from './components/NotesView'

import {
  getAllTransactions,
  deleteTransaction,
  createTransaction,
  supabase,
  getAllNotes,
  createNote,
  deleteNote,
  type Note
} from './db'

import type { Transaction, NewTransactionInput } from './db'

type Tab = 'home' | 'history' | 'insights' | 'cash' | 'notes'
type Role = 'admin' | 'moderator' | 'user'

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('home')
  const [dailyTarget, setDailyTarget] = useState<number>(() => {
    const saved = localStorage.getItem('dailyTarget')
    return saved ? Number(saved) || 0 : 0
  })

  const [notes, setNotes] = useState<Note[]>([])
  const [notesLoading, setNotesLoading] = useState(true)

  const [role, setRole] = useState<Role | null>(null)
  const [authChecked, setAuthChecked] = useState(false)

  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  const loadTransactions = async () => {
    const all = await getAllTransactions()
    setTransactions(all)
  }

  const loadNotes = async () => {
    const all = await getAllNotes()
    setNotes(all)
  }

  // load stored role from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('role') as Role | null
    if (stored === 'admin' || stored === 'moderator' || stored === 'user') {
      setRole(stored)
    }
    setAuthChecked(true)
  }, [])

  // load data once role is known (only when logged in)
  useEffect(() => {
    if (!role) {
      setLoading(false)
      setNotesLoading(false)
      return
    }
    ; (async () => {
      try {
        await loadTransactions()
        await loadNotes()
      } finally {
        setLoading(false)
        setNotesLoading(false)
      }
    })()
  }, [role])
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      // when session changes, fetch profile and set role
      if (session?.access_token) {
        // fetch profile role as we do in login
      } else {
        setRole(null)
        localStorage.removeItem('role')
      }
    })
    return () => data.subscription.unsubscribe()
  }, [])


  // replace your existing handleLogin with this
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError(null)
    setLoginLoading(true)

    // local username -> email mapping (used for Supabase Auth)
    const emailMap: Record<string, string> = {
      admin: 'admin@atmospherea.local',
      moderator: 'moderator@atmospherea.local',
      user: 'user@atmospherea.local'
    }

    // validate local creds first (keeps the same UX you had)
    let expectedRole: Role | null = null
    if (loginUsername === 'admin' && loginPassword === 'rishuanshu') {
      expectedRole = 'admin'
    } else if (
      loginUsername === 'moderator' &&
      loginPassword === 'atmospherea25042025'
    ) {
      expectedRole = 'moderator'
    } else if (loginUsername === 'user' && loginPassword === 'useratmospherea') {
      expectedRole = 'user'
    }

    if (!expectedRole) {
      setLoginError('Invalid username or password')
      setLoginLoading(false)
      return
    }

    const email = emailMap[loginUsername]
    const password = loginPassword

    try {
      // sign in to supabase (this creates a session so RLS sees auth.uid())
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        // show helpful message (maybe user not created on Supabase)
        setLoginError('Auth failed: ' + error.message)
        setLoginLoading(false)
        return
      }

      // If signIn succeeded, fetch the role from profiles table (if present)
      const user = data?.user
      let serverRole: Role | null = expectedRole

      if (user?.id) {
        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle()

        if (pErr) {
          console.warn('Could not load profile role:', pErr)
        } else if (profile?.role) {
          serverRole = profile.role as Role
        }
      }

      // set role in UI (serverRole wins if present)
      setRole(serverRole)
      if (serverRole) localStorage.setItem('role', serverRole)

      // load data now that session exists
      await loadTransactions()
      await loadNotes()
    } catch (err: any) {
      console.error('Login error', err)
      setLoginError('Login error: ' + (err?.message || String(err)))
    } finally {
      setLoginLoading(false)
    }
  }


  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.warn('supabase signOut error', err)
    }
    setRole(null)
    localStorage.removeItem('role')
    setTransactions([])
    setNotes([])
  }


  const handleAddNote = async (text: string) => {
    if (!role || role === 'user') {
      alert('Only admin or moderator can add notes.')
      return
    }
    await createNote({ text })
    await loadNotes()
  }

  const handleDeleteNote = async (id: string) => {
    if (role !== 'admin') {
      alert('Only admin can delete notes.')
      return
    }
    await deleteNote(id)
    await loadNotes()
  }

  const handleDelete = async (id: string) => {
    if (role !== 'admin') {
      alert('Only admin can delete transactions.')
      return
    }
    await deleteTransaction(id)
    await loadTransactions()
  }

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(transactions, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cafe-atmospherea.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportCSV = () => {
    const header = ['date', 'type', 'category', 'amount', 'paymentMethod', 'note']
    const rows = transactions.map(t => [
      new Date(t.date).toISOString(),
      t.type,
      t.category,
      t.amount.toString(),
      t.paymentMethod ?? '',
      t.note ?? ''
    ])

    const csv =
      [header, ...rows]
        .map(r =>
          r.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
        )
        .join('\n') + '\n'

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cafe-atmospherea.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDailyCloseReport = () => {
    const today = new Date()
    const todayTx = transactions.filter(tx => isSameDay(new Date(tx.date), today))

    const totalIncome = todayTx
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0)
    const totalExpense = todayTx
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0)
    const profit = totalIncome - totalExpense

    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html>
      <head>
        <title>Daily Close Report</title>
        <style>
          body { font-family: system-ui, sans-serif; padding: 16px; }
          h1 { font-size: 20px; }
          table { border-collapse: collapse; width: 100%; margin-top: 12px; }
          th, td { border: 1px solid #ccc; padding: 6px 8px; font-size: 12px; text-align: left; }
        </style>
      </head>
      <body>
        <h1>Daily Close – ${today.toLocaleDateString()}</h1>
        <p><strong>Total revenue:</strong> ₹${totalIncome.toFixed(2)}</p>
        <p><strong>Total expenses:</strong> ₹${totalExpense.toFixed(2)}</p>
        <p><strong>Profit:</strong> ₹${profit.toFixed(2)}</p>
        <h2>Transactions</h2>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Category</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${todayTx
        .map(
          t => `
              <tr>
                <td>${new Date(t.date).toLocaleTimeString()}</td>
                <td>${t.type}</td>
                <td>${t.category}</td>
                <td>₹${t.amount.toFixed(2)}</td>
              </tr>
            `
        )
        .join('')}
          </tbody>
        </table>
        <script>
          window.print();
        </script>
      </body>
      </html>
    `)
    win.document.close()
  }

  const handleClearAll = async () => {
    if (role !== 'admin') {
      alert('Only admin can clear all transactions.')
      return
    }

    if (
      transactions.length === 0 ||
      !window.confirm('Clear all transactions? This cannot be undone.')
    ) {
      return
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .gt('created_at', '1970-01-01')

    if (error) {
      console.error('Failed to clear all transactions:', error)
      alert('Error clearing transactions.')
      return
    }

    await loadTransactions()
  }

  const today = new Date()
  const todayTransactions = useMemo(
    () => transactions.filter(t => isSameDay(new Date(t.date), today)),
    [transactions]
  )

  const recentTransactions = useMemo(
    () => transactions.slice(0, 5),
    [transactions]
  )

  const categorySuggestions = useMemo(
    () => Array.from(new Set(transactions.map(t => t.category))),
    [transactions]
  )

  const recurringReminders = useMemo(() => {
    const templates = transactions.filter(t => t.isRecurring)
    if (!templates.length) return []

    const now = new Date()
    const monthTx = transactions.filter(t => {
      const d = new Date(t.date)
      return (
        d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      )
    })

    return templates.filter(tpl => {
      return !monthTx.some(
        t =>
          t.category === tpl.category &&
          t.type === tpl.type &&
          Math.abs(t.amount - tpl.amount) < 0.01
      )
    })
  }, [transactions])

  const addRecurringNow = async (tpl: Transaction) => {
    if (!role || role === 'user') {
      alert('Only admin or moderator can add recurring transactions.')
      return
    }

    const now = new Date().toISOString()
    const payload: NewTransactionInput = {
      amount: tpl.amount,
      type: tpl.type,
      category: tpl.category,
      date: now,
      note: tpl.note,
      paymentMethod: tpl.paymentMethod,
      isRecurring: tpl.isRecurring,
      receiptDataUrl: tpl.receiptDataUrl
    }
    await createTransaction(payload)
    await loadTransactions()
  }

  const updateDailyTarget = (value: string) => {
    const num = Number(value) || 0
    setDailyTarget(num)
    localStorage.setItem('dailyTarget', String(num))
  }

  // --- auth gating ---

  if (!authChecked) {
    return null
  }

  if (!role) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#020617',
          color: '#e5e7eb'
        }}
      >
        <form
          onSubmit={handleLogin}
          style={{
            background: '#020617',
            borderRadius: '16px',
            padding: '20px',
            width: '100%',
            maxWidth: '360px',
            border: '1px solid #1f2937',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px' }}>Atmospherea Finance</h2>
          <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
            Login
          </p>

          <input
            type="text"
            placeholder="Username"
            value={loginUsername}
            onChange={e => setLoginUsername(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid #1f2937',
              background: '#020617',
              color: '#e5e7eb',
              fontSize: '14px'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={loginPassword}
            onChange={e => setLoginPassword(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            inputMode="text"
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid #1f2937',
              background: '#020617',
              color: '#e5e7eb',
              fontSize: '14px'
            }}
          />


          {loginError && (
            <div style={{ fontSize: '12px', color: '#f97316' }}>{loginError}</div>
          )}

          <button
            type="submit"
            disabled={loginLoading}
            style={{
              marginTop: '4px',
              padding: '10px',
              borderRadius: '999px',
              border: 'none',
              background: loginLoading ? '#4b5563' : '#22c55e',
              color: '#020617',
              fontWeight: 600,
              cursor: loginLoading ? 'default' : 'pointer'
            }}
          >
            {loginLoading ? 'Signing in…' : 'Sign in'}
          </button>


        </form>
      </div>
    )
  }

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
            Atmospherea Finance
          </h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
            Expense tracker · Role: {role}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={handleExportCSV}
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
            Export CSV
          </button>
          <button
            onClick={handleExportJSON}
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
            JSON
          </button>
          <button
            onClick={handleClearAll}
            style={{
              fontSize: '11px',
              padding: '6px 10px',
              borderRadius: '999px',
              border: '1px solid #1f2937',
              background: role === 'admin' ? '#111827' : '#1f2937',
              color: role === 'admin' ? '#f97316' : '#6b7280',
              cursor: role === 'admin' ? 'pointer' : 'not-allowed'
            }}
          >
            Clear
          </button>
          <button
            onClick={handleLogout}
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
            Logout
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
          { id: 'insights', label: 'Insights' },
          { id: 'cash', label: 'Cash' },
          { id: 'notes', label: 'Notes' }
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
              background: activeTab === tab.id ? '#22c55e' : 'transparent',
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

      {/* content */}
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
            <SummaryBar items={todayTransactions} label="Today" />
            <SummaryBar items={transactions} label="All time" />

            {/* daily target input */}
            <div
              style={{
                background: '#0f172a',
                borderRadius: '12px',
                padding: '8px'
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  marginBottom: '4px'
                }}
              >
                Daily sales target
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  inputMode="decimal"
                  value={dailyTarget || ''}
                  onChange={e => updateDailyTarget(e.target.value)}
                  placeholder="e.g. 8000"
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #1f2937',
                    background: '#020617',
                    color: '#e5e7eb'
                  }}
                />
                <button
                  type="button"
                  onClick={handleDailyCloseReport}
                  style={{
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#22c55e',
                    color: '#020617',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Daily close
                </button>
              </div>
            </div>

            {/* recurring reminders */}
            {recurringReminders.length > 0 && (
              <div
                style={{
                  background: '#0f172a',
                  borderRadius: '12px',
                  padding: '8px'
                }}
              >
                <div
                  style={{
                    fontSize: '12px',
                    color: '#fbbf24',
                    marginBottom: '4px'
                  }}
                >
                  Recurring expenses not added this month
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  {recurringReminders.map(tpl => (
                    <div
                      key={tpl.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '12px'
                      }}
                    >
                      <span>
                        {tpl.category} – ₹{tpl.amount.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => addRecurringNow(tpl)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '999px',
                          border: 'none',
                          background:
                            role === 'user' ? '#4b5563' : '#22c55e',
                          color: '#020617',
                          fontSize: '11px',
                          cursor:
                            role === 'user' ? 'not-allowed' : 'pointer'
                        }}
                      >
                        Add for this month
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <TransactionForm
              onTransactionAdded={loadTransactions}
              categorySuggestions={categorySuggestions}
              role={role}
            />

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
              <InsightsView items={transactions} dailyTarget={dailyTarget} />
            )}
          </>
        )}

        {activeTab === 'cash' && (
          <>
            {loading ? (
              <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                Loading…
              </div>
            ) : (
              <CashCounterView items={transactions} />
            )}
          </>
        )}

        {activeTab === 'notes' && (
          <NotesView
            notes={notes}
            loading={notesLoading}
            onAddNote={handleAddNote}
            onDeleteNote={handleDeleteNote}
          />
        )}
      </div>

      {/* floating quick-add button */}
      <button
        type="button"
        onClick={() => setActiveTab('home')}
        style={{
          position: 'fixed',
          right: '18px',
          bottom: '24px',
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          border: 'none',
          background: '#22c55e',
          color: '#020617',
          fontSize: '26px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}
      >
        +
      </button>
    </Layout>
  )
}

export default App
