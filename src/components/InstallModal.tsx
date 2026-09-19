import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  X, 
  Copy, 
  Check, 
  Share2, 
  PlusSquare, 
  Download, 
  ExternalLink,
  Sparkles,
  QrCode
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstallModal: React.FC<InstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'ios' | 'android'>(isIOS ? 'ios' : 'android');

  if (!isOpen) return null;

  // Detect current hostname
  const rawUrl = typeof window !== 'undefined' ? window.location.href : '';
  const isDevUrl = rawUrl.includes('ais-dev-');

  // Provide the publicly accessible Shared App URL if currently in dev container
  const publicShareUrl = isDevUrl
    ? rawUrl.replace('ais-dev-', 'ais-pre-')
    : rawUrl;

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(publicShareUrl)}&color=1c1917&bgcolor=ffffff`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(publicShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <AnimatePresence>
      <div
        id="install-modal-overlay"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-900/60 backdrop-blur-xs"
        onClick={onClose}
      >
        <motion.div
          id="install-modal-sheet"
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 300 }}
          className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Handle indicator */}
          <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-2.5 sm:hidden" />

          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xs">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black flex items-center gap-1.5">
                  <span>휴대폰에서 앱으로 열기</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h3>
                <p className="text-[11px] text-stone-300">
                  앱스토어 설치 없이 홈 화면에 3초 만에 앱 설치
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
            {/* Real-time sync guarantee badge */}
            <div className="p-3 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-900">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs text-[11px] font-black">
                ✓
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-emerald-950 flex items-center gap-1">
                  <span>부부 스마트폰 실시간 자동 연동 활성화됨</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h4>
                <p className="text-[11px] text-emerald-800/90 mt-0.5 leading-relaxed">
                  아래 링크를 복사하여 배우자 카카오톡으로 보내보세요. 한 사람이 집안일을 체크하거나 캘린더 일정을 등록하면, 상대방 스마트폰에 즉시 실시간으로 싱크(동기화)됩니다.
                </p>
              </div>
            </div>

            {/* Direct 1-Click Install Button if browser supports beforeinstallprompt */}
            {isInstallable && (
              <div className="p-3.5 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl text-white shadow-md flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-black">원터치 앱 설치 지원</div>
                  <div className="text-[11px] text-white/90">현재 기기에 바로 어플로 등록합니다.</div>
                </div>
                <button
                  type="button"
                  onClick={install}
                  className="px-3.5 py-2 bg-white text-rose-700 font-bold text-xs rounded-xl shadow-xs active:scale-95 transition-all shrink-0 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>지금 설치</span>
                </button>
              </div>
            )}

            {/* Method 1: QR Code Scan (Fastest for PC to Phone transition) */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-white p-2.5 rounded-xl border border-stone-200 shadow-2xs shrink-0 flex flex-col items-center">
                <img
                  src={qrCodeUrl}
                  alt="스마트폰 연결 QR코드"
                  className="w-28 h-28 object-contain"
                />
                <span className="text-[9px] font-bold text-stone-400 mt-1 flex items-center gap-0.5">
                  <QrCode className="w-2.5 h-2.5" /> 스마트폰 카메라로 스캔
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left min-w-0">
                <span className="inline-block px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold mb-1">
                  가장 빠른 방법
                </span>
                <h4 className="text-xs font-bold text-stone-900">
                  휴대폰 카메라로 QR 코드를 비추세요!
                </h4>
                <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">
                  카메라를 켜고 위 QR코드를 비추면 스마트폰에서 공유용 주소로 바로 안전하게 열립니다.
                </p>

                {/* Direct display of clean URL */}
                <div className="mt-2 p-2 bg-stone-100 rounded-xl text-[10px] text-stone-600 font-mono break-all select-all border border-stone-200">
                  {publicShareUrl}
                </div>

                {/* URL Copy Button */}
                <div className="mt-2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="w-full py-1.5 px-2.5 bg-white border border-stone-300 hover:border-stone-400 rounded-xl text-stone-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-2xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">주소 복사 완료! 카톡으로 보내기</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                        <span>링크 주소 복사하기</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Method 2: OS Installation Step Guide Tabs */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-800">
                  휴대폰에서 '진짜 어플'로 저장하는 방법
                </span>
                {/* OS Toggle Buttons */}
                <div className="bg-stone-100 p-0.5 rounded-xl flex items-center border border-stone-200">
                  <button
                    type="button"
                    onClick={() => setActiveGuideTab('ios')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      activeGuideTab === 'ios'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-500'
                    }`}
                  >
                    🍎 아이폰 (Safari)
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveGuideTab('android')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                      activeGuideTab === 'android'
                        ? 'bg-white text-stone-900 shadow-2xs'
                        : 'text-stone-500'
                    }`}
                  >
                    🤖 갤럭시 / 안드로이드
                  </button>
                </div>
              </div>

              {/* iOS Step Guide */}
              {activeGuideTab === 'ios' && (
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-black flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="text-stone-700 leading-snug">
                      아이폰의 기본 브라우저인 <strong>Safari(사파리)</strong>로 주소에 접속합니다.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-black flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="text-stone-700 leading-snug">
                      하단 중앙의 <strong>공유 버튼</strong>(네모 위에 위로 향한 화살표 <Share2 className="w-3.5 h-3.5 inline text-blue-600" />)을 누릅니다.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-black flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="text-stone-700 leading-snug">
                      아래로 스크롤하여 <strong>[홈 화면에 추가]</strong> (<PlusSquare className="w-3.5 h-3.5 inline text-stone-800" />)를 선택한 뒤 우측 상단 <strong>[추가]</strong>를 누릅니다.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-1.5 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>이제 홈 화면에서 카카오톡처럼 주소창 없는 전체화면 앱으로 실행됩니다!</span>
                  </div>
                </div>
              )}

              {/* Android Step Guide */}
              {activeGuideTab === 'android' && (
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-black flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="text-stone-700 leading-snug">
                      <strong>Chrome(크롬)</strong> 또는 <strong>삼성 인터넷</strong> 브라우저로 주소에 접속합니다.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-black flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="text-stone-700 leading-snug">
                      화면 우측 상단(또는 하단)의 <strong>더보기 메뉴(점 3개 ⋮)</strong>를 누릅니다.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-stone-900 text-white font-black flex items-center justify-center text-[11px] shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="text-stone-700 leading-snug">
                      <strong>[앱 설치]</strong> 또는 <strong>[홈 화면에 추가]</strong>를 탭하면 스마트폰 앱 목록에 자동 설치됩니다.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900 flex items-center gap-1.5 font-medium">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>휴대폰 앱 서랍과 바탕화면에 예쁜 아이콘과 함께 단독 어플로 설치됩니다!</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-xl transition-all shadow-2xs active:scale-98"
            >
              확인 완료
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
