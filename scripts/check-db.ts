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
    console.log('\n🔍 Vérification des politiques RLS...');
    
    // Vérifier les politiques RLS pour les tables importantes
    const tablesToCheck = ['profiles', 'daily_logs', 'coach_clients'];
    let hasPolicies = false;
    
    for (const table of tablesToCheck) {
      try {
        // Vérifier si la table a le RLS activé
        const { data: rlsStatus, error: rlsError } = await supabase
          .from('pg_tables')
          .select('*')
          .eq('schemaname', 'public')
          .eq('tablename', table)
          .single();
          
        if (rlsError || !rlsStatus) {
          console.error(`❌ Impossible de vérifier le statut RLS pour la table ${table}:`, rlsError);
          continue;
        }
        
        // Vérifier les politiques RLS spécifiques
        const { data: policies, error: policiesError } = await supabase
          .from('pg_policies')
          .select('*')
          .eq('schemaname', 'public')
          .eq('tablename', table);
          
        if (policiesError) {
          console.error(`❌ Erreur lors de la récupération des politiques pour ${table}:`, policiesError);
          continue;
        }
        
        if (policies && policies.length > 0) {
          if (!hasPolicies) {
            console.log('✅ Politiques RLS configurées:');
            hasPolicies = true;
          }
          console.log(`   - Table: ${table}`);
          policies.forEach((policy: any) => {
            console.log(`     • ${policy.policyname}: ${policy.cmd} (${policy.roles.join(', ')})`);
            console.log(`       Condition: ${policy.qual || 'Aucune condition'}`);
          });
        } else {
          console.log(`ℹ️ Aucune politique RLS trouvée pour la table ${table}`);
        }
      } catch (err) {
        console.error(`Erreur lors de la vérification des politiques pour ${table}:`, err);
      }
    }
    
    if (!hasPolicies) {
      console.log('ℹ️ Aucune politique RLS trouvée pour les tables vérifiées');
    }
    
  } catch (err) {
    console.error('Erreur lors de la vérification des politiques RLS:', err);
  }
}

// Exécuter la vérification
checkDatabase().catch(console.error);
