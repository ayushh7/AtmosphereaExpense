// src/db.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or anon key is missing in env variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type TransactionType = 'income' | 'expense'
export type PaymentMethod = 'cash' | 'online'

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  category: string
  date: string         // ISO string
  note?: string
  createdAt: string
  paymentMethod?: PaymentMethod
  isRecurring?: boolean
  receiptDataUrl?: string
}

// shape returned from Supabase (snake_case)
interface TransactionRow {
  id: string
  amount: number
  type: string
  category: string
  date: string
  note: string | null
  created_at: string
  payment_method: string | null
  is_recurring: boolean | null
  receipt_data_url: string | null
}

function mapRow(row: TransactionRow): Transaction {
  return {
    id: row.id,
    amount: Number(row.amount),
    type: row.type as TransactionType,
    category: row.category,
    date: row.date,
    note: row.note ?? undefined,
    createdAt: row.created_at,
    paymentMethod: (row.payment_method as PaymentMethod | null) ?? undefined,
    isRecurring: row.is_recurring ?? undefined,
    receiptDataUrl: row.receipt_data_url ?? undefined
  }
}

export async function getAllTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching transactions', error)
    throw error
  }

  return (data as TransactionRow[]).map(mapRow)
}

export interface NewTransactionInput {
  amount: number
  type: TransactionType
  category: string
  date: string
  note?: string
  paymentMethod?: PaymentMethod
  isRecurring?: boolean
  receiptDataUrl?: string
}

export async function createTransaction(input: NewTransactionInput): Promise<void> {
  const { error } = await supabase.from('transactions').insert({
    amount: input.amount,
    type: input.type,
    category: input.category,
    date: input.date,
    note: input.note ?? null,
    payment_method: input.paymentMethod ?? null,
    is_recurring: input.isRecurring ?? null,
    receipt_data_url: input.receiptDataUrl ?? null
  })

  if (error) {
    console.error('Error creating transaction', error)
    throw error
  }
}

export async function deleteTransaction(id: string): Promise<void> {
  const { error } = await supabase.from('transactions').delete().eq('id', id)
  if (error) {
    console.error('Error deleting transaction', error)
    throw error
  }
}

/* ---------------------- Notes ------------------------- */

export interface Note {
  id: string
  text: string
  createdAt: string
}

interface NoteRow {
  id: string
  text: string
  created_at: string
}

function mapNoteRow(row: NoteRow): Note {
  return {
    id: row.id,
    text: row.text,
    createdAt: row.created_at
  }
}

export async function getAllNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching notes', error)
    throw error
  }

  return (data as NoteRow[]).map(mapNoteRow)
}

export interface NewNoteInput {
  text: string
}

export async function createNote(input: NewNoteInput): Promise<void> {
  const { error } = await supabase.from('notes').insert({
    text: input.text
  })

  if (error) {
    console.error('Error creating note', error)
    throw error
  }
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id)
  if (error) {
    console.error('Error deleting note', error)
    throw error
  }
}
