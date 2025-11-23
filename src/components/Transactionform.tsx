import { useState } from 'react'
import { db } from '../db'
import type { TransactionType } from '../db'

import { v4 as uuid } from 'uuid'

interface Props {
  onTransactionAdded: () => void
}

export function TransactionForm({ onTransactionAdded }: Props) {
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

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
        category: category.trim() || 'General',
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
        gap: '8px',
        marginBottom: '16px'
      }}
    >
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
          <option value="income">Income</option>
        </select>
      </div>

      <input
        type="text"
        value={category}
        onChange={e => setCategory(e.target.value)}
        placeholder="Category (e.g. Food, Salary)"
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
        placeholder="Note (optional)"
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
