import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Shield,
  User,
  HeartHandshake,
  ShieldCheck,
  Lock,
  Phone,
  ArrowRight,
  Camera,
  Upload,
  CheckCircle2,
  FileText,
  AlertCircle,
  KeyRound,
  RotateCcw,
  Bell,
  Check,
} from 'lucide-react';
import { UserRole, UserSession } from '../types';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';

interface AuthScreenProps {
  onLogin: (session: UserSession) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'client' | 'partner'>('client');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  
  // PDPA & Policy Consents
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);
  const [agreedMarketing, setAgreedMarketing] = useState(false);
  const [agreedSafety, setAgreedSafety] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // OTP Verification States
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [smsNotification, setSmsNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCountdown > 0) {
      timer = setTimeout(() => {
        setOtpCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // Request OTP function
  const handleRequestOtp = () => {
    const cleanPhone = phone.trim().replace(/[-\s]/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      alert('กรุณากรอกหมายเลขโทรศัพท์ให้ถูกต้อง (9-10 หลัก) ก่อนขอรหัส OTP');
      return;
    }

    // Generate random 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpSent(true);
    setOtpCountdown(60);
    setEnteredOtp('');
    setOtpError(null);
    setIsPhoneVerified(false);

    // Realistic Simulated SMS Notification pop-in
    setSmsNotification(`💬 SMS จาก LAYSEA: รหัสยืนยัน OTP ของคุณคือ ${code} (ใช้ได้ 60 วินาที)`);
    setTimeout(() => {
      setSmsNotification(null);
    }, 9000);
  };

  // Verify OTP function
  const handleVerifyOtp = () => {
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      setOtpError('กรุณากรอกรหัส OTP 6 หลัก');
      return;
    }
    if (enteredOtp.trim() === generatedOtp) {
      setIsPhoneVerified(true);
      setOtpError(null);
      setSmsNotification(null);
    } else {
      setOtpError('รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
    }
  };

  // Default avatars for quick selection
  const clientAvatars = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  ];

  const partnerAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
  ];

  // Handle local file upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      if (!isPhoneVerified) {
        alert('กรุณารับและยืนยันรหัส OTP ทางเบอร์โทรศัพท์ให้เรียบร้อยก่อนทำการสมัครสมาชิกครับ/ค่ะ');
        return;
      }
      if (!agreedPrivacy) {
        alert('กรุณายินยอมรับทราบนโยบายความเป็นส่วนตัว (PDPA) เพื่อความปลอดภัยและการให้บริการ');
        return;
      }
      if (!agreedSafety) {
        alert('กรุณายินยอมรับทราบกฎความปลอดภัย: งดเว้นบริการทางเพศ 100% และไม่จ้างงานนอกระบบ');
        return;
      }
    }

    const finalAvatar =
      avatarUrl ||
      (selectedRole === 'client' ? clientAvatars[0] : partnerAvatars[0]);

    const BACKEND_URL = 'https://laysea-entertain-backend.onrender.com';

    try {
      if (isSignUp) {
        // กรณีกดสมัครสมาชิกใหม่
        const res = await fetch(`${BACKEND_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone,
            password,
            name,
            role: selectedRole,
            avatarUrl: finalAvatar
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.message || 'สมัครสมาชิกไม่สำเร็จ');
          return;
        }

        alert('สมัครสมาชิกสำเร็จ ยินดีต้อนรับ!');
        onLogin(data.user);
      } else {
        // กรณีกดเข้าสู่ระบบ (ส่งไปตรวจสอบรหัสผ่านจริง)
        const res = await fetch(`${BACKEND_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          // ถ้ารหัสผ่านผิด จะแจ้งเตือนและไม่ให้เข้าสู่ระบบ
          alert(data.message || 'เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง');
          return;
        }

        onLogin(data.user);
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // 1-Click Fast Demo accounts
  const handleQuickDemoLogin = (role: UserRole) => {
    if (role === 'client') {
      onLogin({
        id: 'USR-CLIENT-01',
        name: 'คุณสมชาย นรินทร์',
        role: 'client',
        phone: '089-112-2334',
        credits: 2500,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      });
    } else if (role === 'partner') {
      onLogin({
        id: 'USR-PARTNER-01',
        name: 'พิมพ์ชนก (น้องพิมพ์)',
        role: 'partner',
        phone: '084-556-7788',
        credits: 38400,
        partnerProfileId: 'partner-1',
        kycStatus: 'verified',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      });
    } else {
      onLogin({
        id: 'USR-ADMIN-01',
        name: 'ผู้ดูแลระบบ (Super Admin)',
        role: 'admin',
        phone: '02-LAYSEA-SOS',
        email: 'admin@laysea.com',
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-5 bg-slate-950 text-slate-100 overflow-y-auto relative">
      {/* Interactive Simulated SMS Toast Popup */}
      {smsNotification && (
        <div className="fixed top-3 left-4 right-4 z-50 animate-bounce">
          <div className="max-w-md mx-auto p-3.5 bg-slate-900 border-2 border-emerald-500 rounded-2xl shadow-2xl flex items-start gap-3 text-left">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
                <span>ระบบจำลองรับข้อความ SMS จริง</span>
                <span className="text-[10px] text-slate-400">ตอนนี้</span>
              </div>
              <p className="text-xs text-white mt-0.5 font-medium leading-snug">
                {smsNotification}
              </p>
              <button
                type="button"
                onClick={() => {
                  setEnteredOtp(generatedOtp);
                  setIsPhoneVerified(true);
                  setSmsNotification(null);
                }}
                className="mt-1.5 px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold inline-flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3 h-3" /> แตะเพื่อกรอกและยืนยัน OTP อัตโนมัติ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Brand Header */}
      <div className="pt-2 text-center space-y-2">
        <div className="w-13 h-13 mx-auto rounded-2xl bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-950/60">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight font-['Plus_Jakarta_Sans']">
            LAYSEA <span className="text-rose-400 font-normal">ENTERTAIN</span>
          </h1>
          <p className="text-xs text-slate-400">
            เพื่อนเที่ยว เพื่อนกินข้าว ควงออกงาน (ฟีลแฟน) พรีเมียม
          </p>
        </div>

        {/* Safety Badge */}
        <div className="inline-flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-300 px-3 py-1 rounded-full text-[11px] font-semibold">
          <Shield className="w-3.5 h-3.5 text-rose-400" />
          <span>ปลอดภัย 100% · งดเว้นบริการทางเพศทุกรูปแบบ</span>
        </div>
      </div>

      {/* Main Auth Form Container */}
      <div className="my-3 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3.5">
        {/* Toggle Sign In / Sign Up */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setSmsNotification(null);
            }}
            className={`py-2 rounded-lg font-semibold transition-all ${
              !isSignUp ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            เข้าสู่ระบบ
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`py-2 rounded-lg font-semibold transition-all ${
              isSignUp ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            สมัครสมาชิกใหม่
          </button>
        </div>

        {/* Role Selection (Mandatory for Sign Up) */}
        {isSignUp && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              เลือกประเภทผู้ใช้งาน:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('client')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedRole === 'client'
                    ? 'bg-rose-500/15 border-rose-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <User className="w-3.5 h-3.5 text-rose-400" />
                  <span>ลูกค้า (Client)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                  หาเพื่อนเที่ยว กินข้าว ออกงาน
                </p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('partner')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  selectedRole === 'partner'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <HeartHandshake className="w-3.5 h-3.5 text-amber-400" />
                  <span>พาร์ทเนอร์ (Partner)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">
                  รับงาน มีประกันคุ้มครอง
                </p>
              </button>
            </div>
          </div>
        )}

        {/* Profile Picture Upload Box (Sign Up only) */}
        {isSignUp && (
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              รูปโปรไฟล์ ({selectedRole === 'client' ? 'ลูกค้า' : 'พาร์ทเนอร์'}):
            </label>

            <div className="flex items-center gap-3">
              {/* Profile Avatar Circle Preview */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-rose-500/50 bg-slate-900 flex items-center justify-center cursor-pointer group shrink-0"
                title="คลิกเพื่ออัปโหลดรูปภาพ"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-slate-500" />
                )}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Camera className="w-4 h-4 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 p-0.5 bg-rose-600 rounded-full text-white shadow-sm">
                  <Camera className="w-2.5 h-2.5" />
                </div>
              </div>

              {/* Upload Action */}
              <div className="flex-1 space-y-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3 h-3 text-rose-400" />
                  <span>{avatarUrl ? 'เปลี่ยนรูปภาพ' : 'อัปโหลดรูปโปรไฟล์'}</span>
                </button>
                <p className="text-[10px] text-slate-500">
                  {selectedRole === 'client'
                    ? '* หน้าตรงชัดเจนเพื่อความน่าเชื่อถือ'
                    : '* พาร์ทเนอร์ต้องใช้รูปหน้าตรง คมชัด ตรงปก 100%'}
                </p>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">หรือเลือกรูปโปรไฟล์ด่วน:</span>
              <div className="flex items-center gap-2">
                {(selectedRole === 'client' ? clientAvatars : partnerAvatars).map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt="Preset"
                    onClick={() => setAvatarUrl(url)}
                    className={`w-7 h-7 rounded-full object-cover cursor-pointer border-2 transition-all ${
                      avatarUrl === url
                        ? 'border-rose-500 scale-110 shadow-md'
                        : 'border-slate-800 hover:border-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                ชื่อ-นามสกุล หรือชื่อเล่น:
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น คุณกฤษณ์, น้องมิน..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          )}

          {/* Phone Number with OTP Workflow for Sign Up */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              เบอร์โทรศัพท์มือถือ (ต้องรับรหัส OTP):
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (isPhoneVerified) setIsPhoneVerified(false);
                  }}
                  placeholder="08X-XXX-XXXX"
                  className={`w-full bg-slate-950 border rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none ${
                    isPhoneVerified
                      ? 'border-emerald-500/80 bg-emerald-950/10'
                      : 'border-slate-800 focus:border-rose-500'
                  }`}
                />
              </div>

              {/* OTP Request Button for Sign Up */}
              {isSignUp && (
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={otpCountdown > 0}
                  className={`px-3 py-2 rounded-xl text-[11px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                    otpCountdown > 0
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : isPhoneVerified
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm'
                  }`}
                >
                  <KeyRound className="w-3 h-3" />
                  <span>
                    {otpCountdown > 0
                      ? `รอ (${otpCountdown}s)`
                      : isPhoneVerified
                      ? 'ขอรหัสใหม่'
                      : otpSent
                      ? 'ส่งรหัสอีกครั้ง'
                      : 'ขอรหัส OTP'}
                  </span>
                </button>
              )}
            </div>

            {/* OTP Status & Verification Box */}
            {isSignUp && (
              <div className="mt-2 space-y-1.5">
                {isPhoneVerified ? (
                  <div className="p-2 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-300 text-[11px] font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>ยืนยันเบอร์โทรศัพท์ด้วย OTP สำเร็จแล้ว</span>
                  </div>
                ) : otpSent ? (
                  <div className="p-2.5 bg-slate-950 border border-amber-500/30 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-amber-300 font-semibold flex items-center gap-1">
                        <KeyRound className="w-3 h-3" /> กรอกรหัส OTP 6 หลักที่ได้รับ:
                      </span>
                      {otpCountdown > 0 && (
                        <span className="text-[10px] text-slate-400">
                          หมดอายุใน {otpCountdown} วินาที
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        value={enteredOtp}
                        onChange={(e) => setEnteredOtp(e.target.value)}
                        placeholder="กรอกเลข 6 หลัก (เช่น 892341)"
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-center text-xs font-mono font-bold tracking-widest text-white focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        ยืนยัน OTP
                      </button>
                    </div>
                    {otpError && (
                      <p className="text-[10px] text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {otpError}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-500">
                    * แพลตฟอร์มจะส่งรหัส OTP ไปยังเบอร์มือถือเพื่อยืนยันตัวตนจริงป้องกันบัญชีปลอม
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              รหัสผ่าน:
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Privacy Policy & PDPA Checkboxes (Sign Up Only) */}
          {isSignUp && (
            <div className="space-y-2 pt-1 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300">
                  นโยบายความเป็นส่วนตัวและข้อตกลง (PDPA)
                </span>
                <button
                  type="button"
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold underline flex items-center gap-1 cursor-pointer"
                >
                  <FileText className="w-3 h-3" />
                  <span>อ่านนโยบายฉบับเต็ม</span>
                </button>
              </div>

              {/* PDPA Summary explanation */}
              <div className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800 text-[10px] text-slate-400 space-y-1">
                <p className="text-slate-300 font-medium">
                  วัตถุประสงค์ในการเก็บข้อมูลส่วนบุคคล:
                </p>
                <div className="grid grid-cols-1 gap-0.5 pl-1 text-[9.5px]">
                  <span>• <strong>ชื่อ-นามสกุล:</strong> เพื่อระบุตัวตนและจับคู่บริการอย่างเป็นทางการ</span>
                  <span>• <strong>เบอร์โทรศัพท์:</strong> ยืนยันรหัส OTP และติดต่อประสานงานกรณีฉุกเฉิน</span>
                  <span>• <strong>ตำแหน่ง GPS:</strong> ตรวจสอบพิกัดนัดพบและส่งสัญญาณ SOS ความปลอดภัยขณะรับงาน</span>
                </div>
              </div>

              {/* Checkbox 1: Mandatory PDPA consent */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreedPrivacy}
                  onChange={(e) => setAgreedPrivacy(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
                />
                <span className="text-[10.5px] text-slate-300 leading-snug">
                  ข้าพเจ้ายินยอมให้จัดเก็บและใช้งาน <strong className="text-white">ชื่อ, เบอร์โทรศัพท์, และตำแหน่งที่ตั้ง GPS</strong> เพื่อความปลอดภัยและการให้บริการตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
                </span>
              </label>

              {/* Checkbox 2: Optional Marketing consent */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedMarketing}
                  onChange={(e) => setAgreedMarketing(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
                />
                <span className="text-[10.5px] text-slate-400 leading-snug">
                  (ไม่บังคับ) ยินยอมรับข่าวสาร สิทธิพิเศษ เครดิตโบนัส และโปรโมชั่นทางการตลาด (Marketing)
                </span>
              </label>

              {/* Checkbox 3: Strict Safety rule consent */}
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreedSafety}
                  onChange={(e) => setAgreedSafety(e.target.checked)}
                  className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
                />
                <span className="text-[10.5px] text-rose-300 leading-snug font-medium">
                  ข้าพเจ้ายินยอมปฏิบัติตามกฎเหล็ก: งดบริการทางเพศ 100%, ห้ามลวนลาม, และไม่แลกเปลี่ยนคอนแทคนอกระบบ
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-900/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
          >
            <span>{isSignUp ? 'ยืนยันลงทะเบียนเข้าใช้งาน' : 'เข้าสู่ระบบ'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Public Privacy Policy Link at bottom */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <Shield className="w-3 h-3 text-slate-500" />
            <span>นโยบายความเป็นส่วนตัว (Privacy Policy) & สิทธิ์ขอลบบัญชี PDPA</span>
          </button>
        </div>
      </div>

      
        


      {/* Full Privacy Policy Modal */}
      {showPrivacyModal && (
        <PrivacyPolicyModal onClose={() => setShowPrivacyModal(false)} />
      )}
    </div>
  );
};
