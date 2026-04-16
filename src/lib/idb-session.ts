/**
 * IndexedDB session persistence.
 * Stores the active workspace (File objects + metadata) locally in the browser
 * so the session survives page refreshes and accidental tab closes.
 * Images never leave the device — zero DB cost, fully private.
 */

import type { AssetImage, CurrentProject } from '@/types'

const DB_NAME = 'renamerly-session'
const DB_VERSION = 1
const STORE_META = 'meta'
const STORE_FILES = 'files'
const LS_CLEARED_AT = 'renamerly-session-cleared-at'

/** Called synchronously inside reset() — guarantees any subsequent loadSession() rejects stale IDB data */
export function markSessionCleared(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_CLEARED_AT, Date.now().toString())
}

interface SessionMeta {
  savedAt: number
  currentProject: CurrentProject | null
  images: Array<{
    id: string
    originalName: string
    extension: string
    isRaw: boolean
    sku: string | null
    descriptor: string | null
    customDescriptor: string | null
  }>
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_META)) db.createObjectStore(STORE_META)
      if (!db.objectStoreNames.contains(STORE_FILES)) db.createObjectStore(STORE_FILES)
    }
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result)
    req.onerror = () => reject(req.error)
  })
}

function idbGet<T>(db: IDBDatabase, store: string, key: string): Promise<T | undefined> {
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, 'readonly').objectStore(store).get(key)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function idbPut(db: IDBDatabase, store: string, key: string, value: unknown): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    tx.objectStore(store).put(value, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

function idbDelete(db: IDBDatabase, store: string, key: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    tx.objectStore(store).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function saveSession(
  images: AssetImage[],
  currentProject: CurrentProject | null
): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const db = await openDB()

    const meta: SessionMeta = {
      savedAt: Date.now(),
      currentProject,
      images: images.map((img) => ({
        id: img.id,
        originalName: img.originalName,
        extension: img.extension,
        isRaw: img.isRaw,
        sku: img.sku,
        descriptor: img.descriptor,
        customDescriptor: img.customDescriptor,
      })),
    }

    const fileMap: Record<string, File> = {}
    images.forEach((img) => { fileMap[img.id] = img.file })

    await Promise.all([
      idbPut(db, STORE_META, 'current', meta),
      idbPut(db, STORE_FILES, 'current', fileMap),
    ])

    db.close()
  } catch (err) {
    console.warn('[idb-session] save failed:', err)
  }
}

export async function loadSession(): Promise<{
  images: AssetImage[]
  currentProject: CurrentProject | null
} | null> {
  if (typeof window === 'undefined') return null
  try {
    const db = await openDB()

    const [meta, fileMap] = await Promise.all([
      idbGet<SessionMeta>(db, STORE_META, 'current'),
      idbGet<Record<string, File>>(db, STORE_FILES, 'current'),
    ])

    db.close()

    if (!meta || !fileMap || meta.images.length === 0) return null

    // Reject sessions that were saved before the last explicit reset()
    const clearedAt = parseInt(localStorage.getItem(LS_CLEARED_AT) ?? '0', 10)
    if (meta.savedAt <= clearedAt) return null

    const { extractRawPreview, generateRawPlaceholder } =
      await import('@/lib/rawProcessor')

    const images = await Promise.all(
      meta.images.map(async (imgMeta) => {
        const file = fileMap[imgMeta.id]
        if (!file) return null

        let thumbnail: string
        if (imgMeta.isRaw) {
          const preview = await extractRawPreview(file)
          thumbnail = preview || generateRawPlaceholder(imgMeta.originalName)
        } else {
          thumbnail = URL.createObjectURL(file)
        }

        return {
          id: imgMeta.id,
          file,
          thumbnail,
          originalName: imgMeta.originalName,
          extension: imgMeta.extension,
          isRaw: imgMeta.isRaw,
          sku: imgMeta.sku,
          descriptor: imgMeta.descriptor,
          customDescriptor: imgMeta.customDescriptor,
        } satisfies AssetImage
      })
    )

    const valid = images.filter(Boolean) as AssetImage[]
    if (valid.length === 0) return null

    return { images: valid, currentProject: meta.currentProject }
  } catch (err) {
    console.warn('[idb-session] load failed:', err)
    return null
  }
}

export async function clearSession(): Promise<void> {
  if (typeof window === 'undefined') return
  try {
    const db = await openDB()
    await Promise.all([
      idbDelete(db, STORE_META, 'current'),
      idbDelete(db, STORE_FILES, 'current'),
    ])
    db.close()
  } catch (err) {
    console.warn('[idb-session] clear failed:', err)
  }
}
