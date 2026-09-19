import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BellRing, 
  X, 
  CheckCircle2, 
  Users, 
  Clock, 
  AlertTriangle
} from 'lucide-react';
import { ChoreItem, PersonId, NotificationType } from '../types';
import { PROFILES } from '../data/initialData';
import { isChoreOverdueOrDue } from '../utils/storage';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: NotificationType;
  chores: ChoreItem[];
  activeUser: PersonId;
  onQuickComplete: (choreId: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  chores,
  activeUser,
  onQuickComplete,
}) => {
  if (!isOpen) return null;

  const currentProfile = PROFILES[activeUser];
  const pendingChores = chores.filter((c) => !c.completed);
  const overdueChores = chores.filter((c) => !c.completed && isChoreOverdueOrDue(c));
  const displayChores = overdueChores.length > 0 ? overdueChores : pendingChores;

  return (
    <AnimatePresence>
      <div 
        id="notification-alert-overlay"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/70 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          id="notification-alert-card"
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Handle indicator */}
          <div className="w-12 h-1.5 bg-white/40 rounded-full mx-auto mt-2.5 sm:hidden" />

          {/* Top Banner (App style alert banner) */}
          <div className="p-4 sm:p-5 text-white bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold">
                <BellRing className="w-3.5 h-3.5 text-amber-200 animate-bounce" />
                <span>누구든 완료할 때까지 지속 알림</span>
              </div>

              <button
                id="close-notif-alert-btn"
                onClick={onClose}
                className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg sm:text-xl font-black mt-2.5 flex items-center gap-2">
              <span>집안일 알림 대기 중 🔔</span>
            </h3>

            <p className="text-xs text-white/95 mt-1 leading-relaxed">
              할당된 담당자가 없으므로, 아내 또는 남편 중 <strong>먼저 완료하는 사람</strong>이 터치하면 즉시 알림이 해제됩니다!
            </p>

            {/* Shared notice badge */}
            <div className="mt-3 p-2 rounded-xl bg-white/15 backdrop-blur-xs border border-white/20 flex items-center gap-2 text-[11px]">
              <Users className="w-4 h-4 text-white shrink-0" />
              <div className="flex-1 truncate">
                현재 사용자: <strong>{currentProfile.name}</strong> • 내가 지금 끝내고 파트너에게 칭찬받기!
              </div>
            </div>
          </div>

          {/* Body Section */}
          <div className="p-4 sm:p-5 space-y-3 max-h-[50vh] overflow-y-auto">
            <div className="text-xs font-bold text-stone-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>대기 중인 집안일 ({displayChores.length}건)</span>
              </span>
              <span className="text-[11px] text-stone-500 font-normal">
                원터치 완료
              </span>
            </div>

            {displayChores.length === 0 ? (
              <div className="p-6 text-center bg-stone-50 rounded-2xl border border-stone-200/80">
                <div className="text-3xl mb-1">🎉</div>
                <div className="text-xs font-bold text-stone-800">모든 집안일이 완료되었습니다!</div>
                <div className="text-[11px] text-stone-500 mt-0.5">
                  대기 중인 지속 알림이 없습니다.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {displayChores.map((chore) => (
                  <div
                    key={chore.id}
                    className="bg-stone-50 hover:bg-stone-100/80 border border-stone-200 rounded-2xl p-3 flex items-center justify-between gap-2.5 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800">
                          {chore.targetTime || '19:00'} 알림
                        </span>
                        <span className="text-[10px] text-stone-400">
                          {chore.estimatedMinutes}분
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-stone-800 truncate">
                        {chore.title}
                      </div>
                    </div>

                    {/* Quick Complete Button */}
                    <button
                      type="button"
                      onClick={() => onQuickComplete(chore.id)}
                      className="shrink-0 flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:scale-95 rounded-xl transition-all shadow-xs ring-2 ring-rose-200"
                      title="내가 완료하고 알림을 해제합니다"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>완료! ✨</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Action */}
          <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-stone-400">
              <Clock className="w-3 h-3 text-stone-400" />
              <span>완료 시까지 시각 알림 반복</span>
            </div>
            <button
              id="confirm-notif-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-800 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl transition-colors shadow-2xs"
            >
              닫기
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
