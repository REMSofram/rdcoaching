import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const BodySchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
    }

    const { email } = parsed.data;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }

    // 1. Create a server client with service role
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
    
    // 2. Send invitation email with magic link
    const redirectUrl = new URL('/auth/create-account', process.env.NEXT_PUBLIC_SITE_URL).toString();
    
    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: redirectUrl,
      data: { 
        role: 'client',
        invited_at: new Date().toISOString(),
        email: email
      }
    });
    
    console.log('Invitation envoyée à:', email, 'Redirection vers:', redirectUrl);

    if (error) {
      console.error('Erreur lors de l\'envoi du lien magique:', error);
      return NextResponse.json(
        { error: 'Erreur lors de l\'envoi du lien d\'invitation' },
        { status: 500 }
      );
    }

    // 3. Create/update profile
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    const user = users?.find((u) => u.email === email);
    
    if (user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: email,
          role: 'client',
          is_onboarded: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Erreur lors de la création du profil:', profileError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'invitation:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'envoi de l\'invitation' },
      { status: 500 }
    );
  }
}
