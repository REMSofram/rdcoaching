import { Metadata } from 'next';
import CoachLayout from '@/layout/CoachLayout';

export const metadata: Metadata = {
  title: 'Espace Coach - RD Coaching',
  description: 'Espace réservé aux coachs de RD Coaching',
};

export default function CoachRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CoachLayout>{children}</CoachLayout>;
}
