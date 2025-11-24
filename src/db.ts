import Dexie from 'dexie'
import type { Table } from 'dexie'

export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  amount: number
  type: TransactionType        // 'income' or 'expense'
  category: string
  date: string                 // ISO string
  note?: string
  createdAt: string
}

class FinanceDB extends Dexie {
  transactions!: Table<Transaction, string>

  constructor() {
    super('cafeFinanceDB')
    this.version(2).stores({
      // index createdAt so we can orderBy it
      transactions: 'id, createdAt, date, type, category'
    })
  }
}

export const db = new FinanceDB()
