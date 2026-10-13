import React from 'react';
import { UserSession } from '../types';

interface PhoneContainerProps {
  children: React.ReactNode;
  userSession: UserSession | null;
  onLogout?: () => void;
  onSwitchRole?: (role: 'client' | 'partner' | 'admin') => void;
}

export const PhoneContainer: React.FC<PhoneContainerProps> = ({
  children,
  userSession,
  onLogout,
  onSwitchRole,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start overflow-x-hidden selection:bg-rose-500 selection:text-white">
      {/* Discreet Demo Role Switcher Bar (Useful for testing) */}
      {userSession && onSwitchRole && (
        <aside aria-label="Demo Role Switcher" className="w-full max-w-md px-3 py-1 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-300 font-medium">สลับบทบาททดสอบ:</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onSwitchRole('client')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                userSession.role === 'client' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              ลูกค้า
            </button>
            <button
              onClick={() => onSwitchRole('partner')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                userSession.role === 'partner' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              พาร์ทเนอร์
            </button>
            <button
              onClick={() => onSwitchRole('admin')}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                userSession.role === 'admin' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              แอดมิน
            </button>
          </div>
        </aside>
      )}

      {/* Pure Mobile Web App Container (No artificial phone bezel or frame) */}
      <div className="w-full max-w-md min-h-screen bg-slate-950 flex flex-col flex-1 shadow-2xl relative">
        {children}
      </div>
    </div>
  );
};
