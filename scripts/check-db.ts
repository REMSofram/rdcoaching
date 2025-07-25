import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/database.types';

// Ce script nécessite que les variables d'environnement soient chargées
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

async function checkDatabase() {
  console.log('Vérification de la structure de la base de données...\n');
  
  // 1. Vérifier le type enum user_role
  try {
    const { data: enumTypes, error } = await supabase
      .rpc('pg_typeof', { type_name: 'user_role' });
      
    if (error) {
      console.error('Erreur lors de la vérification du type enum user_role:', error);
    } else {
      console.log('✅ Type enum user_role vérifié avec succès');
    }
  } catch (err) {
    console.error('Erreur inattendue:', err);
  }
  
  // 2. Vérifier la structure des tables
  await checkTable('profiles');
  await checkTable('daily_logs');
  
  // 3. Vérifier les relations
  await checkRelations();
  
  // 4. Vérifier les politiques RLS
  await checkRLSPolicies();
}

async function checkTable(tableName: string) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
      
    if (error) {
      console.error(`❌ Erreur lors de la vérification de la table ${tableName}:`, error);
    } else {
      console.log(`✅ Table ${tableName} accessible`);
    }
  } catch (err) {
    console.error(`Erreur lors de la vérification de la table ${tableName}:`, err);
  }
}

async function checkRelations() {
  // Vérifier la relation entre daily_logs et profiles
  try {
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*, profiles(*)')
      .limit(1);
      
    if (error) {
      console.error('❌ Erreur lors de la vérification des relations:', error);
    } else {
      console.log('✅ Relations entre les tables vérifiées');
    }
  } catch (err) {
    console.error('Erreur lors de la vérification des relations:', err);
  }
}

async function checkRLSPolicies() {
  try {
    const { data, error } = await supabase
      .rpc('get_rls_policies');
      
    if (error) {
      console.error('❌ Erreur lors de la vérification des politiques RLS:', error);
    } else if (data && data.length > 0) {
      console.log('✅ Politiques RLS configurées pour les tables:');
      data.forEach((policy: any) => {
        console.log(`   - ${policy.schemaname}.${policy.tablename}: ${policy.policyname}`);
      });
    } else {
      console.log('ℹ️ Aucune politique RLS trouvée');
    }
  } catch (err) {
    console.error('Erreur lors de la vérification des politiques RLS:', err);
  }
}

// Exécuter la vérification
checkDatabase().catch(console.error);
