// src/components/NotesView.tsx
import { useState } from 'react'
import type { Note } from '../db'

interface NotesViewProps {
  notes: Note[]
  loading: boolean
  onAddNote: (text: string) => Promise<void>
  onDeleteNote: (id: string) => Promise<void>
}

export function NotesView({
  notes,
  loading,
  onAddNote,
  onDeleteNote
}: NotesViewProps) {
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return

    setSubmitting(true)
    try {
      await onAddNote(trimmed)
      setText('')
    } catch (err) {
      console.error(err)
      alert('Could not save note')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        flex: 1,
        minHeight: 0
      }}
    >
      {/* note input card */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#0f172a',
          borderRadius: '16px',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div
          style={{
            fontSize: '12px',
            color: '#9ca3af'
          }}
        >
          Notes for today / this week (recipes, vendor issues, staff notes…)
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Write any notes you want to remember…"
          rows={4}
          style={{
            width: '100%',
            resize: 'vertical',
            padding: '8px',
            borderRadius: '8px',
            border: '1px solid #1f2937',
            background: '#020617',
            color: '#e5e7eb',
            fontSize: '13px'
          }}
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          style={{
            alignSelf: 'flex-end',
            padding: '8px 14px',
            borderRadius: '999px',
            border: 'none',
            background: submitting ? '#4b5563' : '#22c55e',
            color: '#020617',
            fontSize: '12px',
            fontWeight: 600,
            cursor: submitting ? 'default' : 'pointer'
          }}
        >
          {submitting ? 'Saving…' : 'Add note'}
        </button>
      </form>

      {/* notes list */}
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
          Saved notes
        </div>

        {loading ? (
          <div style={{ fontSize: '13px', color: '#9ca3af' }}>Loading…</div>
        ) : notes.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#9ca3af' }}>
            No notes yet. Use this space for anything:
            <br />
            – Supplier changes, staff feedback, menu ideas, etc.
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              overflowY: 'auto'
            }}
          >
            {notes.map(note => (
              <div
                key={note.id}
                style={{
                  padding: '8px',
                  borderRadius: '10px',
                  background: '#020617',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {note.text}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: '11px',
                    color: '#9ca3af'
                  }}
                >
                  <span>
                    {new Date(note.createdAt).toLocaleString(undefined, {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteNote(note.id)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#f97316',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
