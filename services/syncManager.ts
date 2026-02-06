
import { KitaTransaction } from '../types';
import { addKitaTransaction } from './supabase';

const SYNC_QUEUE_KEY = 'gotop_sync_queue';

export interface PendingTransaction extends Omit<KitaTransaction, 'id'> {
  tempId: string;
}

export const getSyncQueue = (): PendingTransaction[] => {
  const raw = localStorage.getItem(SYNC_QUEUE_KEY);
  return raw ? JSON.parse(raw) : [];
};

export const addToSyncQueue = (userId: string, transaction: Omit<KitaTransaction, 'id'>) => {
  const queue = getSyncQueue();
  const pending: PendingTransaction = {
    ...transaction,
    tempId: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  queue.push(pending);
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  console.log("Go'Top Pro: Transaction sauvegardée localement (Offline).");
};

export const processSyncQueue = async (userId: string): Promise<number> => {
  const queue = getSyncQueue();
  if (queue.length === 0) return 0;

  console.log(`Go'Top Pro: Tentative de synchronisation de ${queue.length} transactions...`);
  let syncedCount = 0;
  const remainingQueue: PendingTransaction[] = [];

  for (const pending of queue) {
    try {
      const { tempId, ...cleanTransaction } = pending;
      await addKitaTransaction(userId, cleanTransaction);
      syncedCount++;
    } catch (err) {
      console.error("Échec de synchro pour une transaction, remise en file.", err);
      remainingQueue.push(pending);
    }
  }

  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remainingQueue));
  return syncedCount;
};
