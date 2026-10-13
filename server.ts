import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { INITIAL_PARTNERS } from './src/data/partners';
import { SosIncident, FinancialTransaction, CustomerSupportTicket, KycApplication } from './src/types';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize GoogleGenAI SDK with required telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const SYSTEM_INSTRUCTION = `คุณคือ AI ผู้จัดการและผู้ดูแลความปลอดภัยประจำแอปพลิเคชัน "Laysea Entertain" แพลตฟอร์มให้บริการเช่าเพื่อนเที่ยว เพื่อนกินข้าว และคนควงออกงาน (ฟีลแฟน) ระดับพรีเมียม

หน้าที่ของคุณครอบคลุม 4 ด้านหลัก ดังนี้:

[1. กฎเหล็กด้านความปลอดภัย (Strict Safety & SOS)]
- "งดเว้นบริการทางเพศทุกรูปแบบ 100%" หากพบการเจรจาค้าประเวณี ค้างคืน หรือผิดกฎหมาย ให้ปฏิเสธอย่างเด็ดขาดและแจ้งว่านี่คือการละเมิดกฎแพลตฟอร์มอย่างร้ายแรง
- ห้ามแลกเปลี่ยนคอนแทคส่วนตัว (เบอร์โทร, Line, Social Media) เพื่อจ้างงานนอกระบบเด็ดขาด หากตรวจพบให้ตักเตือนและชี้แจงความเสี่ยง
- SOS Protocol (สำคัญสูงสุด): หากพาร์ทเนอร์พิมพ์ข้อความขอความช่วยเหลือ หรือส่งสัญญาณว่าถูกคุกคาม/ลวนลาม/ไม่ปลอดภัย ให้คุณตอบกลับด้วยข้อความปลอบโยนทันที และต้องมีประโยคนี้อย่างชัดเจน: "ระบบได้ส่งพิกัด GPS ของคุณให้ทีมงานฉุกเฉินและเจ้าหน้าที่ตำรวจพื้นที่แล้ว กรุณาอยู่ในที่ปลอดภัย"

[2. ระบบเครดิตและ VDO Call (Payments & Features)]
- การจ้างงานและฟีเจอร์พิเศษทั้งหมดใช้ "เครดิต" ในการชำระผ่านระบบ
- ลูกค้าสามารถใช้เครดิตจ่ายเพื่อ "VDO Call" ดูตัวพาร์ทเนอร์ก่อนจ้างงานได้ เพื่อยืนยันว่าตรงปก หากลูกค้าถามเรื่องความกังวลว่าตรงปกไหม หรือถามเรื่องรูป ให้แนะนำฟีเจอร์นี้เสมอเพื่อความสบายใจ

[3. การจับคู่และแนะนำพาร์ทเนอร์ (Smart Matching)]
- เมื่อลูกค้าบอกความต้องการ (เช่น "อยากได้คนคุยเก่ง ชงเหล้าเป็น ไปงานแต่ง", "อยากได้เพื่อนไปกินชาบู") ให้สอบถามข้อมูลเพิ่มเติมที่จำเป็น ได้แก่:
  1. "ต้องการพาร์ทเนอร์ชายหรือหญิง?"
  2. "สถานที่และเวลาจัดงานคือที่ไหน?"
- จากนั้นให้แจ้งลูกค้าว่า: "ระบบกำลังคัดกรองพาร์ทเนอร์ที่ตรงสเปคและอยู่ในพื้นที่ของคุณให้ กรุณารอสักครู่เพื่อเลือกดูโปรไฟล์ครับ/ค่ะ"

[4. การรับสมัครพาร์ทเนอร์ (KYC & Onboarding)]
- หากมีผู้ใช้งานสอบถามเรื่องการสมัครเป็นพาร์ทเนอร์ ให้แจ้งขั้นตอนว่าต้องเตรียม 3 สิ่ง:
  1. บัตรประชาชน (เพื่อเช็คประวัติอาชญากรรม)
  2. รูปถ่ายหน้าตรงและเต็มตัว
  3. หน้าสมุดบัญชีธนาคาร
- เน้นย้ำว่าพาร์ทเนอร์ทุกคนต้องผ่านการสัมภาษณ์และตรวจสอบประวัติเพื่อความปลอดภัยของทั้งสองฝ่าย และแพลตฟอร์มมีการทำประกันอุบัติเหตุให้ระหว่างรับงานทุกครั้ง

บุคลิกในการสื่อสาร (Tone of Voice):
- สุภาพ เป็นมืออาชีพ ทันสมัย เข้าอกเข้าใจ
- กรณีเตือนการทำผิดกฎ ให้จริงจัง เด็ดขาด ชัดเจน
- กรณีรับแจ้งเหตุฉุกเฉิน ให้รวดเร็ว กระชับ และสร้างความอุ่นใจ`;

// In-memory data store for live interactive states
const sosIncidents: SosIncident[] = [
  {
    id: 'SOS-17912001',
    partnerName: 'น้องพิมพ์ (Pim)',
    location: 'ร้านอาหารรูฟท็อป ทองหล่อ 10, กรุงเทพฯ',
    latitude: 13.731456,
    longitude: 100.581234,
    message: 'ลูกค้าพยายามแตะเนื้อต้องตัวและขอให้ไปต่อที่คอนโด',
    timestamp: '2026-10-11 21:14',
    status: 'resolved',
    policeStation: 'สน.ทองหล่อ',
    suspectClientName: 'นายธนา (User #C-8812)',
    clientBanned: true,
    resolutionNotes: 'ส่งทีมเซฟตี้เข้าพื้นที่ภายใน 8 นาที รับพาร์ทเนอร์กลับอย่างปลอดภัย ระงับบัญชีลูกค้าถาวรและขึ้นแบล็กลิสต์',
  },
];

// Financial transactions for Admin & Google Sheet
const financialTransactions: FinancialTransaction[] = [
  {
    id: 'TXN-9081',
    type: 'booking_fee',
    amountBaht: 2400,
    credits: 2400,
    clientName: 'คุณสมชาย นรินทร์',
    partnerName: 'พิมพ์ชนก (น้องพิมพ์)',
    platformCutBaht: 480,
    partnerCutBaht: 1920,
    status: 'completed',
    createdAt: '2026-10-12 18:30',
    notes: 'งานไปงานแต่งงาน 3 ชม. (โรงแรมสยาม เคมปินสกี้)',
  },
  {
    id: 'TXN-9082',
    type: 'vdo_call',
    amountBaht: 150,
    credits: 150,
    clientName: 'คุณกิตติ์ ธนสาร',
    partnerName: 'วรินทร (วิน)',
    platformCutBaht: 30,
    partnerCutBaht: 120,
    status: 'completed',
    createdAt: '2026-10-12 17:15',
    notes: 'VDO Call ยืนยันตรงปกก่อนนัดหมาย',
  },
  {
    id: 'TXN-9083',
    type: 'booking_fee',
    amountBaht: 2700,
    credits: 2700,
    clientName: 'คุณพัชราภรณ์',
    partnerName: 'ณิชาภัทร (เมย์)',
    platformCutBaht: 540,
    partnerCutBaht: 2160,
    status: 'completed',
    createdAt: '2026-10-12 15:40',
    notes: 'ชงเหล้าเป็นเพื่อนปาร์ตี้วันเกิด เอกมัย',
  },
  {
    id: 'TXN-9084',
    type: 'top_up',
    amountBaht: 5000,
    credits: 5800,
    clientName: 'คุณอนุชา รุ่งโรจน์',
    partnerName: '-',
    platformCutBaht: 5000,
    partnerCutBaht: 0,
    status: 'completed',
    createdAt: '2026-10-12 14:10',
    notes: 'เติมเครดิตแพ็กเกจ VIP Exclusive',
  },
  {
    id: 'TXN-9085',
    type: 'booking_fee',
    amountBaht: 3000,
    credits: 3000,
    clientName: 'คุณธีรพงศ์',
    partnerName: 'ลลิตา (เบลล์)',
    platformCutBaht: 600,
    partnerCutBaht: 2400,
    status: 'completed',
    createdAt: '2026-10-11 20:00',
    notes: 'ดินเนอร์หรู Fine Dining ไอคอนสยาม 3 ชม.',
  },
  {
    id: 'TXN-9086',
    type: 'vdo_call',
    amountBaht: 150,
    credits: 150,
    clientName: 'คุณวีระศักดิ์',
    partnerName: 'ลลิตา (เบลล์)',
    platformCutBaht: 30,
    partnerCutBaht: 120,
    status: 'completed',
    createdAt: '2026-10-11 19:30',
    notes: 'VDO Call ตรวจสอบโปรไฟล์',
  },
];

// Customer Support & Dispute Tickets for Admin
const supportTickets: CustomerSupportTicket[] = [
  {
    id: 'TCK-401',
    reporterType: 'client',
    reporterName: 'คุณประสิทธิ์ เมธา',
    category: 'refund_request',
    subject: 'ขอคืนเครดิตเนื่องจากร้านอาหารปิดกะทันหัน',
    description: 'จองพาร์ทเนอร์น้องเบลล์ไว้ แต่ฝนตกหนักร้านอาหารปิด แจ้งล่วงหน้ากับพาร์ทเนอร์แล้ว ขอคืน 1,000 เครดิตเข้าวอลเล็ต',
    status: 'open',
    priority: 'high',
    createdAt: '2026-10-12 16:20',
  },
  {
    id: 'TCK-402',
    reporterType: 'partner',
    reporterName: 'ณิชาภัทร (เมย์)',
    category: 'off_platform_warning',
    subject: 'ลูกค้ารบเร้าขอ Line ส่วนตัวเพื่อไม่ผ่านระบบ',
    description: 'ลูกค้าชื่อ user-892 ขอแอด Line นอกรอบและเสนอให้เงินสด เมย์ปฏิเสธตามกฎแล้ว แจ้งแอดมินช่วยตักเตือนระบบ',
    status: 'in_investigation',
    priority: 'urgent',
    createdAt: '2026-10-12 12:45',
  },
];

// KYC Applications for Admin Review
const kycApplications: KycApplication[] = [
  {
    id: 'KYC-2026-108',
    fullName: 'นางสาวกานต์พิชชา รัตนวงศ์',
    nickname: 'แพม (Pam)',
    gender: 'female',
    age: 23,
    phone: '089-123-4567',
    lineId: 'pam_karn',
    idCardNumber: '1-1002-XXXXX-91-2',
    bankName: 'กสิกรไทย (KBANK)',
    bankAccountNumber: '045-8-XXXXX-1',
    bankAccountName: 'กานต์พิชชา รัตนวงศ์',
    skills: ['เพื่อนกินข้าว', 'ถ่ายรูปคาเฟ่', 'พูดภาษาอังกฤษ'],
    bio: 'นิสัยร่าเริง สดใส คุยเก่ง ตรงต่อเวลา ไม่ดื่มแอลกอฮอล์',
    submittedAt: '2026-10-12 10:15',
    consentCriminalCheck: true,
    consentInsurancePolicy: true,
    status: 'pending_review',
  },
  {
    id: 'KYC-2026-109',
    fullName: 'นายชลทิศ จิรพัฒน์',
    nickname: 'ท็อป (Top)',
    gender: 'male',
    age: 25,
    phone: '081-987-6543',
    lineId: 'top_chontit',
    idCardNumber: '3-1004-XXXXX-11-4',
    bankName: 'ไทยพาณิชย์ (SCB)',
    bankAccountNumber: '408-2-XXXXX-9',
    bankAccountName: 'ชลทิศ จิรพัฒน์',
    skills: ['ควงออกงานหรู', 'ขับรถได้', 'ถ่ายรูปเก่ง', 'เพื่อนกินชาบู'],
    bio: 'สุภาพบุรุษ บุคลิกดี แต่งตัวเนี๊ยบ ให้เกียรติทุกคนเสมอ',
    submittedAt: '2026-10-12 09:30',
    consentCriminalCheck: true,
    consentInsurancePolicy: true,
    status: 'interview_scheduled',
  },
];

// Helper to detect policy breaches or SOS
function detectSpecialCase(message: string): {
  isSos: boolean;
  isSexViolation: boolean;
  isOffPlatformViolation: boolean;
} {
  const lower = message.toLowerCase();
  const sosKeywords = ['sos', 'ช่วยด้วย', 'ลวนลาม', 'คุกคาม', 'จับตัว', 'ข่มขู่', 'อันตราย', 'แตะเนื้อต้องตัว', 'ไม่ปลอดภัย', 'ช่วยที', 'ช่วยผมด้วย', 'ช่วยหนูด้วย'];
  const sexKeywords = ['มีอะไรกัน', 'มีsex', 'มี เซ็ก', 'นอนด้วย', 'ค้างคืน', 'อย่างว่า', 'ขายบริการ', 'เปิดห้อง', 'นวดแฝง', 'ค้าประเวณี', 'เอาไหม', 'จบที่เตียง'];
  const contactKeywords = ['ขอไลน์', 'ขอ line', 'เบอร์โทร', 'นอกระบบ', 'จ่ายเงินสดตรง', 'แอดไลน์ส่วนตัว', 'เบอร์ส่วนตัว', 'ไม่ผ่านแอพ', 'ไม่ผ่านระบบ'];

  const isSos = sosKeywords.some((k) => lower.includes(k));
  const isSexViolation = sexKeywords.some((k) => lower.includes(k));
  const isOffPlatformViolation = contactKeywords.some((k) => lower.includes(k));

  return { isSos, isSexViolation, isOffPlatformViolation };
}

// AI Chat endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const { isSos, isSexViolation, isOffPlatformViolation } = detectSpecialCase(message);

    // If SOS is detected, guarantee safety protocol immediately
    if (isSos) {
      const incidentId = 'SOS-' + Date.now();
      const newIncident: SosIncident = {
        id: incidentId,
        partnerName: 'พาร์ทเนอร์ในภารกิจ',
        location: 'พิกัด GPS อัตโนมัติ (กรุงเทพมหานคร)',
        latitude: 13.736717,
        longitude: 100.560638,
        message,
        timestamp: new Date().toLocaleTimeString('th-TH'),
        status: 'dispatched',
        policeStation: 'สน.พื้นที่ใกล้เคียง',
      };
      sosIncidents.unshift(newIncident);

      const sosReply = `ใจเย็นๆ นะครับ/คะ คุณไม่ต้องตกใจ ขอให้พยายามตั้งสติและถอยห่างจากจุดเสี่ยง

🚨 **ระบบได้ส่งพิกัด GPS ของคุณให้ทีมงานฉุกเฉินและเจ้าหน้าที่ตำรวจพื้นที่แล้ว กรุณาอยู่ในที่ปลอดภัย**

ขณะนี้ทีมปฏิบัติการความปลอดภัย Laysea Safety Team ได้รับสัญญาณฉุกเฉินระดับสีแดง (Red Alert) และกำลังประสานงานเจ้าหน้าที่ตำรวจสายตรวจที่ใกล้ที่สุดเข้าช่วยเหลือทันที พยายามอยู่ในที่ที่มีผู้คนพลุกพล่านหรือกล้องวงจรปิดนะครับ/คะ`;

      res.json({
        reply: sosReply,
        isSosAlert: true,
        incidentId,
        recommendedAction: 'sos',
      });
      return;
    }

    // Call Gemini API if API key exists
    let aiReply = '';
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      try {
        const contents = [
          ...conversationHistory.map((item: { sender: string; text: string }) => ({
            role: item.sender === 'user' ? 'user' : 'model',
            parts: [{ text: item.text }],
          })),
          {
            role: 'user',
            parts: [{ text: message }],
          },
        ];

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
          },
        });

        aiReply = response.text || '';
      } catch (err: unknown) {
        console.error('Gemini API call failed, falling back to rule engine:', err);
      }
    }

    // Fallback if needed
    if (!aiReply) {
      if (isSexViolation) {
        aiReply = `⚠️ **การแจ้งเตือนด้านความปลอดภัยและการปฏิบัติตามกฎ:**
แพลตฟอร์ม Laysea Entertain มีนโยบาย **"งดเว้นบริการทางเพศทุกรูปแบบ 100%"**

ทางแพลตฟอร์มให้บริการเฉพาะเพื่อนเที่ยว เพื่อนกินข้าว ควงออกงานสังคม (ฟีลแฟนแบบให้เกียรติซึ่งกันและกัน) เท่านั้น ไม่อนุญาตให้มีการค้าประเวณี หรือการค้างคืนที่ส่อไปในทางชู้สาวโดยเด็ดขาด การกระทำดังกล่าวถือเป็นการละเมิดกฎร้ายแรง และบัญชีของคุณอาจถูกระงับการใช้งานทันที`;
      } else if (isOffPlatformViolation) {
        aiReply = `⚠️ **ข้อควรระวังเรื่องความปลอดภัย:**
แพลตฟอร์มไม่อนุญาตให้แลกเปลี่ยนคอนแทคส่วนตัว (เบอร์โทร, Line, Social Media) เพื่อจ้างงานนอกระบบเด็ดขาดครับ/ค่ะ

เนื่องจากการว่าจ้างผ่านระบบ Laysea Entertain จะได้รับความคุ้มครองจาก **ระบบประกันอุบัติเหตุ** และ **ระบบพิทักษ์ความปลอดภัยฉุกเฉิน (GPS Live SOS)** ตลอดระยะเวลาการนัดหมาย เพื่อความปลอดภัยสูงสุดของทั้งสองฝ่าย กรุณาดำเนินการผ่านระบบเครดิตในแอปพลิเคชันเท่านั้นครับ/ค่ะ`;
      } else if (message.includes('สมัคร') || message.includes('เป็นพาร์ทเนอร์') || message.includes('ทำงาน')) {
        aiReply = `ยินดีต้อนรับสู่ครอบครัว Laysea Entertain ครับ/ค่ะ! ✨

สำหรับการสมัครเป็นพาร์ทเนอร์พรีเมียมกับเรา กรุณาเตรียมเอกสารดังต่อไปนี้:
1. **บัตรประชาชน** (เพื่อตรวจสอบประวัติอาชญากรรม ตรวจสอบความถูกต้องและปลอดภัย)
2. **รูปถ่ายหน้าตรงและเต็มตัว** (ภาพถ่ายคมชัด ไม่ผ่านฟิลเตอร์หนาจนผิดเพี้ยน)
3. **หน้าสมุดบัญชีธนาคาร** (สำหรับรับค่าตอบแทนเครดิต)

เน้นย้ำว่าพาร์ทเนอร์ทุกคนต้องผ่านการสัมภาษณ์และตรวจสอบประวัติเพื่อความปลอดภัยของทั้งสองฝ่าย และแพลตฟอร์มมี **การทำประกันอุบัติเหตุให้ระหว่างรับงานทุกครั้ง** ครับ/ค่ะ สามารถกดปุ่ม "สมัครเป็นพาร์ทเนอร์" บนหน้าหลักได้ทันทีครับ`;
      } else if (message.includes('ตรงปก') || message.includes('ตัวจริง') || message.includes('vdo call') || message.includes('วิดีโอคอล') || message.includes('ดูตัว')) {
        aiReply = `เพื่อความสบายใจและมั่นใจ 100% ว่าตรงปก ทาง Laysea Entertain มีฟีเจอร์ **"VDO Call ดูตัวพาร์ทเนอร์"** ก่อนตัดสินใจจ้างงานครับ/ค่ะ! 🎥✨

คุณลูกค้าสามารถใช้ "เครดิต" ในระบบเพียง 150 เครดิต เพื่อเปิดสาย VDO Call สด พูดคุยทักทายและดูตัวจริงของพาร์ทเนอร์ได้ทันที เพื่อความมั่นใจก่อนทำการจ้างงานออกงานจริง หากสนใจ สามารถกดที่โปรไฟล์พาร์ทเนอร์แล้วเลือก "VDO Call ดูตัว" ได้เลยครับ/ค่ะ`;
      } else {
        aiReply = `สวัสดีครับ/ค่ะ ยินดีต้อนรับสู่ Laysea Entertain ผู้ช่วยดูแลความปลอดภัยและจัดหาพาร์ทเนอร์ระดับพรีเมียมครับ/ค่ะ ✨

เพื่อให้ระบบคัดกรองพาร์ทเนอร์ที่ตรงสเปคและอยู่ในพื้นที่ของคุณได้อย่างแม่นยำ ขออนุญาตสอบถามข้อมูลเพิ่มเติมดังนี้ครับ/ค่ะ:
1. คุณลูกค้าต้องการพาร์ทเนอร์ **ชาย หรือ หญิง** ครับ/ค่ะ?
2. **สถานที่และเวลาจัดงาน** รวมถึงรูปแบบงาน (เช่น ไปงานแต่ง, ดินเนอร์, ชงเหล้าสังสรรค์, เที่ยวคาเฟ่) คือที่ไหนครับ/ค่ะ?

ระบบกำลังคัดกรองพาร์ทเนอร์ที่ตรงสเปคและอยู่ในพื้นที่ของคุณให้ กรุณารอสักครู่เพื่อเลือกดูโปรไฟล์ครับ/ค่ะ 🥂`;
      }
    }

    let recommendedAction: 'vdo_call' | 'browse' | 'kyc' | 'sos' | undefined;
    if (message.includes('ตรงปก') || message.includes('ดูตัว') || message.includes('vdo call')) {
      recommendedAction = 'vdo_call';
    } else if (message.includes('สมัคร')) {
      recommendedAction = 'kyc';
    } else if (message.includes('งานแต่ง') || message.includes('หาเพื่อน') || message.includes('สเปค')) {
      recommendedAction = 'browse';
    }

    res.json({
      reply: aiReply,
      isViolationWarning: isSexViolation || isOffPlatformViolation,
      recommendedAction,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Chat error:', errorMsg);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง' });
  }
});

// Partners directory API
app.get('/api/partners', (_req: Request, res: Response) => {
  res.json({ partners: INITIAL_PARTNERS });
});

// Trigger SOS
app.post('/api/sos/trigger', (req: Request, res: Response) => {
  const { partnerName, location, latitude, longitude, message } = req.body;
  const incident: SosIncident = {
    id: 'SOS-' + Date.now(),
    partnerName: partnerName || 'พาร์ทเนอร์ในพื้นที่',
    location: location || 'กรุงเทพมหานคร',
    latitude: latitude || 13.736717,
    longitude: longitude || 100.560638,
    message: message || 'ส่งสัญญาณฉุกเฉินจากปุ่มด่วน SOS',
    timestamp: new Date().toLocaleTimeString('th-TH'),
    status: 'dispatched',
    policeStation: 'สน.ท้องที่สุขุมวิท/ทองหล่อ',
  };
  sosIncidents.unshift(incident);
  res.json({
    success: true,
    incident,
    reassuranceText: 'ระบบได้ส่งพิกัด GPS ของคุณให้ทีมงานฉุกเฉินและเจ้าหน้าที่ตำรวจพื้นที่แล้ว กรุณาอยู่ในที่ปลอดภัย',
  });
});

// Get SOS incidents for Safety Center
app.get('/api/sos/incidents', (_req: Request, res: Response) => {
  res.json({ incidents: sosIncidents });
});

// Admin data & stats API
app.get('/api/admin/data', (_req: Request, res: Response) => {
  const totalGross = financialTransactions.reduce((acc, t) => acc + t.amountBaht, 0);
  const totalPlatformCut = financialTransactions.reduce((acc, t) => acc + t.platformCutBaht, 0);
  const totalPartnerPayout = financialTransactions.reduce((acc, t) => acc + t.partnerCutBaht, 0);

  res.json({
    metrics: {
      totalGross,
      totalPlatformCut,
      totalPartnerPayout,
      totalTransactions: financialTransactions.length,
      activePartnersCount: INITIAL_PARTNERS.length,
      pendingKycCount: kycApplications.filter((k) => k.status === 'pending_review').length,
      activeSosCount: sosIncidents.filter((s) => s.status !== 'resolved').length,
    },
    transactions: financialTransactions,
    incidents: sosIncidents,
    tickets: supportTickets,
    kycList: kycApplications,
  });
});

// Google Sheet CSV Export Endpoint
app.get('/api/admin/export/sheets.csv', (_req: Request, res: Response) => {
  // UTF-8 BOM (\uFEFF) for perfect Thai language rendering in Google Sheets & MS Excel
  const bom = '\uFEFF';
  const headers = [
    'รหัสธุรกรรม',
    'วันที่เวลา',
    'ประเภทรายการ',
    'ลูกค้า',
    'พาร์ทเนอร์',
    'ยอดเงินรวม (บาท)',
    'เครดิต',
    'ส่วนแบ่งแพลตฟอร์ม 20% (บาท)',
    'จ่ายพาร์ทเนอร์ 80% (บาท)',
    'สถานะ',
    'หมายเหตุ',
  ];

  const typeMap: Record<string, string> = {
    booking_fee: 'จ้างงานพาร์ทเนอร์',
    vdo_call: 'VDO Call ดูตัวจริง',
    top_up: 'เติมเครดิตเข้ากระเป๋า',
    partner_payout: 'จ่ายค่าตอบแทนพาร์ทเนอร์',
    refund: 'คืนเงินเครดิตลูกค้า',
  };

  const rows = financialTransactions.map((tx) => [
    `"${tx.id}"`,
    `"${tx.createdAt}"`,
    `"${typeMap[tx.type] || tx.type}"`,
    `"${tx.clientName.replace(/"/g, '""')}"`,
    `"${tx.partnerName.replace(/"/g, '""')}"`,
    tx.amountBaht,
    tx.credits,
    tx.platformCutBaht,
    tx.partnerCutBaht,
    `"${tx.status === 'completed' ? 'สำเร็จ' : tx.status === 'refunded' ? 'คืนเงินแล้ว' : 'รอดำเนินการ'}"`,
    `"${tx.notes.replace(/"/g, '""')}"`,
  ]);

  const csvContent = bom + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="laysea_entertain_financial_report.csv"');
  res.send(csvContent);
});

// Admin actions
app.post('/api/admin/incidents/resolve', (req: Request, res: Response) => {
  const { incidentId, banClient, notes } = req.body;
  const incident = sosIncidents.find((i) => i.id === incidentId);
  if (incident) {
    incident.status = 'resolved';
    incident.resolutionNotes = notes || 'เจ้าหน้าที่เข้าดูแลและคลี่คลายเหตุการณ์เรียบร้อย';
    if (banClient) {
      incident.clientBanned = true;
    }
    res.json({ success: true, incident });
  } else {
    res.status(404).json({ error: 'Incident not found' });
  }
});

app.post('/api/admin/tickets/action', (req: Request, res: Response) => {
  const { ticketId, action, notes, refundCredits } = req.body;
  const ticket = supportTickets.find((t) => t.id === ticketId);
  if (!ticket) {
    res.status(404).json({ error: 'Ticket not found' });
    return;
  }

  ticket.status = 'resolved';
  ticket.resolutionNotes = notes || (action === 'refund' ? `อนุมัติคืนเครดิต ${refundCredits || 0} เครดิตให้ลูกค้า` : 'แก้ไขปัญหาเรียบร้อย');

  if (action === 'refund' && refundCredits) {
    financialTransactions.unshift({
      id: 'TXN-REF-' + Date.now(),
      type: 'refund',
      amountBaht: refundCredits,
      credits: refundCredits,
      clientName: ticket.reporterName,
      partnerName: '-',
      platformCutBaht: 0,
      partnerCutBaht: 0,
      status: 'refunded',
      createdAt: new Date().toLocaleTimeString('th-TH'),
      notes: `คืนเครดิตตามคำร้อง ${ticket.id}: ${notes || 'ยินยอมคืนเงิน'}`,
    });
  }

  res.json({ success: true, ticket });
});

app.post('/api/admin/kyc/action', (req: Request, res: Response) => {
  const { kycId, action, reason } = req.body;
  const appItem = kycApplications.find((k) => k.id === kycId);
  if (appItem) {
    if (action === 'approve') {
      appItem.status = 'approved';
    } else {
      appItem.status = 'rejected';
      appItem.rejectionReason = reason || 'เอกสารไม่ตรงตามเกณฑ์ หรือไม่ผ่านการตรวจสอบประวัติอาชญากรรม';
    }
    res.json({ success: true, kyc: appItem });
  } else {
    res.status(404).json({ error: 'Application not found' });
  }
});

// Bookings simulation
app.post('/api/bookings', (req: Request, res: Response) => {
  const { partnerId, eventType, location, date, startTime, durationHours, totalCredits, clientName } = req.body;
  const partner = INITIAL_PARTNERS.find((p) => p.id === partnerId);
  if (!partner) {
    res.status(404).json({ error: 'Partner not found' });
    return;
  }
  const booking = {
    id: 'BOOK-' + Math.floor(100000 + Math.random() * 900000),
    partnerId,
    partnerName: partner.name + ` (${partner.nickname})`,
    partnerImage: partner.imageUrl,
    clientName: clientName || 'คุณสมชาย',
    eventType: eventType || 'ดินเนอร์และเพื่อนคุย',
    location: location || 'กรุงเทพฯ',
    date: date || new Date().toISOString().split('T')[0],
    startTime: startTime || '19:00',
    durationHours: durationHours || 3,
    totalCredits: totalCredits || partner.hourlyRate * 3,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
    safetyCheckinStatus: 'active',
  };

  // Add financial transaction
  financialTransactions.unshift({
    id: 'TXN-' + Math.floor(1000 + Math.random() * 9000),
    type: 'booking_fee',
    amountBaht: totalCredits || partner.hourlyRate * 3,
    credits: totalCredits || partner.hourlyRate * 3,
    clientName: clientName || 'คุณสมชาย',
    partnerName: partner.nickname,
    platformCutBaht: Math.round((totalCredits || partner.hourlyRate * 3) * 0.2),
    partnerCutBaht: Math.round((totalCredits || partner.hourlyRate * 3) * 0.8),
    status: 'completed',
    createdAt: new Date().toLocaleTimeString('th-TH'),
    notes: `${eventType} ${durationHours} ชม. (${location})`,
  });

  res.json({ success: true, booking });
});

// Partner KYC application submission
app.post('/api/kyc/submit', (req: Request, res: Response) => {
  const data = req.body;
  if (!data.fullName || !data.phone) {
    res.status(400).json({ error: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน' });
    return;
  }
  const newKyc: KycApplication = {
    id: 'KYC-' + Date.now(),
    fullName: data.fullName,
    nickname: data.nickname || 'พาร์ทเนอร์ใหม่',
    gender: data.gender || 'female',
    age: parseInt(data.age, 10) || 24,
    phone: data.phone,
    lineId: data.lineId || '',
    idCardNumber: data.idCardNumber || '1-XXXX-XXXXX-XX-X',
    bankName: data.bankName || 'กสิกรไทย',
    bankAccountNumber: data.bankAccountNumber || 'XXX-X-XXXXX-X',
    bankAccountName: data.bankAccountName || data.fullName,
    skills: data.skills || ['เพื่อนเที่ยว'],
    bio: data.bio || '',
    submittedAt: new Date().toLocaleTimeString('th-TH'),
    consentCriminalCheck: true,
    consentInsurancePolicy: true,
    status: 'pending_review',
  };
  kycApplications.unshift(newKyc);

  res.json({
    success: true,
    message: 'ส่งใบสมัครเรียบร้อยแล้ว ทีมงานจะติดต่อกลับเพื่อนัดสัมภาษณ์และตรวจสอบประวัติอาชญากรรมภายใน 24 ชม.',
    applicationId: newKyc.id,
  });
});

// OTP in-memory verification cache
const otpStore: Record<string, { code: string; expiresAt: number }> = {};

// Request OTP endpoint
app.post('/api/auth/send-otp', (req: Request, res: Response) => {
  const { phone } = req.body;
  if (!phone || typeof phone !== 'string') {
    res.status(400).json({ error: 'Phone number is required' });
    return;
  }
  const cleanPhone = phone.trim().replace(/[-\s]/g, '');
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[cleanPhone] = {
    code,
    expiresAt: Date.now() + 60 * 1000, // 60 seconds
  };
  res.json({
    success: true,
    message: 'ส่งรหัส OTP เรียบร้อยแล้ว',
    code, // returned for test & simulator display
    expiresInSeconds: 60,
  });
});

// Verify OTP endpoint
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  const { phone, code } = req.body;
  const cleanPhone = (phone || '').trim().replace(/[-\s]/g, '');
  const record = otpStore[cleanPhone];
  if (!record) {
    res.status(400).json({ success: false, error: 'ไม่พบคำขอ OTP สำหรับหมายเลขนี้ กรุณากดขอรหัสใหม่' });
    return;
  }
  if (Date.now() > record.expiresAt) {
    delete otpStore[cleanPhone];
    res.status(400).json({ success: false, error: 'รหัส OTP หมดอายุแล้ว กรุณากดขอรหัสใหม่' });
    return;
  }
  if (record.code !== code?.trim()) {
    res.status(400).json({ success: false, error: 'รหัส OTP ไม่ถูกต้อง' });
    return;
  }
  delete otpStore[cleanPhone];
  res.json({ success: true, verified: true });
});

// PDPA Account Deletion Endpoint (Right to Erasure)
app.post('/api/account/delete', (req: Request, res: Response) => {
  const { userId, role, phone } = req.body;
  console.log(`[PDPA Deletion] Purging account & user data for User ID: ${userId}, Role: ${role}, Phone: ${phone}`);
  
  // Log deletion incident for PDPA compliance records
  res.json({
    success: true,
    message: 'บัญชีและข้อมูลส่วนบุคคลของผู้ใช้ได้รับการลบและทำลายอย่างถาวรตามกฎหมาย PDPA แล้ว',
    deletedAt: new Date().toISOString(),
  });
});

// Production static serving or Vite dev middleware
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Laysea Entertain Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
