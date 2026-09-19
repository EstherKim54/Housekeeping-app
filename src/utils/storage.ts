import { ChoreItem, ScheduleEvent, AppNotification, PersonId } from '../types';
import { INITIAL_CHORES, INITIAL_SCHEDULES, INITIAL_NOTIFICATIONS } from '../data/initialData';

const STORAGE_KEYS = {
  CHORES: 'homie_couple_chores_v2',
  SCHEDULES: 'homie_couple_schedules_v2',
  NOTIFICATIONS: 'homie_couple_notifications_v2',
  ACTIVE_USER: 'homie_couple_active_user_v2',
};

export function loadChores(): ChoreItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CHORES);
    if (!raw) {
      saveChores(INITIAL_CHORES);
      return INITIAL_CHORES;
    }
    const parsed: ChoreItem[] = JSON.parse(raw);
    // Ensure targetTime fallback for older stored items
    return parsed.map((item) => ({
      ...item,
      targetTime: item.targetTime || '19:00',
    }));
  } catch (err) {
    console.error('Failed to load chores from storage:', err);
    return INITIAL_CHORES;
  }
}

export function saveChores(chores: ChoreItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.CHORES, JSON.stringify(chores));
  } catch (err) {
    console.error('Failed to save chores to storage:', err);
  }
}

export function loadSchedules(): ScheduleEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
    if (!raw) {
      saveSchedules(INITIAL_SCHEDULES);
      return INITIAL_SCHEDULES;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load schedules from storage:', err);
    return INITIAL_SCHEDULES;
  }
}

export function saveSchedules(schedules: ScheduleEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  } catch (err) {
    console.error('Failed to save schedules to storage:', err);
  }
}

export function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (!raw) {
      saveNotifications(INITIAL_NOTIFICATIONS);
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load notifications:', err);
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: AppNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  } catch (err) {
    console.error('Failed to save notifications:', err);
  }
}

export function loadActiveUser(): PersonId {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (saved === 'wife' || saved === 'husband') {
      return saved;
    }
    return 'wife';
  } catch {
    return 'wife';
  }
}

export function saveActiveUser(user: PersonId) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, user);
  } catch (err) {
    console.error('Failed to save active user:', err);
  }
}

export function getOppositePerson(person: PersonId): PersonId {
  return person === 'wife' ? 'husband' : 'wife';
}

/**
 * Checks if a chore is due for alert based on current time
 */
export function isChoreOverdueOrDue(chore: ChoreItem, now: Date = new Date()): boolean {
  if (chore.completed) return false;
  if (!chore.targetTime) return true;

  const [hours, minutes] = chore.targetTime.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return true;

  const targetMinutes = hours * 60 + minutes;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return currentMinutes >= targetMinutes;
}

/**
 * Checks if a calendar event is due for notification
 */
export function isScheduleAlertDue(event: ScheduleEvent, now: Date = new Date()): boolean {
  if (!event.enableAlert || event.alertDismissed) return false;

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  // Only alert for events on or before today (not future days)
  if (event.date > todayStr) return false;

  const timing = event.alertTiming || 'at_time';

  // If morning 9 AM alert
  if (timing === 'morning_9am') {
    const alertTime = new Date(event.date);
    alertTime.setHours(9, 0, 0, 0);
    return now.getTime() >= alertTime.getTime();
  }

  // If no specific time was set, default to 09:00 AM on that date
  const eventTimeStr = event.time || '09:00';
  const [hours, minutes] = eventTimeStr.split(':').map(Number);
  
  const eventDateTime = new Date(`${event.date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);

  let minutesOffset = 0;
  if (timing === '10m_before') minutesOffset = 10;
  else if (timing === '30m_before') minutesOffset = 30;
  else if (timing === '1h_before') minutesOffset = 60;

  const alertTriggerTime = new Date(eventDateTime.getTime() - minutesOffset * 60 * 1000);

  return now.getTime() >= alertTriggerTime.getTime();
}

