import { useEffect, useState } from "react";

// Proof photos are kept out of localStorage (too small) in IndexedDB, with an in-memory copy as a fallback.

const DB_NAME = "bh-equipment-proofs";
const STORE_NAME = "proofs";
const memory = new Map<string, Blob>();

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("IndexedDB unavailable"));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

export const saveProofBlob = async (id: string, blob: Blob): Promise<void> => {
  memory.set(id, blob);
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(blob, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    /* in-memory copy only */
  }
};

export const loadProofBlob = async (id: string): Promise<Blob | undefined> => {
  const cached = memory.get(id);
  if (cached) return cached;
  try {
    const db = await openDb();
    const blob = await new Promise<Blob | undefined>((resolve, reject) => {
      const req = db.transaction(STORE_NAME).objectStore(STORE_NAME).get(id);
      req.onsuccess = () => resolve(req.result as Blob | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return blob;
  } catch {
    return undefined;
  }
};

export const useProofUrl = (id?: string): string | null => {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!id) {
      setUrl(null);
      return;
    }
    let objectUrl: string | null = null;
    let cancelled = false;
    loadProofBlob(id).then((blob) => {
      if (cancelled || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);
  return url;
};
