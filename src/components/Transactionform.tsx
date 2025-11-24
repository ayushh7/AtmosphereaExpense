// src/components/TransactionForm.tsx
import { useMemo, useState } from 'react'
import { createTransaction } from '../db'
import type {
  TransactionType,
  PaymentMethod,
  NewTransactionInput
} from '../db'
// import { v4 as uuid } from 'uuid'

interface Props {
    onTransactionAdded: () => void
    categorySuggestions: string[]
}

const QUICK_INCOME = [
    { label: '🍲 Food Sale', value: 'Food Sale' }
]

const QUICK_EXPENSE = [
    { label: '🛒 Grocery', value: 'Grocery' },
    { label: '🍗 Chicken', value: 'Chicken' },
    { label: '💡 Electricity Bill', value: 'Electricity Bill' },
    { label: '💼 Salary', value: 'Salary' },
    { label: '🏠 Rent', value: 'Rent' },
    { label: '🚚 Vendor Payment', value: 'Vendor Payment' }
]

export function TransactionForm({ onTransactionAdded, categorySuggestions }: Props) {
    const [amount, setAmount] = useState('')
    const [type, setType] = useState<TransactionType>('income')
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online')
    const [category, setCategory] = useState('')
    const [note, setNote] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [isRecurring, setIsRecurring] = useState(false)
    const [receiptFile, setReceiptFile] = useState<File | null>(null)
    const [categoryInputFocused, setCategoryInputFocused] = useState(false)

    const normalizedSuggestions = useMemo(
        () =>
            Array.from(new Set(categorySuggestions))
                .filter(c => c.trim().length > 0)
                .sort(),
        [categorySuggestions]
    )

    const filteredSuggestions = useMemo(() => {
        if (!category) return normalizedSuggestions.slice(0, 6)
        const c = category.toLowerCase()
        return normalizedSuggestions
            .filter(cat => cat.toLowerCase().includes(c))
            .slice(0, 6)
    }, [normalizedSuggestions, category])

    const handleQuickIncome = (value: string) => {
        setType('income')
        setCategory(value)
    }

    const handleQuickExpense = (value: string) => {
        setType('expense')
        setCategory(value)
    }

    const fileToDataUrl = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result))
            reader.onerror = reject
            reader.readAsDataURL(file)
        })

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
            let receiptDataUrl: string | undefined
            if (receiptFile) {
                try {
                    receiptDataUrl = await fileToDataUrl(receiptFile)
                } catch {
                    alert('Could not read receipt image')
                }
            }

            const payload: NewTransactionInput = {
                amount: parsedAmount,
                type,
                paymentMethod,
                category: category.trim() || (type === 'income' ? 'Food Sale' : 'Other'),
                note: note.trim() || undefined,
                date: now,
                isRecurring: isRecurring || undefined,
                receiptDataUrl
              }
              
              await createTransaction(payload)
              

            setAmount('')
            setCategory('')
            setNote('')
            setType('income')
            setPaymentMethod('online')
            setIsRecurring(false)
            setReceiptFile(null)

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
            {/* amount + type + payment */}
            <div style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    inputMode="decimal"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Amount"
                    required
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid #1f2937',
                        background: '#020617',
                        color: '#e5e7eb',
                        fontSize: '16px'
                    }}
                />

                <select
                    value={type}
                    onChange={e => setType(e.target.value as TransactionType)}
                    style={{
                        padding: '10px 6px',
                        borderRadius: '8px',
                        border: '1px solid #1f2937',
                        background: '#020617',
                        color: '#e5e7eb',
                        fontSize: '12px'
                    }}
                >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </select>
                <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                    style={{
                        padding: '10px 6px',
                        borderRadius: '8px',
                        border: '1px solid #1f2937',
                        background: '#020617',
                        color: '#e5e7eb',
                        fontSize: '12px'
                    }}
                >
                    <option value="cash">Cash</option>
                    <option value="online">Online</option>
                </select>
            </div>

            {/* quick buttons */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    marginTop: '2px'
                }}
            >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {QUICK_INCOME.map(q => (
                        <button
                            key={q.value}
                            type="button"
                            onClick={() => handleQuickIncome(q.value)}
                            style={{
                                padding: '4px 10px',
                                fontSize: '11px',
                                borderRadius: '999px',
                                border: '1px solid #1f2937',
                                background:
                                    category === q.value && type === 'income'
                                        ? '#22c55e'
                                        : 'rgba(15, 23, 42, 0.9)',
                                color:
                                    category === q.value && type === 'income'
                                        ? '#020617'
                                        : '#e5e7eb',
                                cursor: 'pointer'
                            }}
                        >
                            {q.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {QUICK_EXPENSE.map(q => (
                        <button
                            key={q.value}
                            type="button"
                            onClick={() => handleQuickExpense(q.value)}
                            style={{
                                padding: '4px 10px',
                                fontSize: '11px',
                                borderRadius: '999px',
                                border: '1px solid #1f2937',
                                background:
                                    category === q.value && type === 'expense'
                                        ? '#ef4444'
                                        : 'rgba(15, 23, 42, 0.9)',
                                color:
                                    category === q.value && type === 'expense'
                                        ? '#020617'
                                        : '#e5e7eb',
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
            </div>

            {/* category with suggestions */}
            <div style={{ position: 'relative' }}>
                <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    onFocus={() => setCategoryInputFocused(true)}
                    onBlur={() => setTimeout(() => setCategoryInputFocused(false), 100)}
                    placeholder="Category (Eg: Events, Utilities, etc.)"
                    style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '8px',
                        border: '1px solid #1f2937',
                        background: '#020617',
                        color: '#e5e7eb'
                    }}
                />

                {categoryInputFocused && filteredSuggestions.length > 0 && (
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: '100%',
                            marginTop: '2px',
                            background: '#020617',
                            borderRadius: '8px',
                            border: '1px solid #1f2937',
                            maxHeight: '140px',
                            overflowY: 'auto',
                            zIndex: 20
                        }}
                    >
                        {filteredSuggestions.map(s => (
                            <div
                                key={s}
                                onMouseDown={() => setCategory(s)}
                                style={{
                                    padding: '6px 8px',
                                    fontSize: '12px',
                                    cursor: 'pointer'
                                }}
                            >
                                {s}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <input
                type="text"
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Notes (optional)"
                style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #1f2937',
                    background: '#020617',
                    color: '#e5e7eb'
                }}
            />

            {/* recurring + receipt */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: '#9ca3af'
                }}
            >
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={e => setIsRecurring(e.target.checked)}
                    />
                    Mark as recurring monthly (rent, salary, electricity…)
                </label>

                <label
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                    }}
                >
                    <span>Attach receipt</span>
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) setReceiptFile(file)
                        }}
                    />
                </label>
            </div>

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
