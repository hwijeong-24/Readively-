import React from 'react';
import { Home } from 'lucide-react';

interface HomeConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const HomeConfirmModal: React.FC<HomeConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-amber-200 text-center space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
          <Home className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 font-korean leading-snug">
            처음 화면으로 돌아갈까요?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-korean">
            읽던 내용은 사라져요.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onConfirm}
            className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 font-bold text-sm transition-all font-korean cursor-pointer"
          >
            돌아가기
          </button>
          <button
            onClick={onCancel}
            className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all font-korean cursor-pointer"
          >
            계속 읽기
          </button>
        </div>
      </div>
    </div>
  );
};
