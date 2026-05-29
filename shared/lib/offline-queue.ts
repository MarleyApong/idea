import { openDB, type IDBPDatabase } from "idb"

const DB_NAME = "idea-offline"
const DB_VERSION = 1
const STORE = "queue"

export type OperationType = "create" | "update" | "delete"

export interface PendingOperation {
  id: string
  type: OperationType
  ideaId?: string
  payload: {
    title?: string
    description?: string
    ideaType?: string
    tags?: string[]
    status?: string
  }
  locale: string
  timestamp: number
}

let _db: IDBPDatabase | null = null

async function db(): Promise<IDBPDatabase> {
  if (!_db) {
    _db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(database) {
        database.createObjectStore(STORE, { keyPath: "id" })
      },
    })
  }
  return _db
}

export async function enqueue(
  op: Omit<PendingOperation, "id" | "timestamp">
): Promise<PendingOperation> {
  const record: PendingOperation = {
    ...op,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  }
  await (await db()).add(STORE, record)
  return record
}

export async function dequeue(id: string): Promise<void> {
  await (await db()).delete(STORE, id)
}

export async function getAllPending(): Promise<PendingOperation[]> {
  const all = await (await db()).getAll(STORE)
  return all.sort((a, b) => a.timestamp - b.timestamp)
}

export async function getPendingCount(): Promise<number> {
  return (await db()).count(STORE)
}
