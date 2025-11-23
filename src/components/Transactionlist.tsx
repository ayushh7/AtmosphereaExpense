import type  { Transaction } from '../db'

interface Props {
  items: Transaction[]
  onDelete: (id: string) => void
}

export function TransactionList({ items, onDelete }: Props) {
  if (items.length === 0) {
    return (
      <div
        style={{
          marginTop: '8px',
          fontSize: '13px',
          color: '#9ca3af',
          textAlign: 'center'
        }}
      >
        No transactions yet. Start by adding one above.
      </div>
    )
  }

  return (
    <div
      style={{
        marginTop: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxHeight: '380px',
        overflowY: 'auto',
        paddingRight: '4px'
      }}
    >
      {items.map(tx => {
        const sign = tx.type === 'expense' ? '-' : '+'
        const color = tx.type === 'expense' ? '#ef4444' : '#22c55e'

        return (
          <div
            key={tx.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#020617',
              borderRadius: '12px',
              padding: '8px 10px'
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>
                {tx.category}{' '}
                {tx.note && (
                  <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                    · {tx.note}
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#9ca3af',
                  marginTop: '2px'
                }}
              >
                {new Date(tx.date).toLocaleString()}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color
                }}
              >
                {sign}{' '}
                {tx.amount.toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </div>
              <button
                onClick={() => onDelete(tx.id)}
                style={{
                  marginTop: '4px',
                  fontSize: '11px',
                  border: 'none',
                  background: 'transparent',
                  color: '#6b7280',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
