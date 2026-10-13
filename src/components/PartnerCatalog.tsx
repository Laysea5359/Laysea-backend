import React, { useState } from 'react';
import { ShieldCheck, Video, Calendar, Star, MapPin, Sparkles, Filter, Check, Wine, HeartHandshake, Award } from 'lucide-react';
import { Partner } from '../types';

interface PartnerCatalogProps {
  partners: Partner[];
  onSelectVdoCall: (partner: Partner) => void;
  onSelectBook: (partner: Partner) => void;
  onOpenAiMatching: () => void;
}

export const PartnerCatalog: React.FC<PartnerCatalogProps> = ({
  partners,
  onSelectVdoCall,
  onSelectBook,
  onOpenAiMatching,
}) => {
  const [selectedGender, setSelectedGender] = useState<'all' | 'female' | 'male'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'ทั้งหมด' },
    { id: 'party_care', label: 'ดูแลในวงสังสรร' },
    { id: 'wedding', label: 'ไปงานแต่ง/งานสังคม' },
    { id: 'dinner', label: 'ดินเนอร์หรู/Fine Dining' },
    { id: 'party', label: 'ชงเหล้าเป็น/ปาร์ตี้' },
    { id: 'cafe', label: 'เพื่อนเที่ยวคาเฟ่/ชิล' },
    { id: 'fan', label: 'ฟีลแฟนน่ารัก' },
  ];

  const filteredPartners = partners.filter((p) => {
    // Gender filter
    if (selectedGender !== 'all' && p.gender !== selectedGender) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q) || p.nickname.toLowerCase().includes(q);
      const matchSkill = p.skills.some((s) => s.toLowerCase().includes(q));
      const matchArea = p.areas.some((a) => a.toLowerCase().includes(q)) || p.location.toLowerCase().includes(q);
      const matchBio = p.bio.toLowerCase().includes(q);
      if (!matchName && !matchSkill && !matchArea && !matchBio) return false;
    }

    // Category filter
    if (selectedCategory === 'party_care') {
      return (
        p.skills.some((s) => s.includes('สังสรร') || s.includes('ดูแล') || s.includes('ชง') || s.includes('ปาร์ตี้')) ||
        p.drinkingSkill.includes('ปาร์ตี้') ||
        p.drinkingSkill.includes('ดื่มเป็นเพื่อน')
      );
    }
    if (selectedCategory === 'wedding') {
      return p.skills.some((s) => s.includes('งานแต่ง') || s.includes('งานสังคม'));
    }
    if (selectedCategory === 'dinner') {
      return p.skills.some((s) => s.includes('ดินเนอร์') || s.includes('Fine Dining') || s.includes('กินข้าว'));
    }
    if (selectedCategory === 'party') {
      return p.drinkingSkill.includes('ปาร์ตี้') || p.skills.some((s) => s.includes('ชง') || s.includes('ปาร์ตี้'));
    }
    if (selectedCategory === 'cafe') {
      return p.skills.some((s) => s.includes('คาเฟ่') || s.includes('ถ่ายรูป') || s.includes('ช็อปปิ้ง'));
    }
    if (selectedCategory === 'fan') {
      return p.vibeTags.some((t) => t.includes('ฟีลแฟน') || t.includes('คุณหนู') || t.includes('น่ารัก'));
    }

    return true;
  });

  return (
    <div className="space-y-8">
      {/* Search & Matching Kicker Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-rose-950/40 to-slate-900 border border-slate-800 p-6 md:p-8">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Smart Matching & 100% Verified Profiles</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            เพื่อนเที่ยว เพื่อนกินข้าว ควงออกงานหรู (ฟีลแฟน)
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            สัมผัสประสบการณ์เพื่อนร่วมทางระดับพรีเมียม ปลอดภัย 100% ตรวจสอบประวัติอาชญากรรม (KYC) ทุกคน พร้อมระบบ **VDO Call ดูตัวสด** ยืนยันว่าตรงปกก่อนตัดสินใจว่าจ้าง
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onOpenAiMatching}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-rose-900/30 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>ให้ AI ผู้จัดการช่วยจัดสเปคและจับคู่</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-rose-600/10 to-transparent pointer-events-none"></div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Gender Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
            <button
              onClick={() => setSelectedGender('all')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                selectedGender === 'all'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              พาร์ทเนอร์ทั้งหมด
            </button>
            <button
              onClick={() => setSelectedGender('female')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                selectedGender === 'female'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              สุภาพสตรี (Female)
            </button>
            <button
              onClick={() => setSelectedGender('male')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all ${
                selectedGender === 'male'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              สุภาพบุรุษ (Male)
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อ, สกิล (ชงเหล้า, งานแต่ง, ถ่ายรูป), หรือย่าน..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3.5 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills / Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> สไตล์งาน:
          </span>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Partners */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPartners.map((partner) => (
          <div
            key={partner.id}
            className="group bg-slate-900 rounded-2xl border border-slate-800/80 hover:border-slate-700 overflow-hidden flex flex-col transition-all duration-200 hover:shadow-xl hover:shadow-rose-950/20"
          >
            {/* Image Container with Badges */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-950">
              <img
                src={partner.imageUrl}
                alt={partner.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>

              {/* Online indicator */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium text-slate-200 border border-slate-800">
                <span
                  className={`w-2 h-2 rounded-full ${
                    partner.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                ></span>
                <span>{partner.isOnline ? 'พร้อมรับงาน' : 'รับงานตามนัด'}</span>
              </div>

              {/* Verified KYC Criminal Check Badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-950/90 backdrop-blur-md border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-full text-[11px] font-semibold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>KYC เช็คประวัติแล้ว</span>
              </div>

              {/* Partner Name & Location Overlay */}
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {partner.name} <span className="text-rose-400 text-sm font-normal">({partner.nickname})</span>
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span className="truncate">{partner.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-0.5 rounded text-xs font-bold shrink-0">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>{partner.rating}</span>
                    <span className="text-[10px] text-slate-400">({partner.reviewsCount})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* Clean Metadata Line */}
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                  <span>อายุ {partner.age} ปี</span>
                  <span aria-hidden="true">·</span>
                  <span>ส่วนสูง {partner.height} ซม.</span>
                  <span aria-hidden="true">·</span>
                  <span>ทำงานสำเร็จ {partner.completedJobs} ครั้ง</span>
                </div>

                {/* Bio text */}
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {partner.bio}
                </p>

                {/* Specialties / Skills Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {partner.skills.slice(0, 3).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                    >
                      {skill}
                    </span>
                  ))}
                  {partner.drinkingSkill.includes('ปาร์ตี้') && (
                    <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/40 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Wine className="w-3 h-3" /> ชงเหล้าเป็น
                    </span>
                  )}
                </div>

                {/* Safety Guarantee Info */}
                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Check className="w-3 h-3" /> มีประกันอุบัติเหตุคุ้มครอง
                  </span>
                  <span className="text-slate-500">
                    ตรงปก 100% ไร้ฟิลเตอร์
                  </span>
                </div>
              </div>

              {/* Pricing & Call to Actions */}
              <div className="pt-2 border-t border-slate-800 space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <div className="text-xs text-slate-400">
                    อัตราค่าบริการ:
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-rose-400 font-['Plus_Jakarta_Sans']">
                      {partner.hourlyRate.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-300 ml-1">เครดิต / ชม.</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* VDO Call Button */}
                  <button
                    onClick={() => onSelectVdoCall(partner)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-600/20 to-rose-600/20 hover:from-amber-600/30 hover:to-rose-600/30 border border-amber-500/40 text-amber-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 text-amber-400" />
                    <span>VDO Call ดูตัว ({partner.vdoCallRate} C)</span>
                  </button>

                  {/* Booking Button */}
                  <button
                    onClick={() => onSelectBook(partner)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-rose-900/20 transition-all cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>จองนัดหมาย</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPartners.length === 0 && (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
          <p className="text-slate-400 text-sm">ไม่พบพาร์ทเนอร์ตามเงื่อนไขที่เลือก</p>
          <button
            onClick={() => {
              setSelectedGender('all');
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-3 px-4 py-1.5 bg-slate-800 text-rose-400 text-xs rounded-lg hover:bg-slate-700"
          >
            ล้างตัวกรองทั้งหมด
          </button>
        </div>
      )}
    </div>
  );
};
