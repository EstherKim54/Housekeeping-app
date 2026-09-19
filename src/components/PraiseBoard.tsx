import React from 'react';
import { Heart, Sparkles, Award, MessageCircleHeart } from 'lucide-react';
import { ChoreItem, PersonId, PraiseRecord } from '../types';
import { PROFILES } from '../data/initialData';

interface PraiseBoardProps {
  chores: ChoreItem[];
  activeUser: PersonId;
  onOpenPraise: (chore: ChoreItem) => void;
}

export const PraiseBoard: React.FC<PraiseBoardProps> = ({
  chores,
  onOpenPraise,
}) => {
  // Aggregate all praises from chores
  const allPraises: PraiseRecord[] = chores.flatMap((c) => c.praises || []);
  allPraises.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const wifePraises = allPraises.filter((p) => p.sender === 'wife').length;
  const husbandPraises = allPraises.filter((p) => p.sender === 'husband').length;

  // Completed chores count by person
  const wifeCompletions = chores.filter((c) => c.completed && c.completedBy === 'wife').length;
  const husbandCompletions = chores.filter((c) => c.completed && c.completedBy === 'husband').length;

  // Completed chores waiting for praise
  const unpraisedChores = chores.filter(
    (c) => c.completed && (!c.praises || c.praises.length === 0)
  );

  return (
    <div className="space-y-4 pb-12">
      {/* Mobile Praise Hero Card */}
      <div className="bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 rounded-3xl p-4 border border-rose-100/90 shadow-2xs">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-700 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>부부 사랑 칭찬함</span>
        </div>

        <h2 className="text-base font-black text-stone-900 leading-tight">
          서로를 향한 고마움과 배려의 기록 💕
        </h2>
        <p className="text-xs text-stone-600 mt-1">
          먼저 집안일을 해준 배우자에게 감사의 칭찬 카드를 보내보세요.
        </p>

        {/* Counter Summary */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-rose-100">
          <div className="bg-white/85 backdrop-blur-xs p-2.5 rounded-2xl border border-rose-100 text-center">
            <div className="text-base font-black text-rose-600">{allPraises.length}</div>
            <div className="text-[10px] text-stone-500 font-bold">주고받은 칭찬 카드</div>
          </div>
          <div className="bg-white/85 backdrop-blur-xs p-2.5 rounded-2xl border border-rose-100 text-center">
            <div className="text-base font-black text-emerald-600">
              {wifeCompletions + husbandCompletions}
            </div>
            <div className="text-[10px] text-stone-500 font-bold">부부 완료 집안일</div>
          </div>
        </div>
      </div>

      {/* Mini Profile Praise Breakdown */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">👩🏻</span>
            <span className="text-xs font-bold text-stone-800">아내의 기록</span>
          </div>
          <div className="text-[11px] text-stone-500">
            보낸 칭찬 <strong className="text-rose-600">{wifePraises}회</strong>
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            먼저 실천 {wifeCompletions}건
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-base">👨🏻</span>
            <span className="text-xs font-bold text-stone-800">남편의 기록</span>
          </div>
          <div className="text-[11px] text-stone-500">
            보낸 칭찬 <strong className="text-indigo-600">{husbandPraises}회</strong>
          </div>
          <div className="text-[10px] text-stone-400 mt-0.5">
            먼저 실천 {husbandCompletions}건
          </div>
        </div>
      </div>

      {/* Unpraised Chores Section (Tap to send instant praise) */}
      {unpraisedChores.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200/90 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>칭찬을 기다리는 완료 집안일 ({unpraisedChores.length})</span>
            </h3>
            <span className="text-[10px] text-amber-700 font-medium">칭찬 카드 보내기</span>
          </div>

          <div className="space-y-1.5">
            {unpraisedChores.map((chore) => {
              const completedPerson = chore.completedBy ? PROFILES[chore.completedBy] : PROFILES.wife;
              return (
                <div
                  key={chore.id}
                  className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1 truncate">
                    <div className="text-xs font-bold text-stone-800 truncate">{chore.title}</div>
                    <div className="text-[10px] text-stone-400">
                      완료자: <strong className="text-stone-700">{completedPerson.name}</strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenPraise(chore)}
                    className="shrink-0 text-[11px] px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold active:scale-95 transition-all shadow-2xs"
                  >
                    칭찬하기 💌
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Praise Feed History */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-stone-700 flex items-center gap-1.5 px-1">
          <MessageCircleHeart className="w-4 h-4 text-rose-500" />
          <span>도착한 칭찬 카드 히스토리 ({allPraises.length})</span>
        </h3>

        {allPraises.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-dashed border-stone-200 text-center">
            <div className="text-3xl mb-1">💌</div>
            <p className="text-xs font-bold text-stone-700">아직 주고받은 칭찬 카드가 없어요</p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              집안일을 먼저 해준 배우자에게 따뜻한 칭찬 카드를 전해보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {allPraises.map((praise) => {
              const sender = PROFILES[praise.sender];
              const recipient = PROFILES[praise.recipient];
              const dateStr = new Date(praise.createdAt).toLocaleDateString('ko-KR', {
                month: 'numeric',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={praise.id}
                  className="bg-white rounded-2xl p-3.5 border border-stone-200/90 shadow-2xs flex items-start gap-3"
                >
                  <span className="text-2xl p-1.5 bg-rose-50 rounded-2xl shrink-0">
                    {praise.sticker}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="text-xs font-bold text-stone-800 flex items-center gap-1">
                        <span className={sender.badgeText}>{sender.name}</span>
                        <span className="text-stone-300 font-normal">👉</span>
                        <span className={recipient.badgeText}>{recipient.name}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 shrink-0">{dateStr}</span>
                    </div>

                    <div className="text-[11px] font-semibold text-rose-600 mb-1 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span className="truncate">{praise.choreTitle}</span>
                    </div>

                    <p className="text-xs text-stone-700 bg-stone-50 p-2.5 rounded-xl border border-stone-100 leading-relaxed font-sans">
                      "{praise.message}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
