import { Metadata } from 'next';
import ClientLayout from '@/layout/ClientLayout';

export const metadata: Metadata = {
  title: 'Mon Espace Client - RD Coaching',
  description: 'Votre espace personnel de suivi de coaching',
};

export default function ClientRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
