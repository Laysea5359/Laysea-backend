import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  TrendingUp,
  FileSpreadsheet,
  Download,
  Copy,
  CheckCircle2,
  Users,
  AlertTriangle,
  Siren,
  Ban,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  Coins,
  DollarSign,
  Filter,
  Eye,
  LogOut,
  LifeBuoy,
} from 'lucide-react';
import { FinancialTransaction, SosIncident, CustomerSupportTicket, KycApplication, Booking } from '../types';
import { LiveTrackingModal } from './LiveTrackingModal';
import { INITIAL_PARTNERS } from '../data/partners';

interface AdminPortalProps {
  onLogout: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onLogout }) => {
  const [activeAdminTab, setActiveAdminTab] = useState<'overview' | 'sheets' | 'safety' | 'support'>('overview');
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [incidents, setIncidents] = useState<SosIncident[]>([]);
  const [tickets, setTickets] = useState<CustomerSupportTicket[]>([]);
  const [kycList, setKycList] = useState<KycApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string | null>(null);
  const [monitoringJob, setMonitoringJob] = useState<Booking | null>(null);

  const fetchAdminData = async () => {
    try {
      const res = await fetch('/api/admin/data');
      const data = await res.json();
      setTransactions(data.transactions || []);
      setIncidents(data.incidents || []);
      setTickets(data.tickets || []);
      setKycList(data.kycList || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const totalGross = transactions.reduce((acc, t) => acc + t.amountBaht, 0);
  const totalPlatformCut = transactions.reduce((acc, t) => acc + t.platformCutBaht, 0);
  const totalPartnerPayout = transactions.reduce((acc, t) => acc + t.partnerCutBaht, 0);
  const activeSosCount = incidents.filter((i) => i.status !== 'resolved').length;
  const pendingTicketsCount = tickets.filter((t) => t.status !== 'resolved').length;
  const pendingKycCount = kycList.filter((k) => k.status === 'pending_review').length;

  // Formula for Google Sheets live import
  const fullAppUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const googleSheetFormula = `=IMPORTDATA("${fullAppUrl}/api/admin/export/sheets.csv")`;

  const handleCopyFormula = () => {
    navigator.clipboard.writeText(googleSheetFormula);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2500);
  };

  const showNotice = (msg: string) => {
    setActionSuccessNotice(msg);
    setTimeout(() => setActionSuccessNotice(null), 3000);
  };

  // Admin action: Resolve SOS incident
  const handleResolveIncident = async (incidentId: string, banClient: boolean) => {
    try {
      await fetch('/api/admin/incidents/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incidentId,
          banClient,
          notes: banClient
            ? 'แอดมินประสานงานตำรวจ สน.ทองหล่อ เรียบร้อย และระงับบัญชีลูกค้าถาวร'
            : 'แอดมินยืนยันพาร์ทเนอร์ปลอดภัย คลี่คลายเหตุการณ์แล้ว',
        }),
      });
      showNotice(banClient ? 'ระงับบัญชีลูกค้าและปิดเคสเรียบร้อย!' : 'คลี่คลายเคสฉุกเฉินแล้ว!');
      fetchAdminData();
    } catch {
      alert('เกิดข้อผิดพลาดในการดำเนินการ');
    }
  };

  // Admin action: Handle support ticket / refund
  const handleTicketAction = async (ticketId: string, action: 'refund' | 'close', refundAmount = 1000) => {
    try {
      await fetch('/api/admin/tickets/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketId,
          action,
          refundCredits: action === 'refund' ? refundAmount : 0,
          notes: action === 'refund' ? `อนุมัติคืนเครดิต ${refundAmount} เครดิตเข้ากระเป๋าสำเร็จ` : 'ชี้แจงกฎและปิดเรื่อง',
        }),
      });
      showNotice(action === 'refund' ? `คืนเครดิต ${refundAmount} เครดิตให้ลูกค้าสำเร็จ!` : 'บันทึกแก้ไขปัญหาเรียบร้อย!');
      fetchAdminData();
    } catch {
      alert('เกิดข้อผิดพลาดในการดำเนินการ');
    }
  };

  // Admin action: KYC Approve/Reject
  const handleKycAction = async (kycId: string, action: 'approve' | 'reject') => {
    try {
      await fetch('/api/admin/kyc/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kycId,
          action,
        }),
      });
      showNotice(action === 'approve' ? 'อนุมัติพาร์ทเนอร์เรียบร้อย (มอบตรา KYC)' : 'ปฏิเสธใบสมัครเรียบร้อย');
      fetchAdminData();
    } catch {
      alert('เกิดข้อผิดพลาดในการดำเนินการ');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Admin Mobile Header */}
      <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-white text-xs sm:text-sm">
                Laysea Admin HQ
              </h2>
              <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded font-semibold uppercase">
                Super Admin
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              ระบบศูนย์กลางกำกับความปลอดภัย & รายรับ
            </p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-[11px]"
          title="ออกจากระบบ"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ออก</span>
        </button>
      </div>

      {/* Floating Action Notice */}
      {actionSuccessNotice && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-2 text-center flex items-center justify-center gap-1.5 animate-pulse shrink-0">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* Sub Tabs Navigation */}
      <div className="grid grid-cols-4 p-1.5 bg-slate-950 border-b border-slate-800 text-[11px] font-medium shrink-0">
        <button
          onClick={() => setActiveAdminTab('overview')}
          className={`py-1.5 rounded-lg transition-all ${
            activeAdminTab === 'overview'
              ? 'bg-purple-600 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          สรุปภาพรวม
        </button>
        <button
          onClick={() => setActiveAdminTab('sheets')}
          className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeAdminTab === 'sheets'
              ? 'bg-purple-600 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
          <span>Google Sheet</span>
        </button>
        <button
          onClick={() => setActiveAdminTab('safety')}
          className={`py-1.5 rounded-lg transition-all relative ${
            activeAdminTab === 'safety'
              ? 'bg-purple-600 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>ความปลอดภัย</span>
          {activeSosCount > 0 && (
            <span className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          )}
        </button>
        <button
          onClick={() => setActiveAdminTab('support')}
          className={`py-1.5 rounded-lg transition-all relative ${
            activeAdminTab === 'support'
              ? 'bg-purple-600 text-white font-bold shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>แก้ปัญหา & KYC</span>
          {pendingTicketsCount + pendingKycCount > 0 && (
            <span className="ml-1 text-[9px] bg-amber-500 text-slate-950 px-1 rounded-full font-bold">
              {pendingTicketsCount + pendingKycCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: OVERVIEW & FINANCIAL SUMMARY */}
        {activeAdminTab === 'overview' && (
          <div className="space-y-4">
            {/* 3 Metric Cards */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <DollarSign className="w-3 h-3 text-emerald-400" /> ยอดเงินรวมทั้งหมด
                </span>
                <div className="text-lg font-black text-white font-['Plus_Jakarta_Sans']">
                  ฿{totalGross.toLocaleString()}
                </div>
                <span className="text-[10px] text-emerald-400">ธุรกรรมสำเร็จ {transactions.length} รายการ</span>
              </div>

              <div className="p-3 bg-purple-950/30 rounded-2xl border border-purple-500/40 space-y-1">
                <span className="text-[10px] text-purple-300 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-purple-400" /> ส่วนแบ่งแพลตฟอร์ม (20%)
                </span>
                <div className="text-lg font-black text-purple-300 font-['Plus_Jakarta_Sans']">
                  ฿{totalPlatformCut.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400">กำไรสุทธิหลังหักประกัน</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400">จ่ายค่าตอบแทนพาร์ทเนอร์ (80%):</span>
                <div className="text-base font-bold text-amber-300 font-['Plus_Jakarta_Sans']">
                  ฿{totalPartnerPayout.toLocaleString()}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400">รอบโอนสัปดาห์นี้:</span>
                <div className="text-xs font-semibold text-emerald-400">พร้อมโอนเข้าบัญชีแล้ว</div>
              </div>
            </div>

            {/* Platform Health Quick Glance */}
            <div className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                <span>สถานะระบบ & ความปลอดภัยภาพรวม</span>
              </h3>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-base font-bold text-rose-400">6</div>
                  <div className="text-[9px] text-slate-400">พาร์ทเนอร์พร้อมรับงาน</div>
                </div>
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-base font-bold text-red-400">{activeSosCount}</div>
                  <div className="text-[9px] text-slate-400">SOS ฉุกเฉินค้าง</div>
                </div>
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-base font-bold text-amber-400">{pendingKycCount}</div>
                  <div className="text-[9px] text-slate-400">KYC รออนุมัติ</div>
                </div>
              </div>
            </div>

            {/* Recent Transactions List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">รายการธุรกรรมล่าสุด:</span>
                <button
                  onClick={() => setActiveAdminTab('sheets')}
                  className="text-purple-400 hover:text-purple-300 text-[11px] flex items-center gap-1"
                >
                  <FileSpreadsheet className="w-3 h-3" /> ดูใน Google Sheet
                </button>
              </div>

              <div className="space-y-2">
                {transactions.slice(0, 4).map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{tx.notes}</div>
                      <div className="text-[10px] text-slate-400">
                        {tx.clientName} ➔ {tx.partnerName} · {tx.createdAt}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400">+{tx.amountBaht.toLocaleString()} ฿</div>
                      <div className="text-[9px] text-purple-300">เข้าบริษัท {tx.platformCutBaht} ฿</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GOOGLE SHEETS INTEGRATION & EXPORT */}
        {activeAdminTab === 'sheets' && (
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-purple-950/40 rounded-2xl border border-emerald-500/40 space-y-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-white text-xs sm:text-sm">
                    ส่งออกและเชื่อมต่อ Google Sheets แบบ Real-time
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    สรุปรายรับ ค่าตอบแทนพาร์ทเนอร์ และค่าธรรมเนียมแพลตฟอร์ม
                  </p>
                </div>
              </div>

              {/* Direct CSV Download Button */}
              <a
                href="/api/admin/export/sheets.csv"
                download="laysea_entertain_financial_report.csv"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/60 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลดไฟล์ CSV (สำหรับ Google Sheets / Excel)</span>
              </a>

              {/* Live Google Sheets Import Formula */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="font-semibold">สูตรดึงข้อมูลสดเข้า Google Sheets:</span>
                  <button
                    onClick={handleCopyFormula}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1"
                  >
                    {copiedFormula ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFormula ? 'คัดลอกแล้ว!' : 'คัดลอกสูตร'}</span>
                  </button>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[10px] font-mono text-emerald-300 break-all select-all">
                  {googleSheetFormula}
                </div>
                <p className="text-[10px] text-slate-400">
                  💡 *วิธีใช้: เปิดไฟล์ Google Sheet เปล่า แล้ววางสูตรนี้ในช่อง A1 ข้อมูลรายรับทั้งหมดจะอัปเดตอัตโนมัติทันที*
                </p>
              </div>
            </div>

            {/* In-App Google Sheet Data Preview */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>ตารางข้อมูลจำลองบน Google Sheet:</span>
              </span>

              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 text-[11px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold text-[10px]">
                      <th className="p-2 whitespace-nowrap">รหัส</th>
                      <th className="p-2 whitespace-nowrap">ลูกค้า</th>
                      <th className="p-2 whitespace-nowrap">พาร์ทเนอร์</th>
                      <th className="p-2 whitespace-nowrap">ยอดรวม</th>
                      <th className="p-2 whitespace-nowrap">บริษัท 20%</th>
                      <th className="p-2 whitespace-nowrap">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {transactions.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/40">
                        <td className="p-2 font-mono text-slate-400 whitespace-nowrap">{t.id}</td>
                        <td className="p-2 whitespace-nowrap text-white font-medium">{t.clientName}</td>
                        <td className="p-2 whitespace-nowrap text-rose-300">{t.partnerName}</td>
                        <td className="p-2 whitespace-nowrap font-bold text-emerald-400">฿{t.amountBaht.toLocaleString()}</td>
                        <td className="p-2 whitespace-nowrap text-purple-300">฿{t.platformCutBaht.toLocaleString()}</td>
                        <td className="p-2 whitespace-nowrap">
                          <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                            สำเร็จ
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SAFETY & SOS INCIDENT RESOLUTION */}
        {activeAdminTab === 'safety' && (
          <div className="space-y-4">
            {/* Real-time GPS On-Duty Monitoring Card */}
            <div className="p-3.5 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 rounded-2xl border border-emerald-500/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-bold text-white text-xs">พาร์ทเนอร์กำลังปฏิบัติงาน (Live On-Duty)</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-semibold">
                  1 ภารกิจ Active
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                น้องพิมพ์ (Pim) กำลังปฏิบัติงานกับ คุณสมชาย ณ โรงแรมสยาม เคมปินสกี้
              </p>
              <button
                onClick={() =>
                  setMonitoringJob({
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
                  })
                }
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-950/60 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>📍 เปิดมอนิเตอร์พิกัด GPS นัดพบ & ความปลอดภัยสด</span>
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Siren className="w-4 h-4 text-red-500" />
                <span>รายงานเหตุฉุกเฉินและคุกคาม (SOS Incidents):</span>
              </span>
              <span className="text-[10px] text-slate-400">{incidents.length} เหตุการณ์</span>
            </div>

            <div className="space-y-3">
              {incidents.map((inc) => (
                <div
                  key={inc.id}
                  className={`p-4 rounded-2xl border space-y-3 ${
                    inc.status === 'resolved'
                      ? 'bg-slate-900 border-slate-800 opacity-90'
                      : 'bg-red-950/40 border-red-500/80 shadow-lg'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-xs">{inc.partnerName}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                            inc.status === 'resolved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-red-500 text-white animate-pulse'
                          }`}
                        >
                          {inc.status === 'resolved' ? 'คลี่คลายแล้ว' : '🚨 ฉุกเฉิน ACTIVE'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {inc.location} · {inc.timestamp}
                      </p>
                    </div>

                    <div className="text-[10px] text-amber-300 font-mono">
                      GPS: {inc.latitude}, {inc.longitude}
                    </div>
                  </div>

                  <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-rose-200">
                    <strong>ข้อความแจ้งเหตุ:</strong> "{inc.message}"
                  </div>

                  {inc.resolutionNotes && (
                    <div className="text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                      <strong>บันทึกแอดมิน:</strong> {inc.resolutionNotes}
                      {inc.clientBanned && (
                        <span className="text-red-400 font-bold ml-1">(ระงับบัญชีผู้ก่อเหตุแล้ว)</span>
                      )}
                    </div>
                  )}

                  {/* Admin Resolution Buttons */}
                  {inc.status !== 'resolved' && (
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-red-500/30">
                      <button
                        onClick={() => handleResolveIncident(inc.id, true)}
                        className="py-2 px-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>ระงับบัญชีลูกค้า & จบเคส</span>
                      </button>

                      <button
                        onClick={() => handleResolveIncident(inc.id, false)}
                        className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-sm"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>ยืนยันความปลอดภัย</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CUSTOMER SUPPORT DISPUTES & KYC APPROVAL */}
        {activeAdminTab === 'support' && (
          <div className="space-y-5">
            {/* Customer Dispute Tickets */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
                <span>คำร้องแก้ปัญหาให้ลูกค้า (Support & Refund Tickets):</span>
              </span>

              <div className="space-y-2.5">
                {tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{t.subject}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-semibold ${
                          t.status === 'resolved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {t.status === 'resolved' ? 'ดำเนินการแล้ว' : 'รอดำเนินการ'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      {t.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500">
                      <span>ผู้แจ้ง: {t.reporterName} ({t.reporterType === 'client' ? 'ลูกค้า' : 'พาร์ทเนอร์'})</span>
                      <span>{t.createdAt}</span>
                    </div>

                    {t.status !== 'resolved' && (
                      <div className="flex gap-2 pt-2 border-t border-slate-800">
                        {t.category === 'refund_request' && (
                          <button
                            onClick={() => handleTicketAction(t.id, 'refund', 1000)}
                            className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>อนุมัติคืน 1,000 เครดิต</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleTicketAction(t.id, 'close')}
                          className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium"
                        >
                          ปิดเรื่อง
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* KYC Partner Applications Review */}
            <div className="space-y-2 pt-2 border-t border-slate-900">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-rose-400" />
                <span>ตรวจสอบใบสมัครพาร์ทเนอร์ (KYC & ประวัติอาชญากรรม):</span>
              </span>

              <div className="space-y-2.5">
                {kycList.map((appItem) => (
                  <div
                    key={appItem.id}
                    className="p-3.5 bg-slate-900 rounded-2xl border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-white text-xs">{appItem.fullName} ({appItem.nickname})</h4>
                        <span className="text-[10px] text-slate-400">
                          อายุ {appItem.age} ปี · {appItem.phone} · บัตร: {appItem.idCardNumber}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-semibold ${
                          appItem.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : appItem.status === 'rejected'
                            ? 'bg-red-500/20 text-red-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {appItem.status === 'approved'
                          ? 'อนุมัติแล้ว'
                          : appItem.status === 'rejected'
                          ? 'ปฏิเสธ'
                          : 'รอตรวจประวัติ'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <div><strong>ธนาคาร:</strong> {appItem.bankName} เลขที่ {appItem.bankAccountNumber}</div>
                      <div><strong>สกิล:</strong> {appItem.skills.join(', ')}</div>
                      <div className="text-emerald-400 text-[10px]">
                        ✓ ยินยอมส่งตรวจสอบประวัติอาชญากรรม สนง.ตำรวจแห่งชาติ
                      </div>
                    </div>

                    {appItem.status === 'pending_review' && (
                      <div className="flex gap-2 pt-1 border-t border-slate-800">
                        <button
                          onClick={() => handleKycAction(appItem.id, 'approve')}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                        >
                          อนุมัติเป็นพาร์ทเนอร์
                        </button>
                        <button
                          onClick={() => handleKycAction(appItem.id, 'reject')}
                          className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-xs"
                        >
                          ปฏิเสธ
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {monitoringJob && (
        <LiveTrackingModal
          booking={monitoringJob}
          currentUserRole="admin"
          onClose={() => setMonitoringJob(null)}
          onOpenSos={() => setMonitoringJob(null)}
        />
      )}
    </div>
  );
};
