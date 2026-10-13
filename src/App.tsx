/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PhoneContainer } from './components/PhoneContainer';
import { AuthScreen } from './components/AuthScreen';
import { ClientPortal } from './components/ClientPortal';
import { PartnerPortal } from './components/PartnerPortal';
import { AdminPortal } from './components/AdminPortal';
import { UserSession, Partner, Booking } from './types';
import { INITIAL_PARTNERS } from './data/partners';

export default function App() {
  // Authentication session (null means user must log in or sign up first)
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  // Client data states
  const [userCredits, setUserCredits] = useState<number>(2500);
  const [partners, setPartners] = useState<Partner[]>(INITIAL_PARTNERS);
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'BOOK-891234',
      partnerId: 'partner-1',
      partnerName: 'พิมพ์ชนก วัฒนา (น้องพิมพ์)',
      partnerImage: INITIAL_PARTNERS[0].imageUrl,
      clientName: 'คุณสมชาย นรินทร์',
      eventType: 'ไปงานแต่งงาน / ควงออกงานสังคม',
      location: 'โรงแรมสยาม เคมปินสกี้ กรุงเทพฯ',
      date: '2026-10-18',
      startTime: '18:00',
      durationHours: 3,
      totalCredits: 2400,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      safetyCheckinStatus: 'active',
    },
  ]);

  // Credit deduction handler
  const handleDeductCredits = (amount: number, _reason: string): boolean => {
    if (userCredits < amount) {
      alert(`เครดิตของคุณไม่เพียงพอ (ต้องการ ${amount} เครดิต)`);
      return false;
    }
    setUserCredits((prev) => prev - amount);
    return true;
  };

  // Credit top-up handler
  const handleTopUpCredits = (amount: number, _label: string) => {
    setUserCredits((prev) => prev + amount);
  };

  // Booking confirmation handler
  const handleConfirmBooking = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
  };

  // SOS trigger handler
  const handleTriggerSos = async (threat: string) => {
    try {
      await fetch('/api/sos/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerName: userSession?.name || 'พาร์ทเนอร์ในภารกิจ',
          message: threat,
          location: 'สุขุมวิท / ทองหล่อ กรุงเทพฯ',
        }),
      });
    } catch (err) {
      console.error('Failed to trigger SOS:', err);
    }
  };

  // Quick role switcher for testing convenience
  const handleSwitchRole = (newRole: 'client' | 'partner' | 'admin') => {
    if (newRole === 'client') {
      setUserSession({
        id: 'USR-CLIENT-01',
        name: 'คุณสมชาย นรินทร์',
        role: 'client',
        phone: '089-112-2334',
        credits: userCredits,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      });
    } else if (newRole === 'partner') {
      setUserSession({
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
      setUserSession({
        id: 'USR-ADMIN-01',
        name: 'ผู้ดูแลระบบ (Super Admin)',
        role: 'admin',
        phone: '02-LAYSEA-SOS',
        email: 'admin@laysea.com',
      });
    }
  };

  const handleUpdateAvatar = (newAvatarUrl: string) => {
    if (userSession) {
      setUserSession({ ...userSession, avatarUrl: newAvatarUrl });
    }
  };

  // Account and Data Deletion Handler (PDPA Right to Erasure)
  const handleDeleteAccount = async () => {
    if (!userSession) return;
    try {
      await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userSession.id,
          role: userSession.role,
          phone: userSession.phone,
        }),
      });
    } catch (e) {
      console.error('Failed to call delete account API:', e);
    }
    alert('ระบบได้ทำการลบบัญชีและทำลายข้อมูลผู้ใช้ของคุณตามข้อกำหนด PDPA เรียบร้อยแล้ว');
    setUserSession(null);
  };

  return (
    <PhoneContainer
      userSession={userSession}
      onLogout={() => setUserSession(null)}
      onSwitchRole={handleSwitchRole}
    >
      {/* 1. Unauthenticated State: Mandatory Login or Sign Up with role choice */}
      {!userSession ? (
        <AuthScreen onLogin={(session) => setUserSession(session)} />
      ) : userSession.role === 'client' ? (
        /* 2. Client View: Only sees partner catalog, AI manager, bookings & wallet */
        <ClientPortal
          userSession={userSession}
          partners={partners}
          userCredits={userCredits}
          bookings={bookings}
          onLogout={() => setUserSession(null)}
          onDeductCredits={handleDeductCredits}
          onTopUpCredits={handleTopUpCredits}
          onConfirmBooking={handleConfirmBooking}
          onTriggerSos={handleTriggerSos}
          onUpdateAvatar={handleUpdateAvatar}
          onDeleteAccount={handleDeleteAccount}
        />
      ) : userSession.role === 'partner' ? (
        /* 3. Partner View: Only sees gigs, safety check-in, earnings & persistent SOS */
        <PartnerPortal
          userSession={userSession}
          onLogout={() => setUserSession(null)}
          onTriggerSos={handleTriggerSos}
          onUpdateAvatar={handleUpdateAvatar}
          onDeleteAccount={handleDeleteAccount}
        />
      ) : (
        /* 4. Admin View: Financial dashboard, Google Sheets export, safety & support solver */
        <AdminPortal onLogout={() => setUserSession(null)} />
      )}
    </PhoneContainer>
  );
}
