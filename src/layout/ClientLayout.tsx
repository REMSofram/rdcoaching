"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Home, Calendar, BarChart2, MessageSquare, User, Target } from 'lucide-react';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, icon, label, isActive }) => (
  <Link
    href={href}
    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <span className="mr-3">{icon}</span>
    {label}
  </Link>
);

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/client/dashboard', icon: <Home size={20} />, label: 'Accueil' },
    { href: '/client/goals', icon: <Target size={20} />, label: 'Mes objectifs' },
    { href: '/client/progress', icon: <BarChart2 size={20} />, label: 'Ma progression' },
    { href: '/client/calendar', icon: <Calendar size={20} />, label: 'Mon planning' },
    { href: '/client/messages', icon: <MessageSquare size={20} />, label: 'Messages' },
    { href: '/client/profile', icon: <User size={20} />, label: 'Mon profil' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 mb-8">
              <h1 className="text-xl font-bold text-primary">Mon Espace Client</h1>
            </div>
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname?.startsWith(item.href) || false}
                />
              ))}
            </nav>
          </div>
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={async () => {
                const { signOut } = await import('@/lib/auth');
                await signOut();
                window.location.href = '/';
              }}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
            >
              <LogOut className="mr-3" size={20} />
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 overflow-y-auto focus:outline-none bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
