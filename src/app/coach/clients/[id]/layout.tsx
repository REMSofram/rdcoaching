import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profil Client - Coach',
  description: 'Détails du client et suivi',
};

export default function ClientProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
