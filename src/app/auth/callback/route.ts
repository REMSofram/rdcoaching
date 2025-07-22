import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/onboarding';

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.exchangeCodeForSession(code);
    
    if (session?.user) {
      // Vérifier si l'utilisateur est un coach
      const isCoach = session.user.email === 'remy.denay6@gmail.com';
      
      // Si c'est un coach, rediriger directement vers le dashboard coach
      if (isCoach) {
        return NextResponse.redirect(new URL('/coach/dashboard', request.url));
      }
      
      // Pour les non-coachs, vérifier l'état d'onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_onboarded')
        .eq('id', session.user.id)
        .single();

      // Si l'utilisateur n'a pas complété l'onboarding, on le redirige vers la page d'onboarding
      if (!profile?.is_onboarded) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }

      // Sinon, on le redirige vers le tableau de bord client
      return NextResponse.redirect(new URL('/client/dashboard', request.url));
    }
  }

  // Redirection par défaut si quelque chose ne va pas
  return NextResponse.redirect(new URL(next, request.url));
}
