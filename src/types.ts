export type PersonId = 'wife' | 'husband';

export interface PersonProfile {
  id: PersonId;
  name: string;
  role: string;
  avatarColor: string;
  badgeBg: string;
  badgeText: string;
  tag: string;
}

export type RoutineFrequency = 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom';

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'anytime';

export type ChoreCategory = 
  | 'cleaning' 
  | 'kitchen' 
  | 'laundry' 
  | 'trash' 
  | 'grocery' 
  | 'pet_plant' 
  | 'other';

export interface PraiseRecord {
  id: string;
  choreId: string;
  choreTitle: string;
  sender: PersonId;
  recipient: PersonId;
  sticker: string;
  message: string;
  createdAt: string;
}

export interface ChoreItem {
  id: string;
  title: string;
  category: ChoreCategory;
  frequency: RoutineFrequency;
  timeSlot: TimeSlot;
  targetTime: string; // HH:mm when the chore should be done / alert triggers
  estimatedMinutes: number;
  notes?: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: PersonId; // Who performed and completed it
  praises?: PraiseRecord[];
}

export type ScheduleCategory = 'together' | 'wife' | 'husband' | 'family' | 'anniversary';

export type ScheduleAlertTiming = 'none' | 'at_time' | '10m_before' | '30m_before' | '1h_before' | 'morning_9am';

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  participants: PersonId[]; // ['wife'], ['husband'], or ['wife', 'husband']
  category: ScheduleCategory;
  notes?: string;
  linkedChoreId?: string;
  linkedChoreTitle?: string;
  enableAlert?: boolean; // 캘린더 일정 알림 여부
  alertTiming?: ScheduleAlertTiming; // 언제 알림을 보낼지
  alertDismissed?: boolean; // 알림 확인 여부
}

export type NotificationType = 
  | 'continuous_alert' 
  | 'morning_7am' 
  | 'evening_7pm' 
  | 'praise' 
  | 'chore_completed' 
  | 'schedule_alert'
  | 'general';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  recipient: 'both' | PersonId;
  readByWife: boolean;
  readByHusband: boolean;
  relatedChoreId?: string;
  relatedScheduleId?: string;
}
