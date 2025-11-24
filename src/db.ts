// src/db.ts
import Dexie from 'dexie'
import type { Table } from 'dexie'

export type TransactionType = 'income' | 'expense'
export type PaymentMethod = 'cash' | 'online'

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  category: string
  date: string        
  note?: string
  createdAt: string
  paymentMethod?: PaymentMethod
  isRecurring?: boolean
  receiptDataUrl?: string
}

class FinanceDB extends Dexie {
  transactions!: Table<Transaction, string>

  constructor() {
    super('cafeFinanceDB')
    this.version(3).stores({
      transactions: 'id, createdAt, date, type, category'
    })
  }
}

export const db = new FinanceDB()
