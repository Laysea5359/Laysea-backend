import React, { useState } from 'react';
import { X, Coins, Sparkles, Plus, History, CheckCircle2 } from 'lucide-react';

interface WalletModalProps {
  userCredits: number;
  onClose: () => void;
  onTopUp: (amount: number, label: string) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  userCredits,
  onClose,
  onTopUp,
}) => {
  const [selectedPackage, setSelectedPackage] = useState<number>(1500);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const packages = [
    { credits: 500, price: '500 ฿', bonus: '0', label: 'แพ็กเกจทดลอง (Starter)' },
    { credits: 1500, price: '1,500 ฿', bonus: '+150 เครดิต', popular: true, label: 'แพ็กเกจยอดนิยม (Standard)' },
    { credits: 3000, price: '3,000 ฿', bonus: '+400 เครดิต', label: 'แพ็กเกจพรีเมียม (Premium)' },
    { credits: 5000, price: '5,000 ฿', bonus: '+800 เครดิต', label: 'แพ็กเกจ VIP (VIP Exclusive)' },
  ];

  const handleBuy = (pkg: typeof packages[0]) => {
    onTopUp(pkg.credits, pkg.label);
    setSuccessNotice(`เติมเครดิตสำเร็จ +${pkg.credits.toLocaleString()} เครดิต!`);
    setTimeout(() => {
      setSuccessNotice(null);
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950/70 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">
              กระเป๋าเครดิต Laysea Credit Wallet
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Card */}
        <div className="p-6 bg-gradient-to-r from-amber-950/40 via-slate-900 to-rose-950/40 border-b border-slate-800 text-center">
          <p className="text-xs text-slate-400">เครดิตคงเหลือปัจจุบัน</p>
          <div className="text-4xl font-black text-amber-300 font-['Plus_Jakarta_Sans'] tracking-tight my-1">
            {userCredits.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">
            ใช้สำหรับชำระค่าบริการ VDO Call ดูตัวจริง และการจ้างงานพาร์ทเนอร์
          </p>

          {successNotice && (
            <div className="mt-3 p-2 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center justify-center gap-1.5 animate-bounce">
              <CheckCircle2 className="w-4 h-4" />
              <span>{successNotice}</span>
            </div>
          )}
        </div>

        {/* Packages List */}
        <div className="p-6 space-y-3 overflow-y-auto max-h-80">
          <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
            <span>เลือกแพ็กเกจเติมเครดิต:</span>
            <span className="text-[11px] text-slate-500">* ไม่มีวันหมดอายุ</span>
          </div>

          {packages.map((pkg, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedPackage(pkg.credits)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                selectedPackage === pkg.credits
                  ? 'bg-amber-500/10 border-amber-500/60 shadow-md'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-sm">
                    {pkg.credits.toLocaleString()} เครดิต
                  </span>
                  {pkg.bonus !== '0' && (
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded font-medium">
                      โบนัส {pkg.bonus}
                    </span>
                  )}
                  {pkg.popular && (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-bold">
                      ยอดนิยม
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400">{pkg.label}</div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-semibold text-amber-300 text-sm">{pkg.price}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBuy(pkg);
                  }}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  เติมทันที
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            🔒 ปลอดภัยสูงสุดด้วยระบบชำระเงินมาตรฐานธนาคารแห่งประเทศไทย
          </p>
        </div>
      </div>
    </div>
  );
};
