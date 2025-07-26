import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  console.log(`[Middleware] Début du traitement pour: ${request.nextUrl.pathname}`);
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  
  // Ajouter un en-tête de réponse personnalisé pour le débogage
  response.headers.set('x-middleware-path', request.nextUrl.pathname);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  try {
    // Refresh session if expired - required for Server Components
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    // En cas d'erreur de session (comme un token invalide), déconnecter l'utilisateur
    if (sessionError) {
      console.error('Erreur de session:', sessionError);
      // Supprimer les cookies d'authentification
      response.cookies.delete('sb-access-token');
      response.cookies.delete('sb-refresh-token');
      
      // Rediriger vers la page de connexion si ce n'est pas déjà une page d'authentification
      if (!request.nextUrl.pathname.startsWith('/auth')) {
        const loginUrl = new URL('/auth/login', request.url);
        loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }
      return response;
    }
    
    // Si l'utilisateur n'est pas connecté et tente d'accéder à des routes protégées
    if (!session) {
      // Autoriser l'accès aux pages d'authentification
      if (request.nextUrl.pathname.startsWith('/auth')) {
        return response;
      }
      // Rediriger vers la page de connexion pour les routes protégées
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Si l'utilisateur est connecté
    if (session) {
      console.log('[Middleware] Session utilisateur trouvée:', { 
        email: session.user.email, 
        emailConfirmed: !!session.user.email_confirmed_at,
        path: request.nextUrl.pathname
      });
      
      // 1. Si l'email n'est pas confirmé, rediriger vers la page de vérification
      if (!session.user.email_confirmed_at) {
        console.log('[Middleware] Email non confirmé, vérification nécessaire');
        // Autoriser l'accès à la page de vérification et aux assets
        if (
          request.nextUrl.pathname.startsWith('/auth/verify-email') ||
          request.nextUrl.pathname.startsWith('/_next') ||
          request.nextUrl.pathname.startsWith('/favicon.ico')
        ) {
          return response;
        }
        // Rediriger vers la page de vérification d'email
        return NextResponse.redirect(new URL('/auth/verify-email', request.url));
      }

      // 2. Vérifier si l'utilisateur est un coach
      const isCoach = session.user.email === 'remy.denay6@gmail.com';
      console.log(`[Middleware] Rôle de l'utilisateur: ${isCoach ? 'coach' : 'client'}`);

      // 3. Si l'utilisateur est sur la page d'accueil, le rediriger vers le tableau de bord approprié
      if (request.nextUrl.pathname === '/') {
        console.log('[Middleware] Redirection depuis la page d\'accueil');
        const redirectPath = isCoach ? '/coach/dashboard' : '/client/dashboard';
        return NextResponse.redirect(new URL(redirectPath, request.url));
      }

      // 4. Si l'utilisateur n'est pas un coach, vérifier s'il a terminé l'onboarding
      if (!isCoach) {
        console.log('[Middleware] Vérification de l\'onboarding pour le client');
        // Vérifier si l'utilisateur a terminé l'onboarding
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_onboarded')
          .eq('id', session.user.id)
          .single();

        if (error) throw error;
        
        const isOnboarded = profile?.is_onboarded || false;

        // Si l'utilisateur n'a pas terminé l'onboarding, le rediriger vers la page d'onboarding
        if (!isOnboarded && !request.nextUrl.pathname.startsWith('/onboarding') && !request.nextUrl.pathname.startsWith('/_next')) {
          console.log('[Middleware] Redirection vers la page d\'onboarding');
          return NextResponse.redirect(new URL('/onboarding', request.url));
        } else {
          console.log('[Middleware] Onboarding déjà effectué ou page d\'onboarding actuelle');
        }
      }
    }
  } catch (error) {
    console.error('Erreur dans le middleware:', error);
    // En cas d'erreur, rediriger vers la page d'accueil
    return NextResponse.redirect(new URL('/', request.url));
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
     * - api/auth (auth routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};
