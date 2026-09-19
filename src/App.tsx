import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChoreItem, 
  ScheduleEvent, 
  AppNotification, 
  PersonId, 
  PraiseRecord
} from './types';
import { 
  loadChores, 
  saveChores, 
  loadSchedules, 
  saveSchedules, 
  loadNotifications, 
  saveNotifications, 
  loadActiveUser, 
  saveActiveUser,
  isChoreOverdueOrDue,
  isScheduleAlertDue
} from './utils/storage';
import {
  seedInitialDataIfEmpty,
  subscribeChores,
  subscribeSchedules,
  subscribeNotifications,
  syncSaveChore,
  syncDeleteChore,
  syncSaveSchedule,
  syncDeleteSchedule,
  syncSaveNotification,
  syncMarkAllNotificationsRead
} from './utils/firebaseSync';
import { fireCompletionConfetti } from './utils/confetti';
import { PROFILES } from './data/initialData';

import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { ChoreManager } from './components/ChoreManager';
import { ChoreModal } from './components/ChoreModal';
import { ScheduleView } from './components/ScheduleView';
import { ScheduleModal } from './components/ScheduleModal';
import { PraiseBoard } from './components/PraiseBoard';
import { PraiseModal } from './components/PraiseModal';
import { NotificationModal } from './components/NotificationModal';
import { NotificationCenter } from './components/NotificationCenter';
import { InstallModal } from './components/InstallModal';
import { BellRing, CheckCircle2, Heart, X, Calendar } from 'lucide-react';

export default function App() {
  // Global State
  const [activeUser, setActiveUser] = useState<PersonId>(() => loadActiveUser());
  const [activeTab, setActiveTab] = useState<'chores' | 'schedules' | 'praises'>('chores');
  const [chores, setChores] = useState<ChoreItem[]>(() => loadChores());
  const [schedules, setSchedules] = useState<ScheduleEvent[]>(() => loadSchedules());
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadNotifications());

  // In-app silent push toast for mobile visual feedback
  const [activeToast, setActiveToast] = useState<{
    id: string;
    title: string;
    message: string;
    type: 'alert' | 'complete' | 'praise' | 'schedule';
  } | null>(null);

  // Modal Controls
  const [isChoreModalOpen, setIsChoreModalOpen] = useState(false);
  const [editingChore, setEditingChore] = useState<ChoreItem | null>(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEvent | null>(null);

  const [isPraiseModalOpen, setIsPraiseModalOpen] = useState(false);
  const [praisingChore, setPraisingChore] = useState<ChoreItem | null>(null);

  const [isNotifCenterOpen, setIsNotifCenterOpen] = useState(false);
  const [isContinuousAlertOpen, setIsContinuousAlertOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveChores(chores);
  }, [chores]);

  useEffect(() => {
    saveSchedules(schedules);
  }, [schedules]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    saveActiveUser(activeUser);
  }, [activeUser]);

  // 1. Initial Firestore Real-time Sync Setup
  useEffect(() => {
    // Seed initial data if Firestore is brand new
    seedInitialDataIfEmpty().catch((err) => {
      console.warn('Initial Firestore seed check:', err);
    });

    // Real-time listener for Chores
    const unsubChores = subscribeChores((remoteChores) => {
      if (remoteChores && remoteChores.length > 0) {
        setChores(remoteChores);
      }
    });

    // Real-time listener for Schedules
    const unsubSchedules = subscribeSchedules((remoteSchedules) => {
      if (remoteSchedules && remoteSchedules.length > 0) {
        setSchedules(remoteSchedules);
      }
    });

    // Real-time listener for Notifications
    const unsubNotifs = subscribeNotifications((remoteNotifs) => {
      if (remoteNotifs && remoteNotifs.length > 0) {
        setNotifications(remoteNotifs);
      }
    });

    return () => {
      unsubChores();
      unsubSchedules();
      unsubNotifs();
    };
  }, []);

  // Silent Continuous Alert Checker & Calendar Schedule Notification Checker:
  // Re-evaluates due chores and scheduled events periodically
  useEffect(() => {
    const checkAlerts = () => {
      const now = new Date();

      // 1. Check for due calendar schedule events
      schedules.forEach((event) => {
        if (isScheduleAlertDue(event, now) && !event.alertDismissed) {
          // Trigger visual push toast
          triggerPushToast(
            '📅 캘린더 일정 알림!',
            `[${event.title}] 일정이 다가왔습니다.`,
            'schedule'
          );

          // Add to notification records
          const notif: AppNotification = {
            id: `sched-notif-${event.id}-${Date.now()}`,
            type: 'schedule_alert',
            title: `📅 일정 알림: ${event.title}`,
            message: `${event.date} ${event.time ? event.time : ''}에 예정된 [${event.title}] 일정이 다가왔습니다.`,
            timestamp: new Date().toISOString(),
            recipient: 'both',
            readByWife: false,
            readByHusband: false,
            relatedScheduleId: event.id,
          };
          setNotifications((prev) => [notif, ...prev]);
          syncSaveNotification(notif).catch(console.error);

          // Mark schedule alert as dismissed for this occurrence
          const updatedEvent = { ...event, alertDismissed: true };
          setSchedules((prev) =>
            prev.map((ev) => (ev.id === event.id ? updatedEvent : ev))
          );
          syncSaveSchedule(updatedEvent).catch(console.error);
        }
      });

      // 2. Trigger periodic re-render of chore due statuses
      setChores((prev) => [...prev]);
    };

    checkAlerts();
    const timer = setInterval(checkAlerts, 15000);
    return () => clearInterval(timer);
  }, [schedules]);

  // Show auto-dismiss toast
  const triggerPushToast = (
    title: string, 
    message: string, 
    type: 'alert' | 'complete' | 'praise' | 'schedule'
  ) => {
    const toastObj = { id: String(Date.now()), title, message, type };
    setActiveToast(toastObj);
    setTimeout(() => {
      setActiveToast((current) => (current?.id === toastObj.id ? null : current));
    }, 4500);
  };

  // Switch User Profile
  const handleSwitchUser = (newUser: PersonId) => {
    setActiveUser(newUser);
    const profile = PROFILES[newUser];
    triggerPushToast('사용자 전환', `${profile.name} 모드로 전환되었습니다.`, 'complete');
  };

  // Chore Actions
  const handleSaveChore = (chore: ChoreItem) => {
    setChores((prev) => {
      const exists = prev.some((c) => c.id === chore.id);
      if (exists) {
        return prev.map((c) => (c.id === chore.id ? chore : c));
      }
      return [chore, ...prev];
    });
    syncSaveChore(chore).catch(console.error);
    triggerPushToast('집안일 저장', `[${chore.title}] 루틴이 등록되었습니다.`, 'complete');
  };

  const handleDeleteChore = (choreId: string) => {
    if (window.confirm('이 공동 집안일 루틴을 삭제하시겠습니까?')) {
      setChores((prev) => prev.filter((c) => c.id !== choreId));
      syncDeleteChore(choreId).catch(console.error);
    }
  };

  // Toggle Completion: Silent haptic + visual confetti
  const handleToggleComplete = (choreId: string) => {
    const target = chores.find((c) => c.id === choreId);
    if (!target) return;

    const nextCompleted = !target.completed;
    let updatedChore: ChoreItem;

    if (nextCompleted) {
      // Visual confetti
      fireCompletionConfetti();

      // Mobile visual push toast
      const performer = PROFILES[activeUser];
      triggerPushToast(
        '집안일 완료! 🎉',
        `${performer.name}님이 [${target.title}]을 완료했습니다. 지속 알림이 해제되었습니다.`,
        'complete'
      );

      // Create notification record
      const notif: AppNotification = {
        id: `notif-${Date.now()}`,
        type: 'chore_completed',
        title: '🎉 집안일 완료 & 알림 해제',
        message: `${performer.name}님이 [${target.title}]을 먼저 완료했습니다! 대기 중이던 알림이 해제되었습니다. 따뜻한 칭찬 카드를 보내보세요 💕`,
        timestamp: new Date().toISOString(),
        recipient: 'both',
        readByWife: activeUser === 'wife',
        readByHusband: activeUser === 'husband',
        relatedChoreId: target.id,
      };
      setNotifications((n) => [notif, ...n]);
      syncSaveNotification(notif).catch(console.error);

      updatedChore = {
        ...target,
        completed: true,
        completedAt: new Date().toISOString(),
        completedBy: activeUser,
      };
    } else {
      updatedChore = {
        ...target,
        completed: false,
        completedAt: undefined,
        completedBy: undefined,
      };
    }

    setChores((prev) => prev.map((c) => (c.id === choreId ? updatedChore : c)));
    syncSaveChore(updatedChore).catch(console.error);
  };

  // Praise Action: Received from options list
  const handleSendPraise = (praise: PraiseRecord) => {
    const target = chores.find((c) => c.id === praise.choreId);
    if (target) {
      const updatedChore = {
        ...target,
        praises: [...(target.praises || []), praise],
      };
      setChores((prev) => prev.map((c) => (c.id === target.id ? updatedChore : c)));
      syncSaveChore(updatedChore).catch(console.error);
    }

    triggerPushToast(
      '칭찬 카드 전송 완료 💌',
      `${PROFILES[praise.recipient].name}님에게 "${praise.message.slice(0, 30)}..." 칭찬을 보냈습니다.`,
      'praise'
    );

    // Create Notification for the praise
    const notif: AppNotification = {
      id: `notif-${Date.now()}`,
      type: 'praise',
      title: '💌 따뜻한 칭찬 카드 도착!',
      message: `${PROFILES[praise.sender].name}님이 칭찬 카드를 보냈어요: "${praise.message}"`,
      timestamp: new Date().toISOString(),
      recipient: 'both',
      readByWife: activeUser === 'wife',
      readByHusband: activeUser === 'husband',
      relatedChoreId: praise.choreId,
    };
    setNotifications((prev) => [notif, ...prev]);
    syncSaveNotification(notif).catch(console.error);
  };

  // Schedule Actions
  const handleSaveSchedule = (event: ScheduleEvent) => {
    setSchedules((prev) => {
      const exists = prev.some((e) => e.id === event.id);
      if (exists) {
        return prev.map((e) => (e.id === event.id ? event : e));
      }
      return [event, ...prev];
    });
    syncSaveSchedule(event).catch(console.error);
    triggerPushToast('일정 등록', `[${event.title}] 일정이 캘린더에 추가되었습니다.`, 'complete');
  };

  const handleDeleteSchedule = (eventId: string) => {
    if (window.confirm('이 일정을 삭제하시겠습니까?')) {
      setSchedules((prev) => prev.filter((e) => e.id !== eventId));
      syncDeleteSchedule(eventId).catch(console.error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        readByWife: activeUser === 'wife' ? true : n.readByWife,
        readByHusband: activeUser === 'husband' ? true : n.readByHusband,
      }))
    );
    syncMarkAllNotificationsRead(activeUser, notifications).catch(console.error);
  };

  const pendingCount = chores.filter((c) => !c.completed).length;
  const alertingCount = chores.filter((c) => !c.completed && isChoreOverdueOrDue(c)).length;
  const unpraisedCount = chores.filter((c) => c.completed && (!c.praises || c.praises.length === 0)).length;

  return (
    <div className="min-h-screen bg-stone-200 sm:bg-stone-300 flex justify-center items-start sm:py-6 text-stone-900 font-sans selection:bg-rose-200">
      {/* Mobile App Device Frame Wrapper */}
      <div 
        id="mobile-app-container"
        className="w-full sm:max-w-md bg-stone-50 min-h-screen sm:min-h-[844px] sm:max-h-[92vh] sm:rounded-[40px] shadow-2xl sm:border-[8px] sm:border-stone-800 flex flex-col overflow-hidden relative"
      >
        {/* Mobile Header */}
        <Header
          activeUser={activeUser}
          onSwitchUser={handleSwitchUser}
          notifications={notifications}
          onOpenNotifications={() => setIsNotifCenterOpen(true)}
          onOpenContinuousAlert={() => setIsContinuousAlertOpen(true)}
          alertingCount={alertingCount}
          onOpenInstallGuide={() => setIsInstallModalOpen(true)}
        />

        {/* In-App Mobile Push Toast Banner (Visual silent notification) */}
        <AnimatePresence>
          {activeToast && (
            <motion.div
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              className="absolute top-20 left-3 right-3 z-50 p-3 rounded-2xl bg-stone-900/95 text-white shadow-xl backdrop-blur-md border border-white/20 flex items-center justify-between gap-2.5"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-2 rounded-xl shrink-0 ${
                  activeToast.type === 'alert' 
                    ? 'bg-rose-500 text-white' 
                    : activeToast.type === 'praise'
                    ? 'bg-pink-500 text-white'
                    : activeToast.type === 'schedule'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-500 text-white'
                }`}>
                  {activeToast.type === 'alert' ? (
                    <BellRing className="w-4 h-4" />
                  ) : activeToast.type === 'praise' ? (
                    <Heart className="w-4 h-4 fill-current" />
                  ) : activeToast.type === 'schedule' ? (
                    <Calendar className="w-4 h-4" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{activeToast.title}</h4>
                  <p className="text-[11px] text-stone-300 line-clamp-1">{activeToast.message}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveToast(null)}
                className="p-1 text-stone-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area (Scrollable Mobile Screen) */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 no-scrollbar">
          {activeTab === 'chores' && (
            <ChoreManager
              chores={chores}
              activeUser={activeUser}
              onAddChore={() => {
                setEditingChore(null);
                setIsChoreModalOpen(true);
              }}
              onEditChore={(chore) => {
                setEditingChore(chore);
                setIsChoreModalOpen(true);
              }}
              onDeleteChore={handleDeleteChore}
              onToggleComplete={handleToggleComplete}
              onOpenPraise={(chore) => {
                setPraisingChore(chore);
                setIsPraiseModalOpen(true);
              }}
              onTriggerAlertModal={() => setIsContinuousAlertOpen(true)}
            />
          )}

          {activeTab === 'schedules' && (
            <ScheduleView
              events={schedules}
              activeUser={activeUser}
              chores={chores}
              onAddEvent={() => {
                setEditingSchedule(null);
                setIsScheduleModalOpen(true);
              }}
              onEditEvent={(event) => {
                setEditingSchedule(event);
                setIsScheduleModalOpen(true);
              }}
              onDeleteEvent={handleDeleteSchedule}
            />
          )}

          {activeTab === 'praises' && (
            <PraiseBoard
              chores={chores}
              activeUser={activeUser}
              onOpenPraise={(chore) => {
                setPraisingChore(chore);
                setIsPraiseModalOpen(true);
              }}
            />
          )}
        </main>

        {/* Mobile Fixed Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pendingCount={pendingCount}
          alertingCount={alertingCount}
          unpraisedCount={unpraisedCount}
        />

        {/* Modals & Bottom Sheets */}
        {/* 1. Chore Modal */}
        <ChoreModal
          isOpen={isChoreModalOpen}
          onClose={() => {
            setIsChoreModalOpen(false);
            setEditingChore(null);
          }}
          onSave={handleSaveChore}
          initialChore={editingChore}
          activeUser={activeUser}
        />

        {/* 2. Schedule Modal */}
        <ScheduleModal
          isOpen={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setEditingSchedule(null);
          }}
          onSave={handleSaveSchedule}
          initialEvent={editingSchedule}
          activeUser={activeUser}
          chores={chores}
        />

        {/* 3. Praise Modal (Options Selection UI) */}
        {praisingChore && (
          <PraiseModal
            isOpen={isPraiseModalOpen}
            onClose={() => {
              setIsPraiseModalOpen(false);
              setPraisingChore(null);
            }}
            chore={praisingChore}
            activeUser={activeUser}
            onSendPraise={handleSendPraise}
          />
        )}

        {/* 4. Continuous Alert Modal (Silent visual prompt until completed) */}
        <NotificationModal
          isOpen={isContinuousAlertOpen}
          onClose={() => setIsContinuousAlertOpen(false)}
          type="continuous_alert"
          chores={chores}
          activeUser={activeUser}
          onQuickComplete={(id) => {
            handleToggleComplete(id);
            const remainingDue = chores.filter((c) => c.id !== id && !c.completed && isChoreOverdueOrDue(c));
            if (remainingDue.length === 0) {
              setIsContinuousAlertOpen(false);
            }
          }}
        />

        {/* 5. Notification Center Drawer */}
        <NotificationCenter
          isOpen={isNotifCenterOpen}
          onClose={() => setIsNotifCenterOpen(false)}
          notifications={notifications}
          activeUser={activeUser}
          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
          onSimulateContinuousAlert={() => setIsContinuousAlertOpen(true)}
        />

        {/* 6. Smartphone PWA Install Guide Modal */}
        <InstallModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />
      </div>
    </div>
  );
}
