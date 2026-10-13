import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, ShieldAlert, CheckCircle2, Coins, AlertCircle } from 'lucide-react';
import { Partner, Booking } from '../types';

interface BookingModalProps {
  partner: Partner | null;
  userCredits: number;
  onClose: () => void;
  onConfirmBooking: (booking: Booking) => void;
  onDeductCredits: (amount: number, reason: string) => boolean;
  onOpenWallet: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  partner,
  userCredits,
  onClose,
  onConfirmBooking,
  onDeductCredits,
  onOpenWallet,
}) => {
  const [eventType, setEventType] = useState('ไปงานแต่งงาน');
  const [location, setLocation] = useState('โรงแรมสยาม เคมปินสกี้ กรุงเทพฯ');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('18:00');
  const [durationHours, setDurationHours] = useState(3);
  const [agreedToSafetyRules, setAgreedToSafetyRules] = useState(false);
  const [specialNotes, setSpecialNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!partner) return null;

  const totalCredits = partner.hourlyRate * durationHours;
  const hasEnoughCredits = userCredits >= totalCredits;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToSafetyRules) {
      alert('กรุณายินยอมรับทราบกฎความปลอดภัยก่อนยืนยันการจองครับ/ค่ะ');
      return;
    }
    if (!hasEnoughCredits) {
      alert('เครดิตของคุณไม่เพียงพอ กรุณาเติมเครดิตก่อนครับ/ค่ะ');
      return;
    }

    setSubmitting(true);
    const success = onDeductCredits(totalCredits, `จองนัดหมายพาร์ทเนอร์: ${partner.name} (${durationHours} ชม.)`);

    if (success) {
      const newBooking: Booking = {
        id: 'BOOK-' + Math.floor(100000 + Math.random() * 900000),
        partnerId: partner.id,
        partnerName: `${partner.name} (${partner.nickname})`,
        partnerImage: partner.imageUrl,
        eventType,
        location,
        date,
        startTime,
        durationHours,
        totalCredits,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        safetyCheckinStatus: 'active',
      };
      onConfirmBooking(newBooking);
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-slate-950/70 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-semibold text-white">
              สร้างนัดหมายพาร์ทเนอร์ (Booking Request)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Partner Mini Header */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex items-center gap-3">
          <img
            src={partner.imageUrl}
            alt={partner.name}
            className="w-12 h-12 rounded-xl object-cover border border-slate-700"
          />
          <div>
            <div className="font-bold text-white text-sm">
              {partner.name} ({partner.nickname})
            </div>
            <div className="text-xs text-slate-400">
              อัตรา: <span className="text-rose-400 font-medium">{partner.hourlyRate} เครดิต</span> / ชั่วโมง · ตรวจประวัติอาชญากรรมแล้ว
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Event Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ประเภทงานหรือกิจกรรม:
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
            >
              <option value="ดูแลในวงสังสรร">ดูแลในวงสังสรร / ปาร์ตี้ & ชงเครื่องดื่ม</option>
              <option value="ไปงานแต่งงาน">ไปงานแต่งงาน / ควงออกงานทางการ</option>
              <option value="ดินเนอร์หรู / Fine Dining">ดินเนอร์หรู / Fine Dining</option>
              <option value="เพื่อนกินข้าว / ชาบู">เพื่อนกินข้าว / ชาบู / คาเฟ่</option>
              <option value="เพื่อนช็อปปิ้ง / ถ่ายรูป">เพื่อนช็อปปิ้ง / ถ่ายรูป / นิทรรศการ</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              สถานที่นัดพบและจัดงาน:
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="ระบุสถานที่ เช่น โรงแรม, ห้างสรรพสินค้า, ร้านอาหาร..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">
              * แนะนำนัดหมายในพื้นที่สาธารณะหรือสถานที่เปิดเผยเพื่อความปลอดภัย
            </span>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                วันที่นัดหมาย:
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                เวลาเริ่มนัดหมาย:
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>

          {/* Duration Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ระยะเวลา (ชั่วโมง):
            </label>
            <div className="flex items-center gap-2">
              {[2, 3, 4, 5, 6].map((hrs) => (
                <button
                  type="button"
                  key={hrs}
                  onClick={() => setDurationHours(hrs)}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${
                    durationHours === hrs
                      ? 'bg-rose-600 text-white border-rose-500 font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {hrs} ชม.
                </button>
              ))}
            </div>
          </div>

          {/* Special Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ข้อความระบุรายละเอียดเพิ่มเติม (ธีมงาน, ชุดแต่งกาย):
            </label>
            <textarea
              rows={2}
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="เช่น ธีมงานสีครีม-ทอง ขอแต่งตัวสุภาพ..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-rose-500 resize-none"
            />
          </div>

          {/* Mandatory Strict Safety & Legal Pledge */}
          <div className="p-3.5 bg-rose-950/30 border border-rose-500/40 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-rose-300 font-semibold text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>กฎเหล็กด้านความปลอดภัยของ Laysea Entertain</span>
            </div>
            <ul className="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
              <li>งดเว้นบริการทางเพศและการค้างคืน 100% (Non-Sexual Policy)</li>
              <li>ห้ามลวนลาม บังคับ หรือคุกคามพาร์ทเนอร์ทุกกรณี</li>
              <li>ห้ามแลกเปลี่ยนคอนแทคเพื่อจ้างงานนอกระบบ (ประกันจะไม่คุ้มครอง)</li>
            </ul>

            <label className="flex items-start gap-2 pt-2 border-t border-rose-500/30 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={agreedToSafetyRules}
                onChange={(e) => setAgreedToSafetyRules(e.target.checked)}
                className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 bg-slate-900 border-slate-700"
              />
              <span className="text-[11px] text-rose-200 font-medium leading-tight">
                ข้าพเจ้ารับทราบและยินยอมปฏิบัติตามกฎเหล็กความปลอดภัย 100% หากละเมิดยินดีให้ดำเนินคดีตามกฎหมาย
              </span>
            </label>
          </div>

          {/* Cost Summary & Credit Check */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-400">
              <span>คำนวณเครดิต ({partner.hourlyRate} x {durationHours} ชม.):</span>
              <span className="font-semibold text-white">{totalCredits.toLocaleString()} เครดิต</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>เครดิตคงเหลือในบัญชี:</span>
              <span className={`font-semibold ${hasEnoughCredits ? 'text-white' : 'text-red-400'}`}>
                {userCredits.toLocaleString()} เครดิต
              </span>
            </div>

            {!hasEnoughCredits && (
              <div className="pt-2 flex items-center justify-between text-red-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> เครดิตไม่เพียงพอ (ขาด {(totalCredits - userCredits).toLocaleString()})
                </span>
                <button
                  type="button"
                  onClick={onOpenWallet}
                  className="underline hover:text-red-300 font-semibold"
                >
                  เติมเครดิตทันที
                </button>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-medium"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={!agreedToSafetyRules || !hasEnoughCredits || submitting}
              className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white text-xs font-bold shadow-lg shadow-rose-900/30 transition-all flex items-center justify-center gap-2"
            >
              <Coins className="w-4 h-4" />
              <span>ยืนยันการจอง ({totalCredits.toLocaleString()} เครดิต)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
