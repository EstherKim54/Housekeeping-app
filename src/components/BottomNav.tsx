import React from 'react';
import { CheckSquare, Calendar, Heart, BellRing } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'chores' | 'schedules' | 'praises';
  onTabChange: (tab: 'chores' | 'schedules' | 'praises') => void;
  pendingCount: number;
  alertingCount: number;
  unpraisedCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  pendingCount,
  alertingCount,
  unpraisedCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-3">
        {/* Tab 1: Chores */}
        <button
          id="mobile-bottom-tab-chores"
          type="button"
          onClick={() => onTabChange('chores')}
          className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-all active:scale-90 ${
            activeTab === 'chores'
              ? 'text-stone-900 font-bold'
              : 'text-stone-400 hover:text-stone-600 font-medium'
          }`}
        >
          <div className="relative">
            <CheckSquare className={`w-5 h-5 ${activeTab === 'chores' ? 'stroke-[2.5]' : ''}`} />
            {alertingCount > 0 ? (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-bounce">
                {alertingCount}
              </span>
            ) : pendingCount > 0 ? (
              <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-stone-700 text-white text-[9px] font-bold flex items-center justify-center">
                {pendingCount}
              </span>
            ) : null}
          </div>
          <span className="text-[11px] mt-1">집안일</span>
          {activeTab === 'chores' && (
            <span className="w-1 h-1 bg-stone-900 rounded-full mt-0.5" />
          )}
        </button>

        {/* Tab 2: Schedules */}
        <button
          id="mobile-bottom-tab-schedules"
          type="button"
          onClick={() => onTabChange('schedules')}
          className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-all active:scale-90 ${
            activeTab === 'schedules'
              ? 'text-stone-900 font-bold'
              : 'text-stone-400 hover:text-stone-600 font-medium'
          }`}
        >
          <div className="relative">
            <Calendar className={`w-5 h-5 ${activeTab === 'schedules' ? 'stroke-[2.5]' : ''}`} />
          </div>
          <span className="text-[11px] mt-1">캘린더</span>
          {activeTab === 'schedules' && (
            <span className="w-1 h-1 bg-stone-900 rounded-full mt-0.5" />
          )}
        </button>

        {/* Tab 3: Praises */}
        <button
          id="mobile-bottom-tab-praises"
          type="button"
          onClick={() => onTabChange('praises')}
          className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-all active:scale-90 ${
            activeTab === 'praises'
              ? 'text-rose-600 font-bold'
              : 'text-stone-400 hover:text-stone-600 font-medium'
          }`}
        >
          <div className="relative">
            <Heart className={`w-5 h-5 ${activeTab === 'praises' ? 'fill-rose-500 text-rose-500 stroke-[2.5]' : ''}`} />
            {unpraisedCount > 0 && (
              <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                {unpraisedCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1">칭찬함</span>
          {activeTab === 'praises' && (
            <span className="w-1 h-1 bg-rose-500 rounded-full mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};
