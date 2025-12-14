import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Skip middleware for create-account page to allow invitation flow
  if (request.nextUrl.pathname === '/auth/create-account') {
    console.log('[Middleware] Skipping auth check for /auth/create-account');
    return NextResponse.next();
  }

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
    // Exception pour le compte coach principal
    if (session.user.email === 'remy.denay6@gmail.com') {
      return NextResponse.next();
    }
    
    // Ajouter des en-têtes de débogage
    const debugHeaders = new Headers(response.headers);
    debugHeaders.set('x-debug-user-id', session.user.id);
    debugHeaders.set('x-debug-user-email', session.user.email || 'no-email');
    
    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    // Ajouter des informations de débogage sur le profil
    debugHeaders.set('x-debug-has-profile', profile ? 'true' : 'false');
    debugHeaders.set('x-debug-is-onboarded', profile?.is_onboarded ? 'true' : 'false');
    debugHeaders.set('x-debug-profile-error', profileError?.message || 'no-error');

    // Si le profil n'existe pas ou si l'onboarding n'est pas complété
    // et que l'utilisateur n'est pas déjà sur la page d'onboarding ou de création de compte
    if ((!profile || profile.is_onboarded === false) && url.pathname !== '/onboarding' && url.pathname !== '/auth/create-account' && !url.pathname.startsWith('/_next/')) {
      // Ajouter plus d'informations de débogage
      debugHeaders.set('x-debug-redirect-reason', 'onboarding-required');
      debugHeaders.set('x-debug-profile-data', JSON.stringify(profile || {}));
      
      // Créer une nouvelle réponse avec les en-têtes de débogage
      const newResponse = NextResponse.next({
        request: {
          headers: request.headers,
        },
      });
      
      // Copier les en-têtes de débogage vers la nouvelle réponse
      debugHeaders.forEach((value, key) => {
        newResponse.headers.set(key, value);
      });
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
    if (url.pathname.startsWith('/auth') && url.pathname !== '/auth/create-account') {
      // Vérifier si l'utilisateur a complété l'onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_onboarded')
        .eq('id', session.user.id)
        .single();
      
      // Si l'onboarding n'est pas complété, rediriger vers l'onboarding
      if (!profile?.is_onboarded) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
      
      // Sinon, rediriger vers le tableau de bord approprié
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
     * - api/ (all API routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/).*)',
  ],
};
