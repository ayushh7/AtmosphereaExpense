import { useState } from 'react'
import { db } from '../db'
import type { TransactionType } from '../db'
import { v4 as uuid } from 'uuid'

interface Props {
  onTransactionAdded: () => void
}

const QUICK_CATEGORIES: {
  label: string
  value: string
  type: TransactionType
}[] = [
  { label: 'Coffee Sales', value: 'Coffee Sales', type: 'income' },
  { label: 'Food Sales', value: 'Food Sales', type: 'income' },
  { label: 'Grocery', value: 'Grocery', type: 'expense' },
  { label: 'Salary', value: 'Salary', type: 'expense' },
  { label: 'Rent', value: 'Rent', type: 'expense' },
  { label: 'Bills', value: 'Bills', type: 'expense' }
]

export function TransactionForm({ onTransactionAdded }: Props) {
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleQuickCategory = (quick: (typeof QUICK_CATEGORIES)[number]) => {
    setType(quick.type)
    setCategory(quick.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('Enter a valid amount')
      return
    }

    setSubmitting(true)
    const now = new Date().toISOString()

    try {
      await db.transactions.add({
        id: uuid(),
        amount: parsedAmount,
        type,
        category: category.trim() || 'Other',
        note: note.trim() || undefined,
        date: now,
        createdAt: now
      })

      setAmount('')
      setCategory('')
      setNote('')
      setType('expense')

      onTransactionAdded()
    } catch (err) {
      console.error(err)
      alert('Failed to save transaction')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      {/* amount + type row */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="Amount"
          required
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid #1f2937',
            background: '#020617',
            color: '#e5e7eb'
          }}
        />
        <select
          value={type}
          onChange={e => setType(e.target.value as TransactionType)}
          style={{
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid #1f2937',
            background: '#020617',
            color: '#e5e7eb'
          }}
        >
          <option value="expense">Expense</option>
          <option value="income">Income (Revenue)</option>
        </select>
      </div>

      {/* quick categories */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginBottom: '4px'
        }}
      >
        {QUICK_CATEGORIES.map(q => (
          <button
            type="button"
            key={q.label}
            onClick={() => handleQuickCategory(q)}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              borderRadius: '999px',
              border: '1px solid #1f2937',
              background:
                category === q.value ? '#22c55e' : 'rgba(15, 23, 42, 0.9)',
              color: category === q.value ? '#020617' : '#e5e7eb',
              cursor: 'pointer'
            }}
          >
            {q.label}
          </button>
        ))}
        <span
          style={{
            fontSize: '11px',
            color: '#9ca3af',
            alignSelf: 'center',
            marginLeft: '4px'
          }}
        >
          or type your own
        </span>
      </div>

      <input
        type="text"
        value={category}
        onChange={e => setCategory(e.target.value)}
        placeholder="Category (e.g. Coffee Sales, Rent)"
        style={{
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid #1f2937',
          background: '#020617',
          color: '#e5e7eb'
        }}
      />

      <input
        type="text"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="Note (e.g. Zomato order, Cash tips)"
        style={{
          padding: '8px',
          borderRadius: '8px',
          border: '1px solid #1f2937',
          background: '#020617',
          color: '#e5e7eb'
        }}
      />

      <button
        type="submit"
        disabled={submitting}
        style={{
          marginTop: '4px',
          padding: '10px',
          borderRadius: '999px',
          border: 'none',
          background: submitting ? '#4b5563' : '#22c55e',
          color: '#020617',
          fontWeight: 600,
          cursor: submitting ? 'default' : 'pointer'
        }}
      >
        {submitting ? 'Saving…' : 'Add Transaction'}
      </button>
    </form>
  )
}
