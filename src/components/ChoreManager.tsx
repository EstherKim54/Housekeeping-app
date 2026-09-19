import React, { useState } from 'react';
import { 
  Plus, 
  CheckCircle2, 
  Heart, 
  Sparkles,
  BellRing,
  Users
} from 'lucide-react';
import { ChoreItem, PersonId } from '../types';
import { PROFILES } from '../data/initialData';
import { ChoreCard } from './ChoreCard';
import { isChoreOverdueOrDue } from '../utils/storage';

interface ChoreManagerProps {
  chores: ChoreItem[];
  activeUser: PersonId;
  onAddChore: () => void;
  onEditChore: (chore: ChoreItem) => void;
  onDeleteChore: (choreId: string) => void;
  onToggleComplete: (choreId: string) => void;
  onOpenPraise: (chore: ChoreItem) => void;
  onTriggerAlertModal: () => void;
}

export const ChoreManager: React.FC<ChoreManagerProps> = ({
  chores,
  activeUser,
  onAddChore,
  onEditChore,
  onDeleteChore,
  onToggleComplete,
  onOpenPraise,
  onTriggerAlertModal,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'alerting' | 'pending' | 'completed' | 'by_me' | 'by_partner'>('all');

  const partnerId: PersonId = activeUser === 'wife' ? 'husband' : 'wife';
  const myProfile = PROFILES[activeUser];
  const partnerProfile = PROFILES[partnerId];

  // Calculations
  const totalChores = chores.length;
  const completedChores = chores.filter((c) => c.completed);
  const pendingChores = chores.filter((c) => !c.completed);
  const completionRate = totalChores > 0 ? Math.round((completedChores.length / totalChores) * 100) : 0;

  // Active alerting chores: Incomplete and due
  const alertingChores = chores.filter((c) => !c.completed && isChoreOverdueOrDue(c));
  const alertingCount = alertingChores.length;

  // Performance breakdown
  const completedByMe = chores.filter((c) => c.completed && c.completedBy === activeUser).length;
  const completedByPartner = chores.filter((c) => c.completed && c.completedBy === partnerId).length;

  // Filtered list
  const filteredChores = chores.filter((chore) => {
    const isAlerting = !chore.completed && isChoreOverdueOrDue(chore);
    if (filterMode === 'alerting' && !isAlerting) return false;
    if (filterMode === 'pending' && chore.completed) return false;
    if (filterMode === 'completed' && !chore.completed) return false;
    if (filterMode === 'by_me' && (!chore.completed || chore.completedBy !== activeUser)) return false;
    if (filterMode === 'by_partner' && (!chore.completed || chore.completedBy !== partnerId)) return false;
    return true;
  });

  // Sort: Active alerting first, then pending, then completed
  filteredChores.sort((a, b) => {
    const aAlerting = !a.completed && isChoreOverdueOrDue(a);
    const bAlerting = !b.completed && isChoreOverdueOrDue(b);
    if (aAlerting && !bAlerting) return -1;
    if (!aAlerting && bAlerting) return 1;
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  return (
    <div className="space-y-4 pb-12">
      {/* Continuous Alert Card (Mobile App Alert Banner) */}
      {alertingCount > 0 && (
        <div 
          onClick={onTriggerAlertModal}
          className="p-4 rounded-3xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 text-white shadow-lg cursor-pointer active:scale-98 transition-all animate-pulse"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5 text-white animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm tracking-tight">
                    🚨 집안일 지속 알림 중
                  </h3>
                  <span className="text-[10px] bg-white/25 px-1.5 py-0.2 rounded-full font-bold">
                    {alertingCount}건
                  </span>
                </div>
                <p className="text-[11px] text-white/90 mt-0.5 line-clamp-1">
                  터치하여 즉시 완료하고 알림을 해제하세요!
                </p>
              </div>
            </div>

            <div className="px-3 py-1.5 bg-white text-rose-700 text-xs font-black rounded-xl shrink-0 shadow-xs">
              확인 ⚡️
            </div>
          </div>
        </div>
      )}

      {/* Mobile Stats Dashboard Card */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
        {/* Top rate */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
            <span className="text-stone-500">오늘의 부부 가사 달성률</span>
            <span className="text-stone-900">{completionRate}%</span>
          </div>
          <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1.5">
            <span>총 {totalChores}개 중 <strong className="text-emerald-700">{completedChores.length}개 완료</strong></span>
            <span>{pendingChores.length}개 남음</span>
          </div>
        </div>

        {/* Mini Couple collaboration split */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100">
          <div className="p-2.5 rounded-2xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-rose-800">👩🏻 {myProfile.name}</div>
              <div className="text-sm font-black text-rose-600">
                {completedByMe}<span className="text-[10px] font-normal text-stone-500 ml-0.5">건</span>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-rose-500">
              {completedChores.length > 0 ? Math.round((completedByMe / completedChores.length) * 100) : 0}%
            </span>
          </div>

          <div className="p-2.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-indigo-800">👨🏻 {partnerProfile.name}</div>
              <div className="text-sm font-black text-indigo-600">
                {completedByPartner}<span className="text-[10px] font-normal text-stone-500 ml-0.5">건</span>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-indigo-500">
              {completedChores.length > 0 ? Math.round((completedByPartner / completedChores.length) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Filter Horizontal Scroll (Mobile Segmented Chips) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => setFilterMode('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
            filterMode === 'all'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200'
          }`}
        >
          전체 ({chores.length})
        </button>

        {alertingCount > 0 && (
          <button
            type="button"
            onClick={() => setFilterMode('alerting')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1 ${
              filterMode === 'alerting'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            <BellRing className="w-3 h-3" />
            <span>알림 대기 ({alertingCount})</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setFilterMode('pending')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
            filterMode === 'pending'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200'
          }`}
        >
          대기 중 ({pendingChores.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterMode('completed')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
            filterMode === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200'
          }`}
        >
          완료됨 ({completedChores.length})
        </button>

        <button
          type="button"
          onClick={() => setFilterMode('by_me')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
            filterMode === 'by_me'
              ? 'bg-rose-500 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200'
          }`}
        >
          내가 완료 ({completedByMe})
        </button>

        <button
          type="button"
          onClick={() => setFilterMode('by_partner')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
            filterMode === 'by_partner'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-stone-600 border border-stone-200'
          }`}
        >
          {partnerProfile.name}가 완료 ({completedByPartner})
        </button>
      </div>

      {/* Chore Item List */}
      {filteredChores.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-dashed border-stone-200 text-center">
          <div className="w-12 h-12 rounded-2xl bg-stone-50 text-stone-400 mx-auto flex items-center justify-center text-2xl mb-2">
            🧹
          </div>
          <h4 className="text-xs font-bold text-stone-800">해당하는 집안일이 없습니다</h4>
          <p className="text-[11px] text-stone-400 mt-0.5">
            새로운 공동 집안일을 등록하거나 필터를 변경해보세요.
          </p>
          <button
            type="button"
            onClick={onAddChore}
            className="mt-3 px-3.5 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>집안일 등록하기</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredChores.map((chore) => {
            const isAlerting = !chore.completed && isChoreOverdueOrDue(chore);
            return (
              <ChoreCard
                key={chore.id}
                chore={chore}
                activeUser={activeUser}
                isAlerting={isAlerting}
                onToggleComplete={onToggleComplete}
                onOpenPraise={onOpenPraise}
                onEdit={onEditChore}
                onDelete={onDeleteChore}
              />
            );
          })}
        </div>
      )}

      {/* Floating Action Button (FAB) for Mobile App Feel */}
      <button
        id="mobile-add-chore-fab"
        type="button"
        onClick={onAddChore}
        className="fixed right-5 bottom-20 z-30 w-12 h-12 rounded-full bg-stone-900 text-white shadow-xl flex items-center justify-center active:scale-90 hover:scale-105 transition-all"
        title="새 공동 집안일 등록"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};
