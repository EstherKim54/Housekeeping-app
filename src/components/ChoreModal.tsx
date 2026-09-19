import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, Calendar, BellRing, Users } from 'lucide-react';
import { ChoreItem, ChoreCategory, RoutineFrequency, TimeSlot, PersonId } from '../types';

interface ChoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (chore: ChoreItem) => void;
  initialChore?: ChoreItem | null;
  activeUser: PersonId;
}

const CATEGORIES: { id: ChoreCategory; label: string; icon: string }[] = [
  { id: 'kitchen', label: '주방/설거지', icon: '🍳' },
  { id: 'cleaning', label: '청소/정리', icon: '🧹' },
  { id: 'trash', label: '분리수거/쓰레기', icon: '♻️' },
  { id: 'laundry', label: '빨래/건조', icon: '🧺' },
  { id: 'grocery', label: '장보기/비품', icon: '🛒' },
  { id: 'pet_plant', label: '식물/반려', icon: '🪴' },
  { id: 'other', label: '기타 가사', icon: '✨' },
];

const TIME_PRESETS = [
  { label: '아침 08:00', time: '08:00' },
  { label: '점심 12:30', time: '12:30' },
  { label: '퇴근 후 19:00', time: '19:00' },
  { label: '저녁 20:30', time: '20:30' },
  { label: '취침 전 22:00', time: '22:00' },
];

export const ChoreModal: React.FC<ChoreModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialChore,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ChoreCategory>('kitchen');
  const [targetTime, setTargetTime] = useState('19:00');
  const [frequency, setFrequency] = useState<RoutineFrequency>('daily');
  const [timeSlot, setTimeSlot] = useState<TimeSlot>('evening');
  const [estimatedMinutes, setEstimatedMinutes] = useState(15);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialChore) {
      setTitle(initialChore.title);
      setCategory(initialChore.category);
      setTargetTime(initialChore.targetTime || '19:00');
      setFrequency(initialChore.frequency);
      setTimeSlot(initialChore.timeSlot);
      setEstimatedMinutes(initialChore.estimatedMinutes);
      setNotes(initialChore.notes || '');
    } else {
      setTitle('');
      setCategory('kitchen');
      setTargetTime('19:00');
      setFrequency('daily');
      setTimeSlot('evening');
      setEstimatedMinutes(15);
      setNotes('');
    }
  }, [initialChore, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Infer timeSlot from targetTime
    const [h] = targetTime.split(':').map(Number);
    let inferredSlot: TimeSlot = 'evening';
    if (h < 12) inferredSlot = 'morning';
    else if (h < 18) inferredSlot = 'afternoon';
    else inferredSlot = 'evening';

    const choreData: ChoreItem = {
      id: initialChore ? initialChore.id : `chore-${Date.now()}`,
      title: title.trim(),
      category,
      frequency,
      timeSlot: inferredSlot,
      targetTime: targetTime || '19:00',
      estimatedMinutes: Number(estimatedMinutes) || 15,
      notes: notes.trim() || undefined,
      completed: initialChore ? initialChore.completed : false,
      completedAt: initialChore?.completedAt,
      completedBy: initialChore?.completedBy,
      praises: initialChore?.praises || [],
    };

    onSave(choreData);
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        id="chore-modal-overlay" 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          id="chore-modal-card"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
            <div>
              <h3 className="text-base font-bold text-stone-900">
                {initialChore ? '집안일 루틴 수정' : '새 공동 집안일 등록'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                할당 없이 누구든 수행할 때까지 지속 알림이 제공됩니다
              </p>
            </div>
            <button
              id="close-chore-modal-btn"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto">
            {/* Guidance banner */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
              <div className="p-1 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                <Users className="w-4 h-4" />
              </div>
              <div className="leading-relaxed">
                <span className="font-bold">부부 공동 가사 룰:</span> 특정인에게 지정하지 않고, 예정 시간이 되면 둘 중 <strong>누구든 완료할 때까지 계속 알림</strong>이 전송됩니다.
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                집안일 이름 <span className="text-rose-500">*</span>
              </label>
              <input
                id="chore-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 저녁 설거지, 분리수거 배출, 빨래 개기..."
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                카테고리
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all ${
                      category === cat.id
                        ? 'border-rose-500 bg-rose-50 text-rose-800 font-semibold shadow-xs'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <span className="text-lg mb-0.5">{cat.icon}</span>
                    <span className="text-[11px] leading-tight whitespace-nowrap">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Alert Time Setting */}
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-2.5">
              <label className="block text-xs font-bold text-stone-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <BellRing className="w-3.5 h-3.5 text-rose-500" />
                  <span>알림 시작 예정 시각</span>
                </span>
                <span className="text-[11px] font-normal text-stone-500">완료 전까지 지속 알림</span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="time"
                  required
                  value={targetTime}
                  onChange={(e) => setTargetTime(e.target.value)}
                  className="px-3 py-2 bg-white text-sm font-bold border border-stone-300 rounded-xl focus:border-rose-500 focus:outline-hidden"
                />
                <span className="text-xs text-stone-500">
                  이 시각부터 누군가 완료할 때까지 반복 알림
                </span>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[11px] text-stone-400">추천:</span>
                {TIME_PRESETS.map((p) => (
                  <button
                    key={p.time}
                    type="button"
                    onClick={() => setTargetTime(p.time)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors ${
                      targetTime === p.time
                        ? 'bg-rose-500 text-white border-rose-500 font-bold shadow-xs'
                        : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Routine Frequency & Estimated Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  <span>반복 주기</span>
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as RoutineFrequency)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:border-rose-500"
                >
                  <option value="daily">매일 (Daily)</option>
                  <option value="weekdays">평일만 (월~금)</option>
                  <option value="weekends">주말만 (토/일)</option>
                  <option value="weekly">주 1회</option>
                  <option value="custom">격일 / 수시</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>예상 소요 시간</span>
                </label>
                <div className="flex items-center gap-1.5">
                  {[5, 15, 30, 45].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setEstimatedMinutes(mins)}
                      className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        estimatedMinutes === mins
                          ? 'border-stone-800 bg-stone-800 text-white'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      {mins}분
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                메모 / 유의사항
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="예: 식기세척기 돌린 후 문 열어두기, 분리수거 비닐 꼭 묶기"
                className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:border-rose-500"
              />
            </div>

            {/* Submit */}
            <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl transition-colors"
              >
                취소
              </button>
              <button
                id="save-chore-submit-btn"
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 active:scale-98 rounded-xl shadow-sm transition-all"
              >
                {initialChore ? '수정 완료' : '공동 집안일 등록'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
