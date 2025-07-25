// Ce script utilise l'API REST de Supabase pour vérifier la structure de la base de données
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Erreur: Les variables d\'environnement NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sont requises');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('Vérification de la structure de la base de données Supabase...\n');
  
  // 1. Vérifier la connexion et les tables
  try {
    // Vérifier si la table profiles existe
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Table profiles non trouvée ou erreur d\'accès:', profilesError.message);
    } else {
      console.log('✅ Table profiles accessible');
    }
    
    // Vérifier si la table daily_logs existe
    const { data: dailyLogs, error: logsError } = await supabase
      .from('daily_logs')
      .select('*')
      .limit(1);
    
    if (logsError) {
      console.log('❌ Table daily_logs non trouvée ou erreur d\'accès:', logsError.message);
    } else {
      console.log('✅ Table daily_logs accessible');
    }
    
    // Vérifier la relation entre les tables
    if (!profilesError && !logsError) {
      const { data: relations, error: relationError } = await supabase
        .from('daily_logs')
        .select('*, profiles(*)')
        .limit(1);
      
      if (relationError) {
        console.log('❌ Erreur lors de la vérification des relations:', relationError.message);
      } else {
        console.log('✅ Relation entre daily_logs et profiles vérifiée');
      }
    }
    
    // Vérifier si le type user_role existe
    try {
      const { data: enumTypes, error: enumError } = await supabase
        .rpc('pg_typeof', { type_name: 'user_role' });
      
      if (enumError) {
        console.log('ℹ️ Type user_role non trouvé ou erreur:', enumError.message);
      } else {
        console.log('✅ Type enum user_role trouvé');
      }
    } catch (e) {
      console.log('ℹ️ Impossible de vérifier le type user_role:', e.message);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la vérification de la base de données:', error.message);
  }
}

// Exécuter la vérification
checkDatabase();
