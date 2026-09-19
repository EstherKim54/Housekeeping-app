import { PersonProfile, ChoreItem, ScheduleEvent, AppNotification } from '../types';

export const PROFILES: Record<'wife' | 'husband', PersonProfile> = {
  wife: {
    id: 'wife',
    name: '나 (아내)',
    role: '아내',
    avatarColor: 'bg-rose-500 text-white',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    badgeText: 'text-rose-700',
    tag: '👩🏻 나'
  },
  husband: {
    id: 'husband',
    name: '남편',
    role: '남편',
    avatarColor: 'bg-indigo-600 text-white',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeText: 'text-indigo-700',
    tag: '👨🏻 남편'
  }
};

export const INITIAL_CHORES: ChoreItem[] = [
  {
    id: 'chore-1',
    title: '아침 설거지 및 싱크대 물기 닦기',
    category: 'kitchen',
    frequency: 'daily',
    timeSlot: 'morning',
    targetTime: '08:30',
    estimatedMinutes: 15,
    notes: '식기건조대 정리 후 배수구 거름망 비우기',
    completed: true,
    completedAt: '2026-09-18T08:30:00.000Z',
    completedBy: 'husband',
    praises: [
      {
        id: 'praise-1',
        choreId: 'chore-1',
        choreTitle: '아침 설거지 및 싱크대 물기 닦기',
        sender: 'wife',
        recipient: 'husband',
        sticker: '💖',
        message: '출근 전에 설거지 먼저 싹 해줘서 너무 든든했어요! 고마워 여보 ✨',
        createdAt: '2026-09-18T08:45:00.000Z'
      }
    ]
  },
  {
    id: 'chore-2',
    title: '분리수거 및 음식물 쓰레기 배출',
    category: 'trash',
    frequency: 'daily',
    timeSlot: 'evening',
    targetTime: '19:30',
    estimatedMinutes: 15,
    notes: '플라스틱 라벨 제거 후 1층 분리수거장 배출',
    completed: false
  },
  {
    id: 'chore-3',
    title: '세탁기 돌리기 & 건조기 코스 작동',
    category: 'laundry',
    frequency: 'daily',
    timeSlot: 'morning',
    targetTime: '09:00',
    estimatedMinutes: 20,
    notes: '수건류는 60도 온수 세탁, 울코스는 따로 분리',
    completed: false
  },
  {
    id: 'chore-4',
    title: '거실 및 침실 로봇청소기 가동 & 먼지통 비우기',
    category: 'cleaning',
    frequency: 'daily',
    timeSlot: 'afternoon',
    targetTime: '14:00',
    estimatedMinutes: 10,
    notes: '바닥 전선 정리 후 가동 버튼 누르기',
    completed: false
  },
  {
    id: 'chore-5',
    title: '욕실 물때 청소 & 거울 닦기',
    category: 'cleaning',
    frequency: 'weekends',
    timeSlot: 'evening',
    targetTime: '20:00',
    estimatedMinutes: 25,
    notes: '배수구 락스 소독 및 환풍기 2시간 가동',
    completed: false
  },
  {
    id: 'chore-6',
    title: '화분 물주기 & 베란다 환기',
    category: 'pet_plant',
    frequency: 'daily',
    timeSlot: 'morning',
    targetTime: '09:30',
    estimatedMinutes: 5,
    notes: '몬스테라 겉흙 마른 것 확인 후 듬뿍 주기',
    completed: true,
    completedAt: '2026-09-18T09:15:00.000Z',
    completedBy: 'wife'
  }
];

export const INITIAL_SCHEDULES: ScheduleEvent[] = [
  {
    id: 'event-1',
    title: '주말 이마트 장보기 데이트 🛒',
    date: '2026-09-20',
    time: '15:00',
    participants: ['wife', 'husband'],
    category: 'together',
    notes: '생수 1박스, 과일, 세제 리필 사오기',
    linkedChoreTitle: '식자재 소분 및 냉장고 정리'
  },
  {
    id: 'event-2',
    title: '남편 건강검진 (치과 & 내과) 🏥',
    date: '2026-09-22',
    time: '10:00',
    participants: ['husband'],
    category: 'husband',
    notes: '전날 밤 9시부터 금식'
  },
  {
    id: 'event-3',
    title: '양가 부모님 저녁 식사 초대 👨‍👩‍👧‍👦',
    date: '2026-09-26',
    time: '18:00',
    participants: ['wife', 'husband'],
    category: 'family',
    notes: '집 대청소 및 손님맞이 상차림 준비 필요',
    linkedChoreTitle: '집 전체 대청소 및 환기'
  },
  {
    id: 'event-4',
    title: '아내 필라테스 레슨 🧘🏻‍♀️',
    date: '2026-09-19',
    time: '19:30',
    participants: ['wife'],
    category: 'wife',
    notes: '개인 레슨 14회차'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    type: 'continuous_alert',
    title: '🚨 집안일 연속 알림 작동 중',
    message: '예정 시간이 된 집안일 [분리수거 및 음식물 쓰레기 배출]이 대기 중입니다. 둘 중 누군가 완료할 때까지 계속 알림이 지속됩니다.',
    timestamp: '2026-09-18T19:30:00.000Z',
    recipient: 'both',
    readByWife: true,
    readByHusband: false,
    relatedChoreId: 'chore-2'
  },
  {
    id: 'notif-2',
    type: 'chore_completed',
    title: '🎉 집안일 완료 & 알림 종료',
    message: '남편님이 [아침 설거지 및 싱크대 물기 닦기]를 먼저 완료하여 연속 알림이 종료되었습니다! 칭찬을 보내보세요.',
    timestamp: '2026-09-18T08:31:00.000Z',
    recipient: 'both',
    readByWife: true,
    readByHusband: true,
    relatedChoreId: 'chore-1'
  },
  {
    id: 'notif-3',
    type: 'praise',
    title: '💌 따뜻한 칭찬 도착!',
    message: '아내님이 남편님에게 감사의 칭찬 카드를 보냈어요: "출근 전에 설거지 먼저 싹 해줘서 너무 든든했어요!"',
    timestamp: '2026-09-18T08:46:00.000Z',
    recipient: 'both',
    readByWife: true,
    readByHusband: false
  }
];
