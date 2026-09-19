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
  CalendarCheck
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
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 8, 1)); // September 2026 based on metadata time
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-09-19');
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
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDateStr(today.toISOString().split('T')[0]);
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

  const selectedDateEvents = filteredEvents.filter((e) => e.date === selectedDateStr);

  return (
    <div className="space-y-4 pb-12">
      {/* Top Controls */}
      <div className="flex flex-col gap-2.5 bg-white p-3.5 rounded-3xl border border-stone-200 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-xl transition-colors active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-black text-stone-900 min-w-28 text-center">
              {year}년 {month + 1}월
            </h2>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-xl transition-colors active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={setToday}
              className="text-[11px] px-2.5 py-1 text-stone-600 hover:bg-stone-100 border border-stone-200 rounded-xl transition-colors font-semibold"
            >
              오늘
            </button>
            <button
              id="add-schedule-btn"
              type="button"
              onClick={onAddEvent}
              className="flex items-center gap-1 px-3 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold shadow-xs shrink-0 transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>일정</span>
            </button>
          </div>
        </div>

        {/* Filter chips horizontal */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-1 border-t border-stone-100">
          <button
            type="button"
            onClick={() => setParticipantFilter('all')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              participantFilter === 'all'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-500'
            }`}
          >
            전체 일정
          </button>
          <button
            type="button"
            onClick={() => setParticipantFilter('together')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              participantFilter === 'together'
                ? 'bg-rose-500 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-500'
            }`}
          >
            함께 👩🏻👨🏻
          </button>
          <button
            type="button"
            onClick={() => setParticipantFilter('wife')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              participantFilter === 'wife'
                ? 'bg-rose-500 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-500'
            }`}
          >
            아내 👩🏻
          </button>
          <button
            type="button"
            onClick={() => setParticipantFilter('husband')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              participantFilter === 'husband'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-stone-100 text-stone-500'
            }`}
          >
            남편 👨🏻
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-3xl border border-stone-200 shadow-xs">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 mb-2 text-center">
            {DAYS_OF_WEEK.map((day, idx) => (
              <div
                key={day}
                className={`text-xs font-semibold py-1.5 ${
                  idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-blue-500' : 'text-stone-400'
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarCells.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-14 sm:h-18 rounded-xl bg-stone-50/40" />;
              }

              const isSelected = cell.dateStr === selectedDateStr;
              const dateEvents = filteredEvents.filter((e) => e.date === cell.dateStr);

              return (
                <button
                  key={cell.dateStr}
                  type="button"
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`h-14 sm:h-18 p-1.5 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'border-stone-900 bg-stone-900 text-white shadow-sm ring-2 ring-stone-900/20'
                      : 'border-stone-100 hover:border-stone-200 hover:bg-stone-50 text-stone-800'
                  }`}
                >
                  <span className={`text-xs font-semibold ${
                    isSelected ? 'text-white' : 'text-stone-700'
                  }`}>
                    {cell.day}
                  </span>

                  {/* Event indicators */}
                  <div className="flex flex-wrap gap-1 mt-auto">
                    {dateEvents.slice(0, 3).map((ev) => (
                      <span
                        key={ev.id}
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected
                            ? 'bg-rose-400'
                            : ev.participants.length === 2
                            ? 'bg-rose-500'
                            : ev.participants.includes('wife')
                            ? 'bg-pink-400'
                            : 'bg-indigo-500'
                        }`}
                        title={ev.title}
                      />
                    ))}
                    {dateEvents.length > 3 && (
                      <span className={`text-[9px] leading-none ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                        +{dateEvents.length - 3}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Details Panel: Selected Date's Events + Upcoming List */}
        <div className="lg:col-span-5 space-y-4">
          {/* Selected Date Box */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-3">
              <div>
                <span className="text-[11px] font-semibold text-rose-600">선택한 날짜</span>
                <h3 className="text-base font-bold text-stone-900">
                  {selectedDateStr}
                </h3>
              </div>
              <button
                type="button"
                onClick={onAddEvent}
                className="text-xs px-2.5 py-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>이 날짜에 추가</span>
              </button>
            </div>

            {selectedDateEvents.length === 0 ? (
              <div className="py-8 text-center text-stone-400">
                <CalendarCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs">등록된 일정이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDateEvents.map((event) => {
                  const isBoth = event.participants.length === 2;
                  return (
                    <div
                      key={event.id}
                      className="p-3 rounded-2xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                              isBoth
                                ? 'bg-rose-100 text-rose-800'
                                : event.participants.includes('wife')
                                ? 'bg-pink-100 text-pink-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}>
                              {isBoth ? '👩🏻👨🏻 둘이 함께' : PROFILES[event.participants[0]].name}
                            </span>
                            {event.time && (
                              <span className="text-[11px] text-stone-500 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-stone-400" />
                                <span>{event.time}</span>
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-stone-900">{event.title}</h4>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onEditEvent(event)}
                            className="p-1 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-white"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteEvent(event.id)}
                            className="p-1 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Linked Chore info */}
                      {event.linkedChoreTitle && (
                        <div className="mt-2 text-xs text-stone-600 bg-white p-2 rounded-xl border border-stone-200/80 flex items-center gap-1.5">
                          <Link2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span className="text-stone-400">연계 가사:</span>
                          <span className="font-semibold text-stone-800 truncate">{event.linkedChoreTitle}</span>
                        </div>
                      )}

                      {event.notes && (
                        <p className="text-xs text-stone-500 mt-1.5 pl-1">
                          {event.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Upcoming Schedule Preview List */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-xs">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-3">
              다가오는 주요 일정
            </h3>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {events.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedDateStr(item.date)}
                  className="p-2.5 rounded-xl hover:bg-stone-50 cursor-pointer transition-colors flex items-center justify-between border border-transparent hover:border-stone-200"
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-stone-900 truncate">{item.title}</div>
                    <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                      <span>{item.date}</span>
                      {item.time && <span>• {item.time}</span>}
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                    item.participants.length === 2
                      ? 'bg-rose-50 text-rose-700'
                      : item.participants.includes('wife')
                      ? 'bg-pink-50 text-pink-700'
                      : 'bg-indigo-50 text-indigo-700'
                  }`}>
                    {item.participants.length === 2 ? '함께' : PROFILES[item.participants[0]].role}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
