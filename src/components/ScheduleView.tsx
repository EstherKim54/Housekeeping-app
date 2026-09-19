import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Users, 
  Link2, 
  Edit3, 
  Trash2,
  Bell,
  BellRing,
  CalendarDays,
  ListFilter,
  CheckCircle2,
  Sparkles,
  MapPin
} from 'lucide-react';
import { ScheduleEvent, PersonId, ChoreItem } from '../types';
import { PROFILES } from '../data/initialData';

interface ScheduleViewProps {
  events: ScheduleEvent[];
  activeUser: PersonId;
  chores: ChoreItem[];
  onAddEvent: () => void;
  onEditEvent: (event: ScheduleEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

const DAYS_OF_WEEK = ['일', '월', '화', '수', '목', '금', '토'];

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  events,
  activeUser,
  chores,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
}) => {
  // Current view mode: 'month' (Expanded Month) | 'agenda' (Clean List)
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  // Month navigation: default to current month of metadata (Sep 2026)
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 8, 1));
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-09-18');
  const [participantFilter, setParticipantFilter] = useState<'all' | 'together' | 'wife' | 'husband'>('all');

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const setToday = () => {
    const today = new Date();
    // Default to Sep 2026 if today is outside
    const todayStr = '2026-09-18';
    setCurrentMonth(new Date(2026, 8, 1));
    setSelectedDateStr(todayStr);
  };

  // Generate calendar days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    calendarCells.push({ day: d, dateStr });
  }

  // Filter events
  const filteredEvents = events.filter((e) => {
    if (participantFilter === 'together') return e.participants.length === 2;
    if (participantFilter === 'wife') return e.participants.includes('wife') && e.participants.length === 1;
    if (participantFilter === 'husband') return e.participants.includes('husband') && e.participants.length === 1;
    return true;
  });

  // Selected date's events
  const selectedDateEvents = filteredEvents.filter((e) => e.date === selectedDateStr);

  // Selected date formatted: e.g. "9월 18일 (금)"
  const formatSelectedDateHeading = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    const dayOfWeek = DAYS_OF_WEEK[d.getDay()];
    return `${Number(parts[1])}월 ${Number(parts[2])}일 (${dayOfWeek})`;
  };

  // Helper to format alert timing label
  const getAlertLabel = (timing?: string) => {
    switch (timing) {
      case 'at_time':
        return '시작 정시 알림';
      case '10m_before':
        return '10분 전 알림';
      case '30m_before':
        return '30분 전 알림';
      case '1h_before':
        return '1시간 전 알림';
      case 'morning_9am':
        return '당일 09:00 알림';
      default:
        return '알림 켜짐';
    }
  };

  return (
    <div className="space-y-3 pb-16">
      {/* Top Header Card: Month selector & View Switcher */}
      <div className="bg-white p-3.5 rounded-3xl border border-stone-200/90 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          {/* Month Switcher */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-2 text-stone-600 hover:bg-stone-100 rounded-xl transition-all active:scale-90"
              aria-label="이전 달"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-black text-stone-900 px-1 tracking-tight">
              {year}년 {month + 1}월
            </h2>
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 text-stone-600 hover:bg-stone-100 rounded-xl transition-all active:scale-90"
              aria-label="다음 달"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Action: Today & Add Button */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={setToday}
              className="text-xs px-2.5 py-1.5 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold transition-all active:scale-95"
            >
              오늘
            </button>

            {/* View Mode Switcher: Month vs List */}
            <div className="bg-stone-100 p-0.5 rounded-xl flex items-center border border-stone-200/60">
              <button
                type="button"
                onClick={() => setViewMode('month')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'month'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-400'
                }`}
                title="월간 달력 보기"
              >
                <CalendarDays className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('agenda')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'agenda'
                    ? 'bg-white text-stone-900 shadow-2xs'
                    : 'text-stone-400'
                }`}
                title="목록 보기"
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>

            <button
              id="add-schedule-btn"
              type="button"
              onClick={onAddEvent}
              className="flex items-center gap-1 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-xs shrink-0 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>등록</span>
            </button>
          </div>
        </div>

        {/* Filter chips: All, Couple, Wife, Husband */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-stone-100">
          <button
            type="button"
            onClick={() => setParticipantFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              participantFilter === 'all'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            전체 ({events.length})
          </button>
          <button
            type="button"
            onClick={() => setParticipantFilter('together')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              participantFilter === 'together'
                ? 'bg-rose-500 text-white shadow-2xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            부부 함께 👩🏻‍❤️‍👨🏻
          </button>
          <button
            type="button"
            onClick={() => setParticipantFilter('wife')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              participantFilter === 'wife'
                ? 'bg-pink-500 text-white shadow-2xs'
                : 'bg-pink-50 text-pink-700 hover:bg-pink-100'
            }`}
          >
            아내 👩🏻
          </button>
          <button
            type="button"
            onClick={() => setParticipantFilter('husband')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
              participantFilter === 'husband'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            남편 👨🏻
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: Month Calendar (Enhanced Size & Visual Clues) */}
      {viewMode === 'month' && (
        <div className="bg-white p-3 sm:p-4 rounded-3xl border border-stone-200/90 shadow-2xs">
          {/* Day of Week Headers with High Visibility */}
          <div className="grid grid-cols-7 mb-1.5 text-center">
            {DAYS_OF_WEEK.map((day, idx) => (
              <div
                key={day}
                className={`text-xs font-black py-1 ${
                  idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-blue-500' : 'text-stone-500'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Day Cells (Enlarged and optimized for mobile thumbs) */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => {
              if (!cell) {
                return (
                  <div 
                    key={`empty-${idx}`} 
                    className="min-h-[52px] sm:min-h-[64px] rounded-xl bg-stone-50/40" 
                  />
                );
              }

              const isSelected = cell.dateStr === selectedDateStr;
              const isToday = cell.dateStr === '2026-09-18';
              const dateEvents = filteredEvents.filter((e) => e.date === cell.dateStr);
              const hasAlert = dateEvents.some((e) => e.enableAlert);

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[52px] sm:min-h-[64px] p-1 sm:p-1.5 rounded-2xl text-left flex flex-col justify-between transition-all relative ${
                    isSelected
                      ? 'bg-stone-900 text-white shadow-md ring-2 ring-stone-900/30 z-10 scale-[1.02]'
                      : isToday
                      ? 'bg-rose-50/80 border border-rose-200/80 text-stone-900'
                      : 'hover:bg-stone-50 text-stone-800 border border-stone-100/80'
                  }`}
                >
                  {/* Day Number Header */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        isSelected
                          ? 'bg-white text-stone-900 font-black'
                          : isToday
                          ? 'bg-rose-500 text-white font-black'
                          : 'text-stone-800'
                      }`}
                    >
                      {cell.day}
                    </span>

                    {/* Alert Icon Indicator if any event has active alert */}
                    {hasAlert && (
                      <Bell
                        className={`w-2.5 h-2.5 ${
                          isSelected ? 'text-amber-300' : 'text-amber-500'
                        }`}
                      />
                    )}
                  </div>

                  {/* Visual Event Pills on cell */}
                  <div className="w-full mt-auto space-y-0.5">
                    {dateEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[9px] font-bold px-1 py-0.5 rounded-md truncate leading-tight ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : ev.participants.length === 2
                            ? 'bg-rose-100 text-rose-800'
                            : ev.participants.includes('wife')
                            ? 'bg-pink-100 text-pink-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {ev.title.replace(/[^\w\sㄱ-힣]/g, '') || ev.title}
                      </div>
                    ))}
                    {dateEvents.length > 2 && (
                      <div className={`text-[8px] font-bold text-center leading-none ${
                        isSelected ? 'text-stone-300' : 'text-stone-400'
                      }`}>
                        +{dateEvents.length - 2}개 더보기
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Day Agenda Box: Intuitive Mobile Schedule Cards */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200/90 shadow-2xs space-y-3">
        {/* Date Title & Add on this date */}
        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center font-black text-xs shadow-2xs">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900">
                {formatSelectedDateHeading(selectedDateStr)}
              </h3>
              <p className="text-[11px] text-stone-400 font-medium">
                총 {selectedDateEvents.length}개의 일정이 등록되어 있어요
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onAddEvent}
            className="text-xs px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl transition-all flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>이 날짜에 추가</span>
          </button>
        </div>

        {/* Schedule List */}
        {selectedDateEvents.length === 0 ? (
          <div className="py-8 text-center bg-stone-50/70 rounded-2xl border border-dashed border-stone-200/80">
            <p className="text-xs font-bold text-stone-500">
              등록된 일정이 없습니다.
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              외식, 병원, 장보기, 모임 일정을 추가해보세요!
            </p>
            <button
              type="button"
              onClick={onAddEvent}
              className="mt-3 px-3.5 py-1.5 bg-white border border-stone-300 hover:border-stone-400 rounded-xl text-xs font-bold text-stone-700 shadow-2xs inline-flex items-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-stone-500" />
              <span>새 일정 만들기</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {selectedDateEvents.map((ev) => {
              const isCouple = ev.participants.length === 2;
              const hasWife = ev.participants.includes('wife');

              return (
                <div
                  key={ev.id}
                  className="p-3.5 rounded-2xl bg-stone-50/90 border border-stone-200/80 hover:border-stone-300 transition-all space-y-2 shadow-2xs"
                >
                  {/* Top Bar: Category badge, Alert pill, & Action buttons */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Participant Badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isCouple
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : hasWife
                            ? 'bg-pink-100 text-pink-800 border border-pink-200'
                            : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        }`}
                      >
                        {isCouple ? '부부 함께 👩🏻👨🏻' : hasWife ? '아내 👩🏻' : '남편 👨🏻'}
                      </span>

                      {/* Alert Status Pill */}
                      {ev.enableAlert ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/80 flex items-center gap-1">
                          <Bell className="w-2.5 h-2.5 text-amber-700 fill-amber-700" />
                          <span>{getAlertLabel(ev.alertTiming)}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400 font-medium px-1.5 py-0.5 rounded-md bg-stone-200/60">
                          알림 없음
                        </span>
                      )}
                    </div>

                    {/* Edit & Delete Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEditEvent(ev)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteEvent(ev.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Time */}
                  <div>
                    <h4 className="text-sm font-black text-stone-900">
                      {ev.title}
                    </h4>
                    {ev.time && (
                      <div className="flex items-center gap-1 text-xs font-semibold text-rose-600 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>시간: {ev.time}</span>
                      </div>
                    )}
                  </div>

                  {/* Linked Chore info if exists */}
                  {ev.linkedChoreTitle && (
                    <div className="p-2 rounded-xl bg-rose-50/80 border border-rose-200/60 text-xs text-rose-900 flex items-center gap-1.5 font-medium">
                      <Link2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">연계 집안일: <strong>{ev.linkedChoreTitle}</strong></span>
                    </div>
                  )}

                  {/* Notes */}
                  {ev.notes && (
                    <p className="text-xs text-stone-600 bg-white p-2.5 rounded-xl border border-stone-200/60 leading-relaxed">
                      {ev.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* VIEW MODE 2: Full Upcoming Agenda List (for users preferring list flow) */}
      {viewMode === 'agenda' && (
        <div className="bg-white p-4 rounded-3xl border border-stone-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <h3 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
              <span>다가오는 온이네 일정 순서</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </h3>
            <span className="text-xs font-bold text-stone-400">
              총 {filteredEvents.length}개
            </span>
          </div>

          <div className="space-y-2.5">
            {filteredEvents
              .slice()
              .sort((a, b) => (a.date > b.date ? 1 : -1))
              .map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => {
                    setSelectedDateStr(ev.date);
                    setViewMode('month');
                  }}
                  className="p-3 rounded-2xl border border-stone-200 hover:border-stone-400 bg-stone-50/70 hover:bg-stone-50 cursor-pointer transition-all space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3 text-rose-500" />
                      <span>{ev.date}</span>
                      {ev.time && <span className="text-rose-600 font-semibold">({ev.time})</span>}
                    </span>
                    {ev.enableAlert && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Bell className="w-2.5 h-2.5" />
                        <span>알림</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-stone-900">{ev.title}</h4>
                  {ev.notes && (
                    <p className="text-[11px] text-stone-500 truncate">{ev.notes}</p>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
