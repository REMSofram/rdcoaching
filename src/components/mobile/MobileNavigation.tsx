"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Activity, Dumbbell, Utensils, Calendar, LogOut, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase/client";

// Simple Skeleton component since we don't have the UI library
const Skeleton = ({ className = "", ...props }: { className?: string } & React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={`animate-pulse bg-slate-200 rounded ${className}`}
    {...props}
  />
);

// Default profile picture component
const DefaultProfileIcon = ({ className = "" }: { className?: string }) => (
  <div className={`rounded-full bg-slate-100 flex items-center justify-center ${className}`}>
    <UserIcon className="h-1/2 w-1/2 text-slate-400" />
  </div>
);

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
}

export default function MobileNavigation() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isActive = (href: string) => pathname === href;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('id, first_name, last_name, profile_picture_url')
            .eq('id', user.id)
            .single();
            
          if (profile) {
            setUserProfile(profile);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <>
      {/* Bottom navigation (mobile only) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white md:hidden">
        <div className="mx-auto max-w-screen-sm grid grid-cols-5">
          <Link
            href="/client/suivi"
            className={`flex flex-col items-center justify-center py-2 text-xs ${
              isActive("/client/suivi") ? "text-slate-900" : "text-slate-500"
            }`}
          >
            <Activity className="h-5 w-5" />
            <span>Suivi</span>
          </Link>
          <Link
            href="/client/programme"
            className={`flex flex-col items-center justify-center py-2 text-xs ${
              isActive("/client/programme") ? "text-slate-900" : "text-slate-500"
            }`}
          >
            <Dumbbell className="h-5 w-5" />
            <span>Programme</span>
          </Link>
          <Link
            href="/client/nutrition"
            className={`flex flex-col items-center justify-center py-2 text-xs ${
              isActive("/client/nutrition") ? "text-slate-900" : "text-slate-500"
            }`}
          >
            <Utensils className="h-5 w-5" />
            <span>Nutrition</span>
          </Link>
          <Link
            href="/client/calendrier"
            className={`flex flex-col items-center justify-center py-2 text-xs ${
              isActive("/client/calendrier") ? "text-slate-900" : "text-slate-500"
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>Calendrier</span>
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center justify-center py-2 text-xs text-slate-500"
            aria-label="Profil"
          >
            {loading ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : userProfile?.profile_picture_url ? (
              <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-slate-200">
                <Image
                  src={userProfile.profile_picture_url}
                  alt={`${userProfile.first_name} ${userProfile.last_name}`}
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = '';
                    target.className = 'h-8 w-8 text-slate-400';
                    target.parentElement!.innerHTML = (
                      '<div class="h-full w-full bg-slate-100 flex items-center justify-center">' +
                      `<UserIcon class="h-5 w-5 text-slate-400" />` +
                      '</div>'
                    );
                  }}
                />
              </div>
            ) : (
              <DefaultProfileIcon className="h-8 w-8" />
            )}
          </button>
        </div>
      </nav>

      {/* Profil overlay menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-black/40 transition-opacity duration-300" 
            onClick={() => setMenuOpen(false)} 
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl overflow-hidden transform transition-transform duration-300 ease-out">
            {/* Header with user info */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-4">
                {loading ? (
                  <Skeleton className="h-16 w-16 rounded-full" />
                ) : userProfile?.profile_picture_url ? (
                  <div className="h-16 w-16 rounded-full overflow-hidden border-4 border-white shadow-sm">
                    <Image
                      src={userProfile.profile_picture_url}
                      alt={`${userProfile.first_name} ${userProfile.last_name}`}
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = '';
                        target.className = 'h-16 w-16 text-slate-300';
                        target.parentElement!.innerHTML = (
                          '<div class="h-full w-full bg-slate-100 flex items-center justify-center rounded-full">' +
                          `<UserIcon class="h-8 w-8 text-slate-400" />` +
                          '</div>'
                        );
                      }}
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16">
                    <DefaultProfileIcon className="h-full w-full" />
                  </div>
                )}
                <div>
                  {loading ? (
                    <>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </>
                  ) : (
                    <h3 className="font-semibold text-lg text-slate-800">
                      {userProfile?.first_name} {userProfile?.last_name}
                    </h3>
                  )}
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="p-4 space-y-3">
              <Link 
                href="/client/profile" 
                className="flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Mon compte</p>
                  <p className="text-sm text-slate-500">Gérez vos informations personnelles</p>
                </div>
              </Link>
              
              <Link 
                href="/client/settings" 
                className="flex items-center gap-3 p-4 rounded-xl hover:bg-slate-50 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-slate-800">Paramètres</p>
                  <p className="text-sm text-slate-500">Personnalisez votre expérience</p>
                </div>
              </Link>
            </div>

            {/* Logout button */}
            <div className="p-4 border-t border-slate-100">
              <button
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
                onClick={async () => {
                  const { signOut } = await import("@/lib/auth");
                  await signOut();
                  window.location.href = "/";
                }}
              >
                <LogOut className="h-5 w-5" />
                <span>Déconnexion</span>
              </button>
            </div>

            {/* Close button */}
            <div className="p-4 pt-0">
              <button
                onClick={() => setMenuOpen(false)}
                className="w-full py-3 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                aria-label="Fermer le menu"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
