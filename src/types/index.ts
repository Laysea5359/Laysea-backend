export type Gender = 'female' | 'male';
export type UserRole = 'client' | 'partner' | 'admin';

export interface UserSession {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  email?: string;
  avatarUrl?: string;
  credits?: number;
  partnerProfileId?: string;
  kycStatus?: 'verified' | 'pending' | 'unverified';
}

export interface Partner {
  id: string;
  name: string;
  nickname: string;
  gender: Gender;
  age: number;
  height: number;
  weight: number;
  rating: number;
  reviewsCount: number;
  hourlyRate: number; // in credits
  vdoCallRate: number; // in credits (default 150)
  location: string;
  areas: string[];
  imageUrl: string;
  galleryImages: string[];
  bio: string;
  skills: string[];
  vibeTags: string[];
  personality: string;
  drinkingSkill: 'ไม่ดื่ม' | 'ดื่มเป็นเพื่อน' | 'ชงเก่ง/ปาร์ตี้';
  languages: string[];
  verifiedKyc: boolean;
  criminalCheckPassed: boolean;
  insuranceProtected: boolean;
  isOnline: boolean;
  completedJobs: number;
  availableDays: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  isSosAlert?: boolean;
  isViolationWarning?: boolean;
  matchedPartnerIds?: string[];
  recommendedAction?: 'vdo_call' | 'browse' | 'kyc' | 'sos';
}

export interface Booking {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerImage: string;
  clientName?: string;
  clientPhone?: string;
  eventType: string;
  location: string;
  venueName?: string;
  date: string;
  startTime: string;
  durationHours: number;
  totalCredits: number;
  status: 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: string;
  safetyCheckinStatus: 'active' | 'checked_in' | 'sos';
  // Live GPS Meetup & In-Job Safety Tracking
  clientLocation?: {
    lat: number;
    lng: number;
    name: string;
  };
  partnerLocation?: {
    lat: number;
    lng: number;
    name: string;
  };
  meetupStatus?: 'heading_to_meetup' | 'arrived_at_venue' | 'in_session' | 'completed';
  etaMinutes?: number;
  distanceKm?: number;
  lastGpsPing?: string;
}

export interface KycApplication {
  id: string;
  fullName: string;
  nickname: string;
  gender: Gender;
  age: number;
  phone: string;
  lineId: string;
  idCardNumber: string;
  bankName: string;
  bankAccountNumber: string;
  bankAccountName: string;
  skills: string[];
  bio: string;
  submittedAt: string;
  consentCriminalCheck: boolean;
  consentInsurancePolicy: boolean;
  status: 'pending_review' | 'interview_scheduled' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface SosIncident {
  id: string;
  partnerName: string;
  location: string;
  latitude: number;
  longitude: number;
  message: string;
  timestamp: string;
  status: 'dispatched' | 'investigating' | 'resolved';
  policeStation?: string;
  suspectClientName?: string;
  clientBanned?: boolean;
  resolutionNotes?: string;
}

export interface FinancialTransaction {
  id: string;
  type: 'booking_fee' | 'vdo_call' | 'top_up' | 'partner_payout' | 'refund';
  amountBaht: number;
  credits: number;
  clientName: string;
  partnerName: string;
  platformCutBaht: number;
  partnerCutBaht: number;
  status: 'completed' | 'refunded' | 'pending';
  createdAt: string;
  notes: string;
}

export interface CustomerSupportTicket {
  id: string;
  reporterType: 'client' | 'partner';
  reporterName: string;
  category: 'sexual_harassment' | 'refund_request' | 'not_as_pictured' | 'off_platform_warning' | 'other';
  subject: string;
  description: string;
  status: 'open' | 'in_investigation' | 'resolved';
  priority: 'urgent' | 'high' | 'medium';
  createdAt: string;
  resolutionNotes?: string;
  bookingId?: string;
}
