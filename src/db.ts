import Dexie from 'dexie'
import type { Table } from 'dexie'


export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  amount: number
  type: TransactionType
  category: string
  date: string // ISO string
  note?: string
  createdAt: string
}

class FinanceDB extends Dexie {
  transactions!: Table<Transaction, string>

  constructor() {
    super('financeDB')
    this.version(1).stores({
      transactions: 'id, date, type, category'
    })
  }
}

export const db = new FinanceDB()
