require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkTableStructure(tableName) {
  console.log(`\nVérification de la structure de la table ${tableName}...`);
  
  // Récupérer les colonnes via une requête qui retourne les métadonnées
  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);
    
  if (error) {
    console.error(`❌ Erreur lors de la vérification de la table ${tableName}:`, error.message);
    return;
  }
  
  if (data && data.length > 0) {
    console.log(`✅ Structure de la table ${tableName}:`);
    console.log(Object.keys(data[0]));
  } else {
    console.log(`ℹ️ La table ${tableName} est vide, impossible de vérifier la structure`);
  }
}

async function checkRLSPolicies() {
  console.log('\nVérification des politiques RLS...');
  
  try {
    // Vérifier si le RLS est activé sur les tables
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('get_rls_status');
      
    if (rlsError) {
      console.log('ℹ️ Impossible de vérifier le statut RLS (fonction personnalisée non disponible)');
      return;
    }
    
    console.log('✅ Statut RLS des tables:');
    rlsStatus.forEach(table => {
      console.log(`   - ${table.table_name}: ${table.rls_enabled ? 'activé' : 'désactivé'}`);
    });
  } catch (err) {
    console.log('ℹ️ Impossible de vérifier le statut RLS:', err.message);
  }
}

async function main() {
  console.log('=== Vérification de la structure de la base de données ===\n');
  
  // Vérifier la structure des tables
  await checkTableStructure('profiles');
  await checkTableStructure('daily_logs');
  
  // Vérifier les politiques RLS
  await checkRLSPolicies();
  
  console.log('\n=== Vérification terminée ===');
}

main().catch(console.error);
