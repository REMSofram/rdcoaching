# README BDD - Documentation Base de Données

## Vue d'ensemble
Cette documentation présente la structure de la base de données, incluant les schémas, tables, politiques de sécurité (RLS) et triggers.

---

## 📊 Structure des Schémas et Tables

### Schema `auth`
- **Table :** `users`
  - Gestion de l'authentification des utilisateurs
  - Référence : `auth.users.id`

### Schema `public`

#### Table `daily_logs`
Stockage des journaux quotidiens des utilisateurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Identifiant unique (PK) |
| `client_id` | uuid | Référence vers l'utilisateur |
| `weight` | numeric | Poids enregistré |
| `energy_level` | int4 | Niveau d'énergie |
| `sleep_quality` | int4 | Qualité du sommeil |
| `appetite` | text | État de l'appétit |
| `notes` | text | Notes personnelles |
| `created_at` | timestamptz | Date de création |
| `log_date` | date | Date du journal |
| `training_type` | text | Type d'entraînement |
| `plaisir_seance` | int4 | Évaluation du plaisir de la séance |

#### Table `profiles`
Profils détaillés des utilisateurs.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | uuid | Identifiant unique (PK) → `auth.users.id` |
| `email` | text | Adresse email |
| `first_name` | text | Prénom |
| `last_name` | text | Nom de famille |
| `birth_date` | date | Date de naissance |
| `height` | numeric | Taille |
| `phone` | text | Numéro de téléphone |
| `starting_weight` | numeric | Poids de départ |
| `sports_practiced` | text | Sports pratiqués |
| `objectives` | text | Objectifs personnels |
| `injuries` | text | Blessures/limitations |
| `role` | user_role | Rôle de l'utilisateur |
| `is_onboarded` | bool | État d'intégration |
| `created_at` | timestamptz | Date de création |
| `updated_at` | timestamptz | Dernière mise à jour |

---

## 🔒 Politiques de Sécurité (RLS)

### Schema `public` - Table `daily_logs`

#### 1. Admin full access
- **Commande :** `ALL`
- **Rôle :** `{public}`
- **Condition :** `(auth.email() = 'remy.denay@gmail.com'::text)`
- **Vérification :** `NULL`

#### 2. Allow insert own logs
- **Commande :** `INSERT`
- **Rôle :** `{authenticated}`
- **Condition :** `NULL`
- **Vérification :** `(auth.uid() = client_id)`

#### 3. Allow read access to own logs
- **Commande :** `SELECT`
- **Rôle :** `{public}`
- **Condition :** `(auth.uid() = client_id)`
- **Vérification :** `NULL`

#### 4. Allow update to own logs
- **Commande :** `UPDATE`
- **Rôle :** `{public}`
- **Condition :** `(auth.uid() = client_id)`
- **Vérification :** `NULL`

### Schema `public` - Table `profiles`

#### 1. Allow insert for authenticated users
- **Commande :** `INSERT`
- **Rôle :** `{authenticated}`
- **Condition :** `NULL`
- **Vérification :** `true`

#### 2. Allow read access to own profile
- **Commande :** `SELECT`
- **Rôle :** `{public}`
- **Condition :** `(auth.uid() = id)`
- **Vérification :** `NULL`

#### 3. Allow update to own profile
- **Commande :** `UPDATE`
- **Rôle :** `{public}`
- **Condition :** `(auth.uid() = id)`
- **Vérification :** `(auth.uid() = id)`

#### 4. Allow coaches to view all profiles
- **Commande :** `SELECT`
- **Rôle :** `{public}`
- **Condition :** `(auth.jwt() ->> 'email'::text) = 'remy.denay6@gmail.com'::text`
- **Vérification :** `NULL`

#### 5. Allow coaches to update client profiles
- **Commande :** `UPDATE`
- **Rôle :** `{public}`
- **Condition :** `EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND email = 'remy.denay6@gmail.com')`
- **Vérification :** `NOT (auth.uid() = id)`

---

## ⚡ Triggers

### Schema `auth` - Table `users`

#### `on_auth_user_created`
- **Événement :** `INSERT`
- **Timing :** `AFTER`
- **Action :** `EXECUTE FUNCTION handle_new_user()`
- **Description :** Déclenché après la création d'un nouvel utilisateur pour initialiser son profil

### Schema `public` - Table `daily_logs`

#### `update_daily_logs_modtime`
- **Événement :** `UPDATE`
- **Timing :** `BEFORE`
- **Action :** `EXECUTE FUNCTION update_modified_column()`
- **Description :** Met à jour automatiquement la colonne de modification lors des updates

### Schema `public` - Table `profiles`

#### `update_profiles_modtime`
- **Événement :** `UPDATE`
- **Timing :** `BEFORE`
- **Action :** `EXECUTE FUNCTION update_modified_column()`
- **Description :** Met à jour automatiquement la colonne de modification lors des updates

### Schema `realtime` - Table `subscription`

#### `tr_check_filters` (INSERT)
- **Événement :** `INSERT`
- **Timing :** `BEFORE`
- **Action :** `EXECUTE FUNCTION realtime.subscription_check_filters()`

#### `tr_check_filters` (UPDATE)
- **Événement :** `UPDATE`
- **Timing :** `BEFORE`
- **Action :** `EXECUTE FUNCTION realtime.subscription_check_filters()`

### Schema `storage` - Table `objects`

#### `update_objects_updated_at`
- **Événement :** `UPDATE`
- **Timing :** `BEFORE`
- **Action :** `EXECUTE FUNCTION storage.update_updated_at_column()`
- **Description :** Gère la mise à jour automatique des timestamps pour les objets de stockage

---

## 🔑 Points Clés de Sécurité

1. **Row Level Security (RLS) activé** sur toutes les tables principales
2. **Accès admin complet** pour `remy.denay@gmail.com`
3. **Isolation des données** : chaque utilisateur ne peut accéder qu'à ses propres données
4. **Authentification requise** pour les opérations d'insertion
5. **Gestion automatique des timestamps** via les triggers

---

## 📝 Notes Techniques

- **Base de données :** PostgreSQL avec Supabase
- **Authentification :** Supabase Auth
- **Types personnalisés :** `user_role` pour la gestion des rôles
- **Timestamps :** Gestion automatique via triggers
- **Relations :** Foreign keys vers `auth.users.id`

---

## 🚀 Utilisation

Cette structure permet :
- ✅ Gestion sécurisée des utilisateurs
- ✅ Journalisation quotidienne personnalisée
- ✅ Profils utilisateurs complets
- ✅ Accès contrôlé par utilisateur
- ✅ Administration centralisée
- ✅ Mises à jour automatiques des métadonnées