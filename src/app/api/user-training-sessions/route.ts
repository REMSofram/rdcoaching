import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Vérifier les variables d'environnement
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }

    // Créer un client Supabase avec la clé de service
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Récupérer l'ID de l'utilisateur à partir du token
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Récupérer le programme de l'utilisateur
    const { data: program, error: programError } = await supabase
      .from('programs')
      .select('id')
      .eq('client_id', user.id)
      .single();

    if (programError || !program) {
      return NextResponse.json([]);
    }

    // Récupérer les séances d'entraînement du programme
    const { data: trainingSessions, error: sessionsError } = await supabase
      .from('program_days')
      .select('day_title')
      .eq('program_id', program.id)
      .order('day_title', { ascending: true });

    if (sessionsError) {
      console.error('Erreur lors de la récupération des séances :', sessionsError);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des séances' },
        { status: 500 }
      );
    }

    // Si pas de séances trouvées, retourner un tableau vide
    if (!trainingSessions || trainingSessions.length === 0) {
      return NextResponse.json([]);
    }

    // Extraire les titres uniques
    const uniqueSessions = [...new Set(trainingSessions.map(session => session.day_title))];
    
    return NextResponse.json(uniqueSessions);
    
  } catch (error) {
    console.error('Erreur serveur :', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
