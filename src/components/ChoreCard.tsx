import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  Heart, 
  Edit3, 
  Trash2, 
  BellRing,
  Users
} from 'lucide-react';
import { ChoreItem, PersonId, ChoreCategory } from '../types';
import { PROFILES } from '../data/initialData';

interface ChoreCardProps {
  chore: ChoreItem;
  activeUser: PersonId;
  isAlerting: boolean;
  onToggleComplete: (choreId: string) => void;
  onOpenPraise: (chore: ChoreItem) => void;
  onEdit: (chore: ChoreItem) => void;
  onDelete: (choreId: string) => void;
}

const CATEGORY_MAP: Record<ChoreCategory, { label: string; icon: string; bg: string }> = {
  cleaning: { label: '청소/정리', icon: '🧹', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
  kitchen: { label: '주방/설거지', icon: '🍳', bg: 'bg-orange-50 text-orange-700 border-orange-200' },
  laundry: { label: '빨래/건조', icon: '🧺', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  trash: { label: '분리수거', icon: '♻️', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  grocery: { label: '장보기/비품', icon: '🛒', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  pet_plant: { label: '식물/반려', icon: '🪴', bg: 'bg-teal-50 text-teal-700 border-teal-200' },
  other: { label: '기타 가사', icon: '✨', bg: 'bg-stone-50 text-stone-700 border-stone-200' },
};

const FREQUENCY_MAP = {
  daily: '매일',
  weekdays: '평일',
  weekends: '주말',
  weekly: '주 1회',
  custom: '격일/수시',
};

export const ChoreCard: React.FC<ChoreCardProps> = ({
  chore,
  activeUser,
  isAlerting,
  onToggleComplete,
  onOpenPraise,
  onEdit,
  onDelete,
}) => {
  const categoryInfo = CATEGORY_MAP[chore.category] || CATEGORY_MAP.other;
  const currentProfile = PROFILES[activeUser];
  const completedByProfile = chore.completedBy ? PROFILES[chore.completedBy] : null;
  const latestPraise = chore.praises && chore.praises.length > 0 ? chore.praises[chore.praises.length - 1] : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl border transition-all p-3.5 relative ${
        chore.completed
          ? 'bg-stone-50/70 border-stone-200/90 text-stone-500'
          : isAlerting
          ? 'bg-gradient-to-br from-rose-50/70 via-amber-50/40 to-white border-rose-300 shadow-md ring-2 ring-rose-200/80'
          : 'bg-white border-stone-200/90 shadow-2xs'
      }`}
    >
      <div className="flex items-start justify-between gap-2.5">
        {/* Left main info */}
        <div className="flex-1 min-w-0">
          {/* Tags row */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {/* Category tag */}
            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border font-medium ${categoryInfo.bg}`}>
              <span>{categoryInfo.icon}</span>
              <span>{categoryInfo.label}</span>
            </span>

            {/* Alert time tag */}
            <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-bold ${
              isAlerting && !chore.completed
                ? 'bg-rose-500 text-white animate-pulse'
                : 'bg-stone-100 text-stone-600'
            }`}>
              <Clock className="w-3 h-3" />
              <span>{chore.targetTime || '19:00'}</span>
            </span>

            {/* Frequency */}
            <span className="text-[10px] text-stone-400 font-medium">
              {FREQUENCY_MAP[chore.frequency]}
            </span>
          </div>

          {/* Active Continuous Alert indicator */}
          {!chore.completed && isAlerting && (
            <div className="mb-1.5 px-2.5 py-1 rounded-xl bg-rose-100/90 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-1.5">
              <BellRing className="w-3 h-3 text-rose-600 animate-spin" style={{ animationDuration: '4s' }} />
              <span>🚨 둘 중 완료할 때까지 계속 알림 중</span>
            </div>
          )}

          {/* Chore Title */}
          <h4 className={`text-sm font-extrabold leading-snug flex items-center gap-1.5 ${
            chore.completed ? 'line-through text-stone-400' : 'text-stone-900'
          }`}>
            <span>{chore.title}</span>
            <span className="text-[11px] font-normal text-stone-400">({chore.estimatedMinutes}분)</span>
          </h4>

          {/* Notes if any */}
          {chore.notes && (
            <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">
              {chore.notes}
            </p>
          )}

          {/* Completed State Info */}
          {chore.completed && completedByProfile && (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>{completedByProfile.name}님이 완료함 ✨</span>
              </span>

              {/* Praise button trigger */}
              <button
                type="button"
                onClick={() => onOpenPraise(chore)}
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-2xs transition-all active:scale-95"
              >
                <Heart className="w-3 h-3 fill-current" />
                <span>고마워 칭찬하기 💌</span>
              </button>
            </div>
          )}

          {/* Latest praise message card preview */}
          {latestPraise && (
            <div className="mt-2 p-2 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <span className="text-base leading-none">{latestPraise.sticker}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between font-bold text-[10px] text-amber-800 mb-0.5">
                  <span>{PROFILES[latestPraise.sender].name}의 칭찬 카드</span>
                  <span className="text-stone-400 font-normal text-[9px]">
                    {new Date(latestPraise.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[11px] text-amber-950 font-medium leading-tight">
                  "{latestPraise.message}"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right side actions */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {!chore.completed ? (
            <button
              type="button"
              onClick={() => onToggleComplete(chore.id)}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-black shadow-xs active:scale-90 transition-all ${
                isAlerting
                  ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-300 animate-pulse'
                  : 'bg-stone-900 hover:bg-stone-800 text-white'
              }`}
              title={`${currentProfile.name} 이름으로 완료`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>완료</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onToggleComplete(chore.id)}
              className="text-stone-400 hover:text-stone-600 text-[11px] px-1.5 py-0.5 rounded-md hover:bg-stone-100 transition-colors"
            >
              취소
            </button>
          )}

          <div className="flex items-center gap-0.5 mt-0.5">
            <button
              type="button"
              onClick={() => onEdit(chore)}
              className="p-1 text-stone-400 hover:text-stone-700 active:scale-90 rounded-md transition-colors"
              title="수정"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(chore.id)}
              className="p-1 text-stone-400 hover:text-rose-600 active:scale-90 rounded-md transition-colors"
              title="삭제"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
