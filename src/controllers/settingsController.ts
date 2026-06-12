import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';

export interface StoreSettings {
  storeName: string;
  adminEmail: string;
}

const SETTINGS_DOC = doc(db, 'settings', 'store');

export async function getStoreSettings(): Promise<StoreSettings | null> {
  const snap = await getDoc(SETTINGS_DOC);
  if (!snap.exists()) return null;
  return snap.data() as StoreSettings;
}

export async function saveStoreSettings(data: StoreSettings): Promise<void> {
  await setDoc(
    SETTINGS_DOC,
    { ...data, updatedAt: Timestamp.now() },
    { merge: true },
  );
}
