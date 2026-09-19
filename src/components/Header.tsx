import React from 'react';
import { 
  Home, 
  Bell, 
  BellRing,
  Sparkles,
  Wifi,
  BatteryMedium,
  Smartphone
} from 'lucide-react';
import { PersonId, AppNotification } from '../types';
import { PROFILES } from '../data/initialData';

interface HeaderProps {
  activeUser: PersonId;
  onSwitchUser: (newUser: PersonId) => void;
  notifications: AppNotification[];
  onOpenNotifications: () => void;
  onOpenContinuousAlert: () => void;
  alertingCount: number;
  onOpenInstallGuide: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeUser,
  onSwitchUser,
  notifications,
  onOpenNotifications,
  onOpenContinuousAlert,
  alertingCount,
  onOpenInstallGuide,
}) => {
  const currentProfile = PROFILES[activeUser];
  const partnerId: PersonId = activeUser === 'wife' ? 'husband' : 'wife';
  const partnerProfile = PROFILES[partnerId];

  const isRead = (notif: AppNotification) =>
    activeUser === 'wife' ? notif.readByWife : notif.readByHusband;

  const unreadCount = notifications.filter((n) => !isRead(n)).length;

  // Format current time for status bar
  const now = new Date();
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
      {/* Mobile OS Status Bar Aesthetic */}
      <div className="flex items-center justify-between px-5 pt-2.5 pb-1.5 text-[11px] font-semibold text-stone-600 select-none">
        <span className="tracking-tight font-medium">{timeString}</span>
        <div className="flex items-center gap-1.5 text-stone-500">
          <Wifi className="w-3.5 h-3.5" />
          <span className="text-[10px] tracking-tighter">5G</span>
          <BatteryMedium className="w-4 h-4" />
        </div>
      </div>

      {/* Main Mobile App Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-3">
        {/* App Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-500 text-white flex items-center justify-center shadow-xs">
            <Home className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-black text-stone-900 tracking-tight">
                우리집 공동 가사
              </h1>
            </div>
            <p className="text-[10px] text-stone-400 font-medium">
              함께 챙기는 부부 모바일 앱
            </p>
          </div>
        </div>

        {/* Right action controls: Alert indicator + Notification Bell */}
        <div className="flex items-center gap-2">
          {/* Continuous alert pill badge */}
          {alertingCount > 0 && (
            <button
              type="button"
              onClick={onOpenContinuousAlert}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500 text-white text-[11px] font-bold shadow-xs active:scale-95 transition-all animate-pulse"
              title="누구든 완료할 때까지 알림 중"
            >
              <BellRing className="w-3 h-3 text-white" />
              <span>{alertingCount}건 대기</span>
            </button>
          )}

          {/* Smartphone PWA Open / Install Guide Button */}
          <button
            id="open-install-guide-btn"
            type="button"
            onClick={onOpenInstallGuide}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-100/90 text-amber-900 hover:bg-amber-200/90 text-[11px] font-bold transition-all active:scale-90 border border-amber-300/80 shadow-2xs"
            title="스마트폰으로 앱 열기 & 홈 화면 설치 가이드"
          >
            <Smartphone className="w-3.5 h-3.5 text-amber-700" />
            <span>앱으로 열기</span>
          </button>

          {/* Notification Bell */}
          <button
            id="open-notif-center-btn"
            type="button"
            onClick={onOpenNotifications}
            className="relative p-2 text-stone-600 hover:text-stone-900 active:scale-90 bg-stone-100/80 rounded-full transition-all"
            title="알림 센터"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* User Switcher Pill Bar (Fast toggle between Wife / Husband on mobile) */}
      <div className="px-4 pb-2.5 pt-0.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-stone-400 font-medium">현재 사용자:</span>
          <span className="text-[11px] font-bold text-stone-800 flex items-center gap-1">
            <span>{currentProfile.name}</span>
            <span className="text-[10px] text-stone-400">(파트너: {partnerProfile.name})</span>
          </span>
        </div>

        {/* Segmented Switcher */}
        <div className="bg-stone-100 p-0.5 rounded-full flex items-center border border-stone-200/60 shadow-2xs">
          <button
            id="mobile-switch-wife-btn"
            type="button"
            onClick={() => onSwitchUser('wife')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
              activeUser === 'wife'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            👩🏻 아내
          </button>
          <button
            id="mobile-switch-husband-btn"
            type="button"
            onClick={() => onSwitchUser('husband')}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
              activeUser === 'husband'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            👨🏻 남편
          </button>
        </div>
      </div>
    </header>
  );
};
