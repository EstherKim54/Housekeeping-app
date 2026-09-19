import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  X, 
  CheckCheck, 
  Sun, 
  Moon, 
  Heart, 
  Sparkles,
  BellRing,
  CheckCircle2,
  Info,
  Calendar
} from 'lucide-react';
import { AppNotification, PersonId } from '../types';
import { PROFILES } from '../data/initialData';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  activeUser: PersonId;
  onMarkAllAsRead: () => void;
  onSimulateContinuousAlert: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  notifications,
  activeUser,
  onMarkAllAsRead,
  onSimulateContinuousAlert,
}) => {
  if (!isOpen) return null;

  const isRead = (notif: AppNotification) => 
    activeUser === 'wife' ? notif.readByWife : notif.readByHusband;

  const unreadCount = notifications.filter((n) => !isRead(n)).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'schedule_alert':
        return <Calendar className="w-4 h-4 text-amber-500" />;
      case 'continuous_alert':
        return <BellRing className="w-4 h-4 text-rose-500" />;
      case 'morning_7am':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'evening_7pm':
        return <Moon className="w-4 h-4 text-indigo-500" />;
      case 'chore_completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'praise':
        return <Sparkles className="w-4 h-4 text-pink-500" />;
      default:
        return <Bell className="w-4 h-4 text-stone-500" />;
    }
  };

  return (
    <AnimatePresence>
      <div
        id="notification-center-overlay"
        className="fixed inset-0 z-50 flex justify-end bg-stone-900/40 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          id="notification-center-drawer"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-stone-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-stone-900 text-white">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <span>알림 센터</span>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                      {unreadCount}
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-stone-500">
                  {PROFILES[activeUser].name} 수신함
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="text-xs text-stone-600 hover:text-stone-900 px-2 py-1 rounded-lg hover:bg-stone-200/60 transition-colors flex items-center gap-1 font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>모두 읽음</span>
                </button>
              )}
              <button
                id="close-notif-center-btn"
                onClick={onClose}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Simulation Bar */}
          <div className="p-3 bg-stone-100/70 border-b border-stone-200/80">
            <div className="text-[11px] font-semibold text-stone-600 mb-1.5 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-stone-500" />
              <span>지속 알림 시뮬레이션 테스트</span>
            </div>
            <div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSimulateContinuousAlert();
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-900 border border-rose-200 text-xs font-semibold transition-all shadow-2xs"
              >
                <BellRing className="w-3.5 h-3.5 text-rose-500" />
                <span>지속 알림 팝업창 테스트 열기</span>
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {notifications.length === 0 ? (
              <div className="text-center py-16 text-stone-400 text-xs">
                <Bell className="w-8 h-8 mx-auto text-stone-300 mb-2" />
                <span>새로운 알림이 없습니다.</span>
              </div>
            ) : (
              notifications.map((notif) => {
                const read = isRead(notif);
                return (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      read
                        ? 'bg-stone-50/70 border-stone-200/80 text-stone-600'
                        : 'bg-white border-rose-200 text-stone-900 shadow-xs ring-1 ring-rose-100'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-stone-100 shrink-0 mt-0.5">
                        {getIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="text-xs font-bold truncate">{notif.title}</h4>
                          <span className="text-[10px] text-stone-400 shrink-0">
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-stone-600 leading-relaxed break-words">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
