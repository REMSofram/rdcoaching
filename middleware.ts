import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Récupérer la session utilisateur
  const { data: { session } } = await supabase.auth.getSession();
  const url = new URL(request.url);

  // Si l'utilisateur n'est pas connecté et n'est pas sur une page d'authentification
  if (!session && !url.pathname.startsWith('/auth')) {
    // Rediriger vers la page de connexion avec l'URL de redirection
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirectedFrom', url.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si l'utilisateur est connecté
  if (session) {
    // Récupérer le profil utilisateur
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_onboarded')
      .eq('id', session.user.id)
      .single();

    // Si le profil n'existe pas ou si l'onboarding n'est pas complété
    // et que l'utilisateur n'est pas déjà sur la page d'onboarding
    if ((!profile || !profile.is_onboarded) && url.pathname !== '/onboarding') {
      // Rediriger vers la page d'onboarding
      const onboardingUrl = new URL('/onboarding', request.url);
      // Si l'utilisateur était sur une autre page, on la sauvegarde pour rediriger après l'onboarding
      if (url.pathname !== '/') {
        onboardingUrl.searchParams.set('redirectTo', url.pathname);
      }
      return NextResponse.redirect(onboardingUrl);
    }

    // Si l'utilisateur est déjà sur la page d'onboarding mais a déjà complété son profil
    if (profile?.is_onboarded && url.pathname === '/onboarding') {
      // Rediriger vers le tableau de bord approprié
      const isCoach = session.user.email === 'remy.denay6@gmail.com';
      const dashboardUrl = new URL(isCoach ? '/coach/dashboard' : '/client/suivi', request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Si l'utilisateur est connecté et essaie d'accéder à une page d'authentification
    if (url.pathname.startsWith('/auth')) {
      // Rediriger vers le tableau de bord approprié
      const isCoach = session.user.email === 'remy.denay6@gmail.com';
      const dashboardUrl = new URL(isCoach ? '/coach/dashboard' : '/client/suivi', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth/callback (auth callbacks)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth/callback).*)',
  ],
};
