import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  writeBatch
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ChoreItem, ScheduleEvent, AppNotification, PersonId } from '../types';
import { INITIAL_CHORES, INITIAL_SCHEDULES, INITIAL_NOTIFICATIONS } from '../data/initialData';

const CHORES_COLLECTION = 'chores';
const SCHEDULES_COLLECTION = 'schedules';
const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Remove undefined values to avoid Firestore serialization errors
 */
function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean;
}

/**
 * Seeds initial mock data if the Firestore collection is completely empty
 */
export async function seedInitialDataIfEmpty() {
  try {
    const choresSnap = await getDocs(collection(db, CHORES_COLLECTION));
    if (choresSnap.empty) {
      console.log('Seeding initial chores to Firestore...');
      const batch = writeBatch(db);
      for (const chore of INITIAL_CHORES) {
        const ref = doc(db, CHORES_COLLECTION, chore.id);
        batch.set(ref, sanitizeForFirestore(chore));
      }
      await batch.commit();
    }

    const schedulesSnap = await getDocs(collection(db, SCHEDULES_COLLECTION));
    if (schedulesSnap.empty) {
      console.log('Seeding initial schedules to Firestore...');
      const batch = writeBatch(db);
      for (const sched of INITIAL_SCHEDULES) {
        const ref = doc(db, SCHEDULES_COLLECTION, sched.id);
        batch.set(ref, sanitizeForFirestore(sched));
      }
      await batch.commit();
    }

    const notifsSnap = await getDocs(collection(db, NOTIFICATIONS_COLLECTION));
    if (notifsSnap.empty) {
      console.log('Seeding initial notifications to Firestore...');
      const batch = writeBatch(db);
      for (const notif of INITIAL_NOTIFICATIONS) {
        const ref = doc(db, NOTIFICATIONS_COLLECTION, notif.id);
        batch.set(ref, sanitizeForFirestore(notif));
      }
      await batch.commit();
    }
  } catch (err) {
    console.error('Error seeding initial Firestore data:', err);
  }
}

/**
 * Subscribes to real-time updates for Chores
 */
export function subscribeChores(
  onUpdate: (chores: ChoreItem[]) => void,
  onError?: (err: any) => void
) {
  const choresRef = collection(db, CHORES_COLLECTION);
  return onSnapshot(
    choresRef,
    (snapshot) => {
      const items: ChoreItem[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ChoreItem);
      });
      // Sort by creation or target time if desired
      onUpdate(items);
    },
    (err) => {
      console.error('Firestore chores subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribes to real-time updates for Schedules
 */
export function subscribeSchedules(
  onUpdate: (schedules: ScheduleEvent[]) => void,
  onError?: (err: any) => void
) {
  const schedRef = collection(db, SCHEDULES_COLLECTION);
  return onSnapshot(
    schedRef,
    (snapshot) => {
      const items: ScheduleEvent[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as ScheduleEvent);
      });
      // Sort by date ascending
      items.sort((a, b) => a.date.localeCompare(b.date));
      onUpdate(items);
    },
    (err) => {
      console.error('Firestore schedules subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Subscribes to real-time updates for Notifications
 */
export function subscribeNotifications(
  onUpdate: (notifs: AppNotification[]) => void,
  onError?: (err: any) => void
) {
  const notifsRef = collection(db, NOTIFICATIONS_COLLECTION);
  return onSnapshot(
    notifsRef,
    (snapshot) => {
      const items: AppNotification[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as AppNotification);
      });
      // Sort by timestamp descending
      items.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
      onUpdate(items);
    },
    (err) => {
      console.error('Firestore notifications subscription error:', err);
      if (onError) onError(err);
    }
  );
}

/**
 * Saves or updates a chore in Firestore (broadcasts to other phone immediately)
 */
export async function syncSaveChore(chore: ChoreItem) {
  try {
    const ref = doc(db, CHORES_COLLECTION, chore.id);
    await setDoc(ref, sanitizeForFirestore(chore), { merge: true });
  } catch (err) {
    console.error('Failed to sync chore to Firestore:', err);
    throw err;
  }
}

/**
 * Deletes a chore from Firestore
 */
export async function syncDeleteChore(choreId: string) {
  try {
    const ref = doc(db, CHORES_COLLECTION, choreId);
    await deleteDoc(ref);
  } catch (err) {
    console.error('Failed to delete chore from Firestore:', err);
    throw err;
  }
}

/**
 * Saves or updates a schedule event in Firestore
 */
export async function syncSaveSchedule(event: ScheduleEvent) {
  try {
    const ref = doc(db, SCHEDULES_COLLECTION, event.id);
    await setDoc(ref, sanitizeForFirestore(event), { merge: true });
  } catch (err) {
    console.error('Failed to sync schedule to Firestore:', err);
    throw err;
  }
}

/**
 * Deletes a schedule event from Firestore
 */
export async function syncDeleteSchedule(eventId: string) {
  try {
    const ref = doc(db, SCHEDULES_COLLECTION, eventId);
    await deleteDoc(ref);
  } catch (err) {
    console.error('Failed to delete schedule from Firestore:', err);
    throw err;
  }
}

/**
 * Saves or updates a notification in Firestore
 */
export async function syncSaveNotification(notif: AppNotification) {
  try {
    const ref = doc(db, NOTIFICATIONS_COLLECTION, notif.id);
    await setDoc(ref, sanitizeForFirestore(notif), { merge: true });
  } catch (err) {
    console.error('Failed to sync notification to Firestore:', err);
    throw err;
  }
}

/**
 * Marks all notifications as read by user in Firestore
 */
export async function syncMarkAllNotificationsRead(user: PersonId, notifs: AppNotification[]) {
  try {
    const batch = writeBatch(db);
    for (const notif of notifs) {
      const ref = doc(db, NOTIFICATIONS_COLLECTION, notif.id);
      const updateData = user === 'wife' ? { readByWife: true } : { readByHusband: true };
      batch.update(ref, updateData);
    }
    await batch.commit();
  } catch (err) {
    console.error('Failed to mark notifications read in Firestore:', err);
  }
}
