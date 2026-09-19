import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Sparkles, Send, Check } from 'lucide-react';
import { ChoreItem, PersonId, PraiseRecord } from '../types';
import { PROFILES } from '../data/initialData';
import { firePraiseConfetti } from '../utils/confetti';

interface PraiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  chore: ChoreItem;
  activeUser: PersonId;
  onSendPraise: (praise: PraiseRecord) => void;
}

interface PraiseOption {
  id: string;
  category: 'thanks' | 'healing' | 'love' | 'cheer';
  sticker: string;
  title: string;
  message: string;
}

const CATEGORY_TABS = [
  { id: 'all', label: '전체' },
  { id: 'thanks', label: '감동 & 감사 💕' },
  { id: 'healing', label: '힐링 & 보답 ☕️' },
  { id: 'love', label: '센스 & 칭찬 👑' },
  { id: 'cheer', label: '토닥토닥 🌸' },
];

const PRAISE_OPTIONS: PraiseOption[] = [
  // 감동 & 감사
  {
    id: 't1',
    category: 'thanks',
    sticker: '💖',
    title: '집이 반짝반짝',
    message: '여보 덕분에 집이 반짝반짝해졌어요! 항상 먼저 챙겨줘서 너무 고마워요 ✨',
  },
  {
    id: 't2',
    category: 'thanks',
    sticker: '🥺',
    title: '완전 든든해',
    message: '퇴근하고 힘들었을 텐데 먼저 끝내줘서 너무 든든하고 감동이에요 💕',
  },
  {
    id: 't3',
    category: 'thanks',
    sticker: '👍',
    title: '말 안 해도 척척',
    message: '말하지 않아도 먼저 알아서 챙겨주는 당신은 최고의 라이프 파트너! 최고야 👍',
  },
  {
    id: 't4',
    category: 'thanks',
    sticker: '💐',
    title: '항상 고마운 마음',
    message: '작은 집안일 하나도 함께 아껴주고 배려해줘서 진심으로 고마워요 💐',
  },

  // 힐링 & 보답
  {
    id: 'h1',
    category: 'healing',
    sticker: '💆‍♂️',
    title: '소파에서 푹 쉬기',
    message: '수고 많았어요! 이제 소파에서 편하게 누워있어요, 시원하게 안마해줄게요 💆',
  },
  {
    id: 'h2',
    category: 'healing',
    sticker: '🍲',
    title: '오늘 저녁은 특식',
    message: '먼저 집안일 해줬으니, 오늘 저녁은 여보가 제일 좋아하는 특식 만들어줄게요 🍲',
  },
  {
    id: 'h3',
    category: 'healing',
    sticker: '☕️',
    title: '모닝 커피 예약',
    message: '당신의 다정함에 보답하는 마음으로, 내일 아침 맛있는 핸드드립 커피 내려줄게 ☕️',
  },
  {
    id: 'h4',
    category: 'healing',
    sticker: '🍰',
    title: '주말 디저트 쏘기',
    message: '이번 주말엔 당신 가고 싶었던 카페에서 맛있는 디저트 풀코스로 쏠게요 🍰',
  },

  // 센스 & 칭찬
  {
    id: 'l1',
    category: 'love',
    sticker: '⚡️',
    title: '집안일 마스터',
    message: '손이 왜 이렇게 빨라요? 순식간에 끝내버리는 집안일 마스터 등장 ⚡️',
  },
  {
    id: 'l2',
    category: 'love',
    sticker: '🧚‍♀️',
    title: '우렁각시 인정',
    message: '눈 깜짝할 사이에 다 되어있네! 우리 집에 우렁각시가 살고 있었군요 🧚‍♀️',
  },
  {
    id: 'l3',
    category: 'love',
    sticker: '🏆',
    title: '오늘의 가사 MVP',
    message: '오늘 우리 집 가사 어워즈 대상은 당신에게 수여합니다! 1등 남편/아내 🏆',
  },
  {
    id: 'l4',
    category: 'love',
    sticker: '🙆‍♀️',
    title: '역시 내 반쪽',
    message: '내가 제일 사랑하고 존경하는 사람! 오늘도 덕분에 웃으며 하루를 마무리해요 🙆',
  },

  // 토닥토닥 & 소소한 응원
  {
    id: 'c1',
    category: 'cheer',
    sticker: '🔋',
    title: '에너지 완충!',
    message: '오늘 하루도 수고 많았어요! 따뜻한 포옹으로 에너지 100% 충전해요 🔋',
  },
  {
    id: 'c2',
    category: 'cheer',
    sticker: '🌸',
    title: '함께라서 행복해',
    message: '둘이 함께 가꾸는 우리 집이라 매일매일이 더 따뜻하고 소중해요 🌸',
  },
];

export const PraiseModal: React.FC<PraiseModalProps> = ({
  isOpen,
  onClose,
  chore,
  activeUser,
  onSendPraise,
}) => {
  const targetRecipient: PersonId = chore.completedBy 
    ? (chore.completedBy === activeUser ? (activeUser === 'wife' ? 'husband' : 'wife') : chore.completedBy)
    : (activeUser === 'wife' ? 'husband' : 'wife');

  const senderProfile = PROFILES[activeUser];
  const recipientProfile = PROFILES[targetRecipient];

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedOptionId, setSelectedOptionId] = useState<string>(PRAISE_OPTIONS[0].id);

  if (!isOpen) return null;

  const filteredOptions = activeCategory === 'all'
    ? PRAISE_OPTIONS
    : PRAISE_OPTIONS.filter((o) => o.category === activeCategory);

  const selectedOption = PRAISE_OPTIONS.find((o) => o.id === selectedOptionId) || PRAISE_OPTIONS[0];

  const handleSend = () => {
    const newPraise: PraiseRecord = {
      id: `praise-${Date.now()}`,
      choreId: chore.id,
      choreTitle: chore.title,
      sender: activeUser,
      recipient: targetRecipient,
      sticker: selectedOption.sticker,
      message: selectedOption.message,
      createdAt: new Date().toISOString(),
    };

    firePraiseConfetti();
    onSendPraise(newPraise);
    onClose();
  };

  return (
    <AnimatePresence>
      <div 
        id="praise-modal-overlay" 
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          id="praise-modal-card"
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[88vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Handle indicator */}
          <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-2.5 sm:hidden" />

          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-xs">
                <Heart className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h3 className="text-base font-black text-stone-900">
                  칭찬 카드 보내기
                </h3>
                <p className="text-[11px] text-stone-500">
                  메시지를 직접 입력할 필요 없이 탭해서 바로 전송하세요
                </p>
              </div>
            </div>
            <button
              id="close-praise-modal-btn"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chore & Recipient Info Tag */}
          <div className="px-4 py-3 bg-stone-50 border-b border-stone-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate">
              <span className="text-stone-400">집안일:</span>
              <span className="font-bold text-stone-800 truncate">{chore.title}</span>
            </div>
            <div className="shrink-0 flex items-center gap-1">
              <span className="text-stone-500 text-[11px]">{senderProfile.name}</span>
              <span className="text-rose-400 font-bold">👉</span>
              <span className="font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full text-[11px]">
                {recipientProfile.name}
              </span>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="px-4 pt-3 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-stone-100">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                  activeCategory === tab.id
                    ? 'bg-rose-500 text-white shadow-xs scale-102'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Options Selection List (Mobile optimized tap cards) */}
          <div className="p-4 overflow-y-auto space-y-2.5 flex-1 max-h-[46vh]">
            <div className="text-[11px] font-bold text-stone-500 flex items-center justify-between px-1">
              <span>보낼 칭찬 메시지 선택 ({filteredOptions.length}개)</span>
              <span className="text-rose-600">원하는 카드를 터치하세요</span>
            </div>

            {filteredOptions.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setSelectedOptionId(opt.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all active:scale-98 flex items-start gap-3 ${
                    isSelected
                      ? 'bg-rose-50/80 border-rose-400 shadow-sm ring-2 ring-rose-200'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <span className="text-2xl p-1.5 bg-stone-100/70 rounded-xl shrink-0">
                    {opt.sticker}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs font-bold text-stone-900">{opt.title}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed break-keep">
                      "{opt.message}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Action Section (Mobile CTA) */}
          <div className="p-4 bg-white border-t border-stone-200 flex flex-col gap-2">
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-900 text-xs">
              <span className="text-lg">{selectedOption.sticker}</span>
              <p className="truncate text-[11px] font-medium">
                선택됨: <span className="font-bold">"{selectedOption.title}"</span>
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 active:scale-98 rounded-2xl transition-all"
              >
                닫기
              </button>
              <button
                id="send-selected-praise-btn"
                type="button"
                onClick={handleSend}
                className="flex-[2] py-3 text-xs font-bold text-white bg-rose-500 hover:bg-rose-600 active:scale-98 rounded-2xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{recipientProfile.name}에게 칭찬 보내기</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
