import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Clock, Users, Tag, Link2, Bell } from 'lucide-react';
import { ScheduleEvent, ScheduleCategory, PersonId, ChoreItem, ScheduleAlertTiming } from '../types';
import { PROFILES } from '../data/initialData';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: ScheduleEvent) => void;
  initialEvent?: ScheduleEvent | null;
  activeUser: PersonId;
  chores: ChoreItem[];
}

const CATEGORIES: { id: ScheduleCategory; label: string; icon: string; color: string }[] = [
  { id: 'together', label: '부부 함께', icon: '👩🏻‍❤️‍👨🏻', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { id: 'wife', label: '아내 개인', icon: '👩🏻', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { id: 'husband', label: '남편 개인', icon: '👨🏻', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { id: 'family', label: '가족/양가', icon: '👨‍👩‍👧‍👦', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'anniversary', label: '기념일/외식', icon: '🎉', color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

const ALERT_OPTIONS: { id: ScheduleAlertTiming; label: string }[] = [
  { id: 'at_time', label: '정시 알림' },
  { id: '10m_before', label: '10분 전' },
  { id: '30m_before', label: '30분 전' },
  { id: '1h_before', label: '1시간 전' },
  { id: 'morning_9am', label: '당일 아침 9시' },
];

export const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialEvent,
  activeUser,
  chores,
}) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('14:00');
  const [participantMode, setParticipantMode] = useState<'both' | 'wife' | 'husband'>('both');
  const [category, setCategory] = useState<ScheduleCategory>('together');
  const [linkedChoreTitle, setLinkedChoreTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [enableAlert, setEnableAlert] = useState(true);
  const [alertTiming, setAlertTiming] = useState<ScheduleAlertTiming>('30m_before');

  useEffect(() => {
    if (initialEvent) {
      setTitle(initialEvent.title);
      setDate(initialEvent.date);
      setTime(initialEvent.time || '14:00');
      if (initialEvent.participants.length === 2) {
        setParticipantMode('both');
      } else {
        setParticipantMode(initialEvent.participants[0]);
      }
      setCategory(initialEvent.category);
      setLinkedChoreTitle(initialEvent.linkedChoreTitle || '');
      setNotes(initialEvent.notes || '');
      setEnableAlert(initialEvent.enableAlert !== false);
      setAlertTiming(initialEvent.alertTiming || '30m_before');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setTitle('');
      setDate(today);
      setTime('14:00');
      setParticipantMode('both');
      setCategory('together');
      setLinkedChoreTitle('');
      setNotes('');
      setEnableAlert(true);
      setAlertTiming('30m_before');
    }
  }, [initialEvent, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !date) return;

    let participants: PersonId[] = ['wife', 'husband'];
    if (participantMode === 'wife') participants = ['wife'];
    if (participantMode === 'husband') participants = ['husband'];

    const eventData: ScheduleEvent = {
      id: initialEvent ? initialEvent.id : `event-${Date.now()}`,
      title: title.trim(),
      date,
      time: time || undefined,
      participants,
      category,
      linkedChoreTitle: linkedChoreTitle.trim() || undefined,
      notes: notes.trim() || undefined,
      enableAlert,
      alertTiming: enableAlert ? alertTiming : 'none',
    };

    onSave(eventData);
    onClose();
  };

  return (
    <AnimatePresence>
      <div
        id="schedule-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          id="schedule-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/70">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                {initialEvent ? '일정 수정' : '새 일정 등록'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                부부 공동 및 개인 일정을 등록하고 집안일과 연계해요
              </p>
            </div>
            <button
              id="close-schedule-modal-btn"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                일정 이름 <span className="text-rose-500">*</span>
              </label>
              <input
                id="schedule-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 주말 대형마트 장보기, 병원 검진, 시부모님 식사"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:border-rose-500"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  <span>날짜</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>시간 (선택)</span>
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:border-rose-500"
                />
              </div>
            </div>

            {/* Participants */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-stone-500" />
                <span>참석자</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setParticipantMode('both')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    participantMode === 'both'
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  👩🏻👨🏻 둘이 함께
                </button>
                <button
                  type="button"
                  onClick={() => setParticipantMode('wife')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    participantMode === 'wife'
                      ? 'border-rose-500 bg-rose-500 text-white shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  👩🏻 나 (아내)
                </button>
                <button
                  type="button"
                  onClick={() => setParticipantMode('husband')}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                    participantMode === 'husband'
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                      : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  👨🏻 남편
                </button>
              </div>
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-stone-500" />
                <span>분류</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all ${
                      category === cat.id
                        ? 'border-stone-800 bg-stone-100 text-stone-900 ring-1 ring-stone-800'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Linked Chore (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-stone-500" />
                <span>연계 집안일 (선택)</span>
              </label>
              <input
                type="text"
                value={linkedChoreTitle}
                onChange={(e) => setLinkedChoreTitle(e.target.value)}
                placeholder="예: 손님맞이 대청소, 냉장고 비우기 등"
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:border-rose-500"
              />
            </div>

            {/* Schedule Notification Alert Settings */}
            <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5 cursor-pointer">
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                  <span>일정 알림 받기</span>
                </label>
                <button
                  type="button"
                  onClick={() => setEnableAlert(!enableAlert)}
                  className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${
                    enableAlert ? 'bg-amber-500' : 'bg-stone-300'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform ${
                      enableAlert ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {enableAlert && (
                <div className="pt-1.5 border-t border-amber-200/60">
                  <p className="text-[10px] text-amber-800 mb-1.5 font-medium">
                    알림 시점 선택:
                  </p>
                  <div className="grid grid-cols-3 gap-1">
                    {ALERT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAlertTiming(opt.id)}
                        className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all ${
                          alertTiming === opt.id
                            ? 'bg-amber-500 border-amber-600 text-white shadow-2xs'
                            : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100/50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                메모
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="장소, 준비물, 주의사항 등"
                className="w-full text-xs p-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:border-rose-500 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                id="save-schedule-submit-btn"
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl shadow-xs transition-all"
              >
                {initialEvent ? '수정 완료' : '일정 저장'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
