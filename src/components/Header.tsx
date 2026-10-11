import React from 'react';
import { Bookmark, Home, Volume2, VolumeX } from 'lucide-react';

interface HeaderProps {
  currentPage: number;
  totalPages: number;
  isCover: boolean;
  isResult: boolean;
  isQuestion: boolean;
  screenTitle?: string;
  wordBankCount: number;
  badgeCount: number;
  soundEnabled: boolean;
  onOpenWordBank: () => void;
  onToggleSound: () => void;
  onOpenHomeConfirm: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  totalPages,
  isCover,
  isResult,
  isQuestion,
  screenTitle,
  wordBankCount,
  badgeCount,
  soundEnabled,
  onOpenWordBank,
  onToggleSound,
  onOpenHomeConfirm,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-amber-100/80 px-4 py-2.5 flex items-center justify-between gap-3 shadow-xs">
      {/* Left Slot: Home button (on all screens except Cover) + Page Counter or Brand */}
      <div className="flex items-center gap-2">
        {!isCover && (
          <button
            onClick={onOpenHomeConfirm}
            aria-label="Home"
            title="처음 화면으로 (Home)"
            className="w-11 h-11 min-w-[44px] min-h-[44px] -ml-1 rounded-2xl flex items-center justify-center text-amber-800 bg-amber-50 hover:bg-amber-100 active:scale-95 border border-amber-200/80 transition-all cursor-pointer shrink-0 shadow-2xs"
          >
            <Home className="w-5 h-5 text-amber-700" />
          </button>
        )}

        {isCover ? (
          <div className="flex items-center gap-1.5">
            <span className="text-base font-extrabold text-amber-600 tracking-tight font-story">
              Readively
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">
              · English Picture Book
            </span>
          </div>
        ) : isResult ? (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-800 font-story">
              Story Complete!
            </span>
          </div>
        ) : screenTitle ? (
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-slate-800 font-story">
              {screenTitle}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-800 tabular-nums font-story">
              Page {currentPage} / {totalPages}
            </span>
            {isQuestion && (
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full hidden sm:inline">
                Picture Question
              </span>
            )}
          </div>
        )}
      </div>

      {/* Right Slot: Badge count, Word Bank button, Sound toggle */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className="h-8 sm:h-9 px-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 flex items-center gap-1 text-xs font-black shadow-2xs"
          title="Cumulative earned badges across stories"
        >
          <span>⭐</span>
          <span className="tabular-nums">{badgeCount}</span>
        </div>

        <button
          onClick={onToggleSound}
          aria-label={soundEnabled ? 'Mute audio' : 'Unmute audio'}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title={soundEnabled ? 'Audio On' : 'Audio Off'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        <button
          onClick={onOpenWordBank}
          className="h-9 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-800 flex items-center gap-1.5 transition-colors text-xs font-bold"
          title="Open Word Bank"
        >
          <Bookmark className="w-4 h-4 text-amber-600 fill-amber-500/20" />
          <span>Word Bank</span>
          <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[11px] font-bold flex items-center justify-center tabular-nums">
            {wordBankCount}
          </span>
        </button>
      </div>
    </header>
  );
};
