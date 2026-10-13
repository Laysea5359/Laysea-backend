import React, { useState } from 'react';
import {
  Siren,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  Award,
  DollarSign,
  User,
  LogOut,
  AlertTriangle,
  PhoneCall,
  CheckCircle2,
  FileText,
  Wine,
  Navigation,
  Trash2,
  Lock,
  Phone,
  X,
} from 'lucide-react';
import { UserSession, Booking } from '../types';
import { SosEmergencyModal } from './SosEmergencyModal';
import { LiveTrackingModal } from './LiveTrackingModal';
import { AvatarUploadModal } from './AvatarUploadModal';
import { PrivacyPolicyModal } from './PrivacyPolicyModal';
import { INITIAL_PARTNERS } from '../data/partners';
import { Camera } from 'lucide-react';

interface PartnerPortalProps {
  userSession: UserSession;
  onLogout: () => void;
  onTriggerSos: (threat: string) => void;
  onUpdateAvatar?: (url: string) => void;
  onDeleteAccount?: () => void;
}

export const PartnerPortal: React.FC<PartnerPortalProps> = ({
  userSession,
  onLogout,
  onTriggerSos,
  onUpdateAvatar,
  onDeleteAccount,
}) => {
  const [partnerTab, setPartnerTab] = useState<'jobs' | 'safety' | 'earnings' | 'profile'>('jobs');
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [isEditAvatarOpen, setIsEditAvatarOpen] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Active Job Demo
  const activeJob: Booking = {
    id: 'JOB-891234',
    partnerId: 'partner-1',
    partnerName: 'พิมพ์ชนก (น้องพิมพ์)',
    partnerImage: INITIAL_PARTNERS[0].imageUrl,
    clientName: 'คุณสมชาย นรินทร์',
    eventType: 'ไปงานแต่งงาน (ควงออกงานสังคม)',
    location: 'โรงแรมสยาม เคมปินสกี้ กรุงเทพฯ',
    date: '2026-10-18',
    startTime: '18:00',
    durationHours: 3,
    totalCredits: 2400,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    safetyCheckinStatus: 'active',
    etaMinutes: 7,
    distanceKm: 1.2,
    meetupStatus: 'heading_to_meetup',
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Mobile Header for Partner */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          {/* Partner Avatar with Camera Badge */}
          <div
            onClick={() => setIsEditAvatarOpen(true)}
            className="relative w-9 h-9 rounded-xl overflow-hidden border border-amber-500/50 bg-slate-800 flex items-center justify-center cursor-pointer group shrink-0"
            title="แตะเพื่อเปลี่ยนรูปโปรไฟล์พาร์ทเนอร์"
          >
            {userSession.avatarUrl ? (
              <img src={userSession.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-4 h-4 text-amber-400" />
            )}
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Camera className="w-3 h-3 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-amber-600 rounded-full flex items-center justify-center text-white shadow-xs">
              <Camera className="w-2 h-2" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-xs truncate max-w-[120px]">
                {userSession.name}
              </span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 py-0.2 rounded font-semibold flex items-center gap-0.5">
                <ShieldCheck className="w-2.5 h-2.5" /> ตรวจประวัติแล้ว
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              สถานะ: ออนไลน์พร้อมรับงาน
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          title="ออกจากระบบ"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Prominent Emergency Red SOS Guard Strip */}
      <div className="bg-red-950/80 border-b border-red-500/60 p-2.5 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 text-red-200 text-xs">
          <Siren className="w-4 h-4 text-red-500 animate-pulse shrink-0" />
          <span className="font-semibold text-[11px] leading-tight">
            ถูกลวนลาม/ไม่ปลอดภัย? คุณมีสิทธิ์ปฏิเสธ 100%
          </span>
        </div>
        <button
          onClick={() => setIsSosOpen(true)}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-black shadow-md shadow-red-950/80 animate-bounce shrink-0 cursor-pointer"
        >
          🚨 SOS ด่วน
        </button>
      </div>

      {/* Tab Viewport */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: JOBS / SCHEDULE */}
        {partnerTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">ตารางงานที่ได้รับการยืนยัน:</span>
              <span className="text-emerald-400 font-semibold text-[11px]">1 งานวันนี้</span>
            </div>

            {/* Confirmed Job Card */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <h4 className="font-bold text-white text-xs">{activeJob.eventType}</h4>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-medium">
                  ยืนยันแล้ว
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>เวลา: {activeJob.startTime} น. (3 ชั่วโมง)</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>สถานที่: {activeJob.location}</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>ลูกค้า: {activeJob.clientName}</span>
                </div>
              </div>

              {/* Live Meetup GPS Button for Partner */}
              <button
                onClick={() => setIsTrackingOpen(true)}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/60 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 animate-spin" />
                <span>📍 ดูพิกัดนัดเจอลูกค้า & แผนที่ความปลอดภัยสด</span>
              </button>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400">ค่าตอบแทนของคุณ (80%):</span>
                  <div className="font-bold text-amber-300 text-sm">1,920 บาท</div>
                </div>
                <button
                  onClick={() => setIsSosOpen(true)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-red-950/40 text-red-300 border border-slate-700 hover:border-red-500/40 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                >
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span>รายงานปัญหา</span>
                </button>
              </div>
            </div>

            {/* Safety Reminder */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-200 space-y-1">
              <strong>กฎระเบียบการรับงาน:</strong>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                <li>ห้ามรับงานนอกระบบเด็ดขาด (จะไม่ได้รับความคุ้มครองประกัน)</li>
                <li>ปฏิเสธการดื่มแอลกอฮอล์เกินลิมิต หรือสถานที่ปิดมิดชิด</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: SAFETY & GPS MONITOR */}
        {partnerTab === 'safety' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>ระบบคุ้มครองความปลอดภัย 24/7 (Live GPS Shield)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                ตลอดระยะเวลาการทำงาน พิกัด GPS ของคุณจะเชื่อมต่อกับทีม Laysea Security และสถานีตำรวจพื้นที่
                หากมีเหตุผิดปกติ คุณสามารถกดปุ่ม SOS เพื่อเรียกรถสายตรวจได้ทันที
              </p>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1">
                <div>📍 <strong>พิกัดปัจจุบัน:</strong> 13.7367° N, 100.5606° E (ปทุมวัน/สยาม)</div>
                <div>🛡️ <strong>ประกันอุบัติเหตุ:</strong> คุ้มครองเต็มวงเงิน 500,000 บาท</div>
                <div>📞 <strong>สายด่วนฉุกเฉิน:</strong> 191 หรือ 02-LAYSEA-SOS</div>
              </div>

              {/* View Map Button */}
              <button
                onClick={() => setIsTrackingOpen(true)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>เปิดแผนที่พิกัดความปลอดภัยสด (Live Radar)</span>
              </button>
            </div>

            <button
              onClick={() => setIsSosOpen(true)}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-black shadow-lg shadow-red-950/80 flex items-center justify-center gap-2"
            >
              <Siren className="w-4 h-4 animate-bounce" />
              <span>ทดสอบส่งสัญญาณฉุกเฉิน (SOS Emergency Test)</span>
            </button>
          </div>
        )}

        {/* TAB 3: EARNINGS & CREDITS */}
        {partnerTab === 'earnings' && (
          <div className="space-y-4">
            <div className="p-5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 rounded-2xl border border-amber-500/40 text-center space-y-1">
              <span className="text-xs text-slate-400">รายได้สะสมพร้อมโอน</span>
              <div className="text-3xl font-black text-amber-300 font-['Plus_Jakarta_Sans']">
                38,400 ฿
              </div>
              <p className="text-[10px] text-slate-400">
                รอบโอนเงินอัตโนมัติเข้าบัญชีกสิกรไทย (KBANK) ทุกวันศุกร์
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-white">ประวัติรับค่าบริการล่าสุด:</span>
              <div className="space-y-2">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">งานไปงานแต่งงาน (3 ชม.)</div>
                    <div className="text-[10px] text-slate-400">12 ต.ค. 2026 · สำเร็จ</div>
                  </div>
                  <span className="font-bold text-emerald-400">+1,920 ฿</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">VDO Call ดูตัวจริง (2 ครั้ง)</div>
                    <div className="text-[10px] text-slate-400">11 ต.ค. 2026 · ตรงปก</div>
                  </div>
                  <span className="font-bold text-emerald-400">+240 ฿</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PROFILE & KYC STATUS */}
        {partnerTab === 'profile' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={userSession.avatarUrl || INITIAL_PARTNERS[0].imageUrl}
                    alt="Profile"
                    className="w-16 h-16 rounded-2xl object-cover border border-amber-500/40"
                  />
                  <button
                    onClick={() => setIsEditAvatarOpen(true)}
                    className="absolute -bottom-1 -right-1 p-1 bg-amber-600 rounded-full text-white shadow-xs"
                    title="เปลี่ยนรูปโปรไฟล์"
                  >
                    <Camera className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white text-sm">{userSession.name}</h3>
                  <div className="text-xs text-rose-400">เรตติ้ง 4.96 ★ (142 รีวิว)</div>
                  <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-0.5">
                    <Phone className="w-3 h-3" />
                    <span>{userSession.phone}</span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded ml-1 font-semibold">
                      OTP Verified ✓
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">
                    ✓ ผ่านตรวจประวัติอาชญากรรมแล้ว
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsEditAvatarOpen(true)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>เปลี่ยนรูปถ่ายโปรไฟล์พาร์ทเนอร์ (อัปโหลดรูปใหม่)</span>
              </button>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1.5 text-slate-300">
                <div><strong>กรมธรรม์ประกัน:</strong> LSE-2026-9921 (คุ้มครองระหว่างงาน)</div>
                <div><strong>บัญชีรับเงิน:</strong> ธนาคารกสิกรไทย 045-8-XXXXX-1</div>
                <div><strong>เรตค่าบริการ:</strong> 800 เครดิต/ชม. · VDO Call 150 เครดิต</div>
              </div>
            </div>

            {/* Privacy Policy section */}
            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-bold text-white">นโยบายความเป็นส่วนตัว (PDPA)</h3>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                ข้อมูลส่วนตัว บัตรประชาชน และพิกัด GPS ระหว่างรับงาน ได้รับการคุ้มครองและเข้ารหัสอย่างเข้มงวด
              </p>
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-amber-300 font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>เปิดอ่านนโยบายความเป็นส่วนตัว (Privacy Policy) ฉบับเต็ม</span>
              </button>
            </div>

            {/* Danger Zone: Delete Partner Account */}
            <div className="p-4 bg-red-950/20 rounded-2xl border border-red-500/30 space-y-2.5">
              <div className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-400" />
                <h3 className="text-xs font-bold text-red-300">โซนจัดการบัญชี (Danger Zone)</h3>
              </div>
              <p className="text-[10.5px] text-slate-400 leading-snug">
                ขอลบบัญชีพาร์ทเนอร์และทำลายข้อมูลส่วนบุคคล (ชื่อ, เบอร์โทร, รูปโปรไฟล์, เอกสาร KYC, และพิกัด GPS) ออกจากฐานข้อมูลอย่างถาวรตามสิทธิ PDPA
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(true)}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold shadow-md shadow-red-950/50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบบัญชีและข้อมูลผู้ใช้</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Mobile Navigation Bar for Partner */}
      <div className="grid grid-cols-4 p-2 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-[10px] text-slate-400 shrink-0">
        <button
          onClick={() => setPartnerTab('jobs')}
          className={`flex flex-col items-center gap-1 py-1 transition-colors ${
            partnerTab === 'jobs' ? 'text-amber-400 font-bold' : 'hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>งานของฉัน</span>
        </button>

        <button
          onClick={() => setPartnerTab('safety')}
          className={`flex flex-col items-center gap-1 py-1 transition-colors ${
            partnerTab === 'safety' ? 'text-amber-400 font-bold' : 'hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>ความปลอดภัย</span>
        </button>

        <button
          onClick={() => setPartnerTab('earnings')}
          className={`flex flex-col items-center gap-1 py-1 transition-colors ${
            partnerTab === 'earnings' ? 'text-amber-400 font-bold' : 'hover:text-white'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>รายได้</span>
        </button>

        <button
          onClick={() => setPartnerTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 transition-colors ${
            partnerTab === 'profile' ? 'text-amber-400 font-bold' : 'hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>โปรไฟล์ & KYC</span>
        </button>
      </div>

      {/* SOS Modal */}
      {isSosOpen && (
        <SosEmergencyModal
          onClose={() => setIsSosOpen(false)}
          incidents={[]}
          onTriggerSos={onTriggerSos}
        />
      )}

      {/* Live Tracking GPS Modal for Partner */}
      {isTrackingOpen && (
        <LiveTrackingModal
          booking={activeJob}
          currentUserRole="partner"
          onClose={() => setIsTrackingOpen(false)}
          onOpenSos={() => {
            setIsTrackingOpen(false);
            setIsSosOpen(true);
          }}
        />
      )}

      {/* Avatar Upload Modal for Partner */}
      {isEditAvatarOpen && (
        <AvatarUploadModal
          currentAvatarUrl={userSession.avatarUrl}
          userRole="partner"
          onClose={() => setIsEditAvatarOpen(false)}
          onSaveAvatar={(url) => {
            if (onUpdateAvatar) onUpdateAvatar(url);
          }}
        />
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <PrivacyPolicyModal onClose={() => setShowPrivacyModal(false)} />
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-red-500/40 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-400">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white">ยืนยันการลบบัญชีและข้อมูลผู้ใช้</h3>
              </div>
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-red-950/30 border border-red-500/20 rounded-xl text-[11px] text-red-200 space-y-1">
              <p className="font-bold">⚠️ การดำเนินการนี้ไม่สามารถยกเลิกได้!</p>
              <p className="text-slate-300">
                ระบบจะลบข้อมูลประวัติงานพาร์ทเนอร์, เอกสาร KYC, รูปโปรไฟล์, หมายเลขโทรศัพท์ และประวัติพิกัด GPS ทั้งหมดออกจากฐานข้อมูลอย่างถาวรตามสิทธิ PDPA (Right to Erasure)
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  if (onDeleteAccount) onDeleteAccount();
                }}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-red-950/50 cursor-pointer"
              >
                ยืนยันลบบัญชีถาวร
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
