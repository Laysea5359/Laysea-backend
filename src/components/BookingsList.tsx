import React from 'react';
import { Calendar, Clock, MapPin, ShieldCheck, CheckCircle2, Siren, ArrowRight, Navigation } from 'lucide-react';
import { Booking } from '../types';

interface BookingsListProps {
  bookings: Booking[];
  onOpenSos: () => void;
  onBrowsePartners: () => void;
  onOpenLiveTracking?: (booking: Booking) => void;
}

export const BookingsList: React.FC<BookingsListProps> = ({
  bookings,
  onOpenSos,
  onBrowsePartners,
  onOpenLiveTracking,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">รายการนัดหมายของคุณ</h2>
          <p className="text-[11px] text-slate-400">
            ระบบความปลอดภัยและพิกัดนัดพบแบบ Real-time GPS
          </p>
        </div>
        <button
          onClick={onBrowsePartners}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
        >
          <span>จองเพิ่ม</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2.5">
          <Calendar className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-xs font-semibold text-slate-300">ยังไม่มีรายการนัดหมายในขณะนี้</h3>
          <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
            เลือกพาร์ทเนอร์ที่ตรงใจ หรือให้ AI ผู้จัดการช่วยจัดสเปคเพื่อเริ่มนัดหมาย
          </p>
          <button
            onClick={onBrowsePartners}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold"
          >
            ค้นหาพาร์ทเนอร์
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-4 space-y-3 hover:border-slate-700 transition-all shadow-md"
            >
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <img
                    src={booking.partnerImage}
                    alt={booking.partnerName}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <h3 className="font-bold text-white text-xs">{booking.partnerName}</h3>
                    <div className="text-[11px] text-rose-400 font-medium">{booking.eventType}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-amber-300">
                    {booking.totalCredits.toLocaleString()} C
                  </span>
                  <div className="text-[9px] text-emerald-400">✓ ประกันคุ้มครอง</div>
                </div>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{booking.date} ({booking.startTime} น.)</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{booking.durationHours} ชั่วโมง</span>
                </div>
                <div className="col-span-2 flex items-center gap-1.5 text-[11px] text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate">{booking.location}</span>
                </div>
              </div>

              {/* Live Meetup Tracking & SOS bar */}
              <div className="flex gap-2 pt-1">
                {onOpenLiveTracking && (
                  <button
                    onClick={() => onOpenLiveTracking(booking)}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5 animate-spin" />
                    <span>ดูพิกัดนัดพบ & ติดตามสด (Live GPS)</span>
                  </button>
                )}

                <button
                  onClick={onOpenSos}
                  className="py-2 px-2.5 bg-red-600/20 hover:bg-red-600 border border-red-500/40 text-red-300 hover:text-white rounded-xl text-xs font-semibold transition-all flex items-center gap-1"
                  title="แจ้งเหตุฉุกเฉิน"
                >
                  <Siren className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">SOS</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
