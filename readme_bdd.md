# Documentation de la Base de Données RD Coaching

## 📋 Table des matières
- [Structure des Tables](#-structure-des-tables)
- [Relations entre les Tables](#-relations-entre-les-tables)
- [Politiques de Sécurité (RLS)](#-politiques-de-sécurité-rls)
- [Triggers et Fonctions](#-triggers-et-fonctions)
- [Sécurité et Bonnes Pratiques](#-sécurité-et-bonnes-pratiques)
- [Requêtes Utiles](#-requêtes-utiles)
- [Vues](#-vues)

## 🏗️ Structure des Tables

### Table: `calendar_cards`
Gère les cartes de calendrier pour le suivi des clients.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire (généré automatiquement avec `gen_random_uuid()`) |
| `client_id` | UUID | Référence au client (clé étrangère vers profiles.id) |
| `title` | TEXT | Titre de la carte (obligatoire) |
| `description` | TEXT | Description détaillée (optionnel) |
| `start_date` | DATE | Date de début (obligatoire) |
| `end_date` | DATE | Date de fin (obligatoire) |
| `is_active` | BOOLEAN | Si la carte est actuellement active (défaut: false) |
| `created_at` | TIMESTAMP WITH TIME ZONE | Date de création (défaut: now()) |
| `updated_at` | TIMESTAMP WITH TIME ZONE | Date de mise à jour (défaut: now()) |

**Contraintes** :
- `check_dates` : Vérifie que end_date >= start_date

**Index** :
- `idx_calendar_cards_client_id` : Optimise les requêtes par client
- `idx_calendar_cards_dates` : Optimise les requêtes par plage de dates
- `idx_calendar_cards_active` : Optimise la recherche des cartes actives

**Triggers** :
- `update_calendar_cards_modtime` : Met à jour automatiquement `updated_at` avant chaque mise à jour

**Politiques de sécurité (RLS)** :
1. **Clients can view their own calendar cards**
   - **Accès** : Lecture (SELECT)
   - **Condition** : Un client ne peut voir que ses propres cartes
   ```sql
   (client_id = auth.uid()) 
   AND (EXISTS (
     SELECT 1 FROM profiles 
     WHERE (profiles.id = auth.uid()) 
     AND (profiles.role = 'client'::user_role)
   ))
   ```

2. **Coaches can view all calendar cards**
   - **Accès** : Lecture (SELECT)
   - **Condition** : Les coachs peuvent voir toutes les cartes
   ```sql
   EXISTS (
     SELECT 1 FROM profiles 
     WHERE (profiles.id = auth.uid()) 
     AND (profiles.role = 'coach'::user_role)
   )
   ```

3. **Only coaches can insert calendar cards**
   - **Accès** : Insertion (INSERT)
   - **Condition** : Seuls les coachs peuvent insérer des cartes
   ```sql
   EXISTS (
     SELECT 1 FROM profiles 
     WHERE (profiles.id = auth.uid()) 
     AND (profiles.role = 'coach'::user_role)
   )
   ```

4. **Only coaches can update calendar cards**
   - **Accès** : Mise à jour (UPDATE)
   - **Condition** : Seuls les coachs peuvent mettre à jour des cartes
   ```sql
   EXISTS (
     SELECT 1 FROM profiles 
     WHERE (profiles.id = auth.uid()) 
     AND (profiles.role = 'coach'::user_role)
   )
   ```

5. **Only coaches can delete calendar cards**
   - **Accès** : Suppression (DELETE)
   - **Condition** : Seuls les coachs peuvent supprimer des cartes
   ```sql
   EXISTS (
     SELECT 1 FROM profiles 
     WHERE (profiles.id = auth.uid()) 
     AND (profiles.role = 'coach'::user_role)
   )
   ```

### Table: `profiles`
Stocke les informations des utilisateurs (clients et coachs).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire, référence l'utilisateur Auth |
| `email` | text | Email de l'utilisateur (unique) |
| `first_name` | text | Prénom |
| `last_name` | text | Nom |
| `birth_date` | date | Date de naissance |
| `height` | numeric | Taille en centimètres |
| `phone` | text | Numéro de téléphone |
| `starting_weight` | numeric | Poids de départ (kg) |
| `sports_practiced` | ARRAY | Liste des sports pratiqués |
| `objectives` | text | Objectifs de l'utilisateur |
| `injuries` | text | Blessures ou problèmes de santé connus |
| `role` | user_role | 'client' ou 'coach' (enum), par défaut 'client' |
| `is_onboarded` | boolean | Si l'utilisateur a complété l'onboarding (défaut: false) |
| `created_at` | timestamp with time zone | Date de création |
| `updated_at` | timestamp with time zone | Dernière mise à jour |

### Table: `daily_logs`
Journal des entrées quotidiennes des clients.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire (généré automatiquement) |
| `client_id` | UUID | Référence au client (clé étrangère vers profiles.id) |
| `weight` | numeric | Poids (kg) |
| `energy_level` | integer | Niveau d'énergie (échelle 1-10) |
| `sleep_quality` | integer | Qualité du sommeil (échelle 1-10) |
| `appetite` | text | Appétit de la journée |
| `notes` | text | Notes personnelles |
| `created_at` | timestamp with time zone | Date de création (par défaut: maintenant) |
| `log_date` | date | Date du journal (par défaut: date du jour, unique) |
| `training_type` | text | Type d'entraînement effectué |
| `plaisir_seance` | integer | Plaisir ressenti pendant la séance (échelle 1-10) |
| `sleep_hours` | numeric | Nombre d'heures de sommeil |
| `training_done` | boolean | Si l'entraînement a été effectué (défaut: false) |

### Table: `programs`
Programmes d'entraînement personnalisés pour les clients.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire (généré automatiquement) |
| `client_id` | UUID | Référence au client (clé étrangère vers profiles.id) |
| `title` | text | Titre du programme |
| `content` | text | Contenu détaillé du programme |
| `is_active` | boolean | Si le programme est actif (un seul par client, défaut: true) |
| `created_at` | timestamp with time zone | Date de création |
| `updated_at` | timestamp with time zone | Date de dernière mise à jour |

### Table: `program_days`
Jours individuels dans un programme d'entraînement.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire (généré automatiquement) |
| `program_id` | UUID | Référence au programme (clé étrangère vers programs.id) |
| `day_title` | text | Titre du jour |
| `content` | text | Contenu du jour (défaut: chaîne vide) |
| `day_order` | integer | Ordre du jour dans le programme |
| `created_at` | timestamp with time zone | Date de création |
| `updated_at` | timestamp with time zone | Date de dernière mise à jour |

### Table: `nutrition_programs`
Programmes nutritionnels pour les clients.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire (généré automatiquement) |
| `client_id` | UUID | Référence au client (clé étrangère vers profiles.id) |
| `title` | text | Titre du programme nutritionnel |
| `is_active` | boolean | Si le programme est actif (défaut: true) |
| `created_at` | timestamp with time zone | Date de création |
| `updated_at` | timestamp with time zone | Date de dernière mise à jour |

### Table: `nutrition_days`
Jours individuels dans un programme nutritionnel.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire (généré automatiquement) |
| `nutrition_program_id` | UUID | Référence au programme nutritionnel (clé étrangère vers nutrition_programs.id) |
| `day_title` | text | Titre du jour |
| `content` | text | Contenu nutritionnel du jour |
| `day_order` | integer | Ordre du jour dans le programme |
| `created_at` | timestamp with time zone | Date de création |
| `updated_at` | timestamp with time zone | Date de dernière mise à jour |

## 🔗 Relations entre les Tables

| Table source | Champ source | Table cible | Champ cible | Type de relation |
|--------------|--------------|-------------|-------------|------------------|
| `daily_logs` | `client_id` | `profiles` | `id` | Plusieurs logs peuvent appartenir à un utilisateur |
| `programs` | `client_id` | `profiles` | `id` | Un utilisateur peut avoir plusieurs programmes |
| `program_days` | `program_id` | `programs` | `id` | Un programme contient plusieurs jours |
| `nutrition_programs` | `client_id` | `profiles` | `id` | Un utilisateur peut avoir plusieurs programmes nutritionnels |
| `nutrition_days` | `nutrition_program_id` | `nutrition_programs` | `id` | Un programme nutritionnel contient plusieurs jours |
| `calendar_cards` | `client_id` | `profiles` | `id` | Un client peut avoir plusieurs cartes de calendrier |

## 🔒 Politiques de Sécurité (RLS)

### Table: `profiles`

1. **Lecture du profil**
   - **Nom de la politique**: "User can view own profile"
   - **Accès**: Lecture (SELECT)
   - **Rôles**: Tous les utilisateurs authentifiés
   - **Condition**: L'utilisateur ne peut voir que son propre profil

2. **Mise à jour du profil**
   - **Nom de la politique**: "User can update own profile"
   - **Accès**: Mise à jour (UPDATE)
   - **Rôles**: Tous les utilisateurs authentifiés
   - **Condition**: L'utilisateur ne peut mettre à jour que son propre profil

3. **Accès coach aux profils**
   - **Nom de la politique**: "Coaches can view all profiles"
   - **Accès**: Lecture (SELECT)
   - **Rôles**: Coach uniquement
   - **Condition**: Vérifie si l'utilisateur est un coach

4. **Mise à jour par un coach**
   - **Nom de la politique**: "Coaches can update client profiles"
   - **Accès**: Mise à jour (UPDATE)
   - **Rôles**: Coach uniquement
   - **Condition**: Empêche un coach de se mettre à jour lui-même

### Table: `daily_logs`

1. **Accès administrateur complet**
   - **Accès**: Toutes les opérations
   - **Condition**: Email spécifique (remy.denay6@gmail.com)

2. **Lecture des journaux**
   - **Nom de la politique**: "Allow read access to own logs"
   - **Accès**: Lecture (SELECT)
   - **Condition**: L'utilisateur ne peut voir que ses propres journaux

3. **Création de journaux**
   - **Nom de la politique**: "Allow insert own logs"
   - **Accès**: Création (INSERT)
   - **Rôles**: Utilisateurs authentifiés
   - **Condition**: L'utilisateur ne peut créer que ses propres journaux

4. **Mise à jour des journaux**
   - **Nom de la politique**: "Allow update to own logs"
   - **Accès**: Mise à jour (UPDATE)
   - **Condition**: L'utilisateur ne peut mettre à jour que ses propres journaux

### Table: `programs`

1. **Lecture pour les clients**
   - **Nom de la politique**: "Clients can view their own active program"
   - **Accès**: Lecture (SELECT)
   - **Condition**: L'utilisateur ne peut voir que son propre programme actif

2. **Accès complet pour les coachs**
   - **Politiques**: Plusieurs politiques pour la lecture, création, mise à jour et suppression
   - **Accès**: Toutes les opérations
   - **Rôles**: Coach uniquement
   - **Condition**: Vérifie si l'utilisateur a le rôle 'coach'

### Table: `program_days`

1. **Lecture pour les clients**
   - **Nom de la politique**: "Clients can view their own program days"
   - **Accès**: Lecture (SELECT)
   - **Condition**: L'utilisateur ne peut voir que les jours de son programme actif

2. **Gestion par les coachs**
   - **Politiques**: Séparées pour la lecture, création, mise à jour et suppression
   - **Accès**: Toutes les opérations
   - **Rôles**: Coach uniquement
   - **Condition**: Vérifie si l'utilisateur est un coach

### Table: `nutrition_programs`

1. **Gestion des programmes nutritionnels**
   - **Nom de la politique**: "Les clients peuvent gérer leurs programmes nutritionnels"
   - **Accès**: Toutes les opérations
   - **Condition**: L'utilisateur ne peut gérer que ses propres programmes

### Table: `nutrition_days`

1. **Gestion des jours de programme**
   - **Nom de la politique**: "Les clients peuvent gérer les jours de leur programme nutritionnel"
   - **Accès**: Toutes les opérations
   - **Condition**: L'utilisateur ne peut gérer que les jours de ses propres programmes

## ⚙️ Triggers et Fonctions

### Triggers

#### Table: `profiles`
1. **update_profiles_modtime**
   - **Type**: BEFORE UPDATE
   - **Niveau**: ROW
   - **Fonction**: `update_modified_column()`
   - **Description**: Met automatiquement à jour le champ `updated_at` lors de la modification d'un profil

#### Table: `daily_logs`
1. **update_daily_logs_modtime**
   - **Type**: BEFORE UPDATE
   - **Niveau**: ROW
   - **Fonction**: `update_modified_column()`
   - **Description**: Met à jour automatiquement le champ de date de modification

#### Table: `programs`
1. **trg_deactivate_other_programs**
   - **Type**: BEFORE INSERT OR UPDATE OF is_active
   - **Niveau**: ROW
   - **Fonction**: `deactivate_other_programs()`
   - **Description**: Désactive automatiquement les autres programmes actifs d'un client lorsqu'un nouveau programme est marqué comme actif

2. **update_programs_modtime**
   - **Type**: BEFORE UPDATE
   - **Niveau**: ROW
   - **Fonction**: `update_modified_column()`
   - **Description**: Met à jour le champ de date de modification

3. **update_programs_updated_at**
   - **Type**: BEFORE UPDATE
   - **Niveau**: ROW
   - **Fonction**: `update_updated_at_column()`
   - **Description**: Met à jour le champ `updated_at`

#### Table: `program_days`
1. **update_program_days_modtime**
   - **Type**: BEFORE UPDATE
   - **Niveau**: ROW
   - **Fonction**: `update_modified_column()`
   - **Description**: Met à jour le champ de date de modification

#### Table: `nutrition_programs`
1. **update_nutrition_programs_updated_at**
   - **Type**: BEFORE UPDATE
   - **Niveau**: ROW
   - **Fonction**: `update_nutrition_updated_at()`
   - **Description**: Met à jour le champ `updated_at` pour les programmes nutritionnels

#### Table: `nutrition_days`
1. **update_nutrition_days_updated_at**
   - **Type**: BEFORE UPDATE
   - **Niveau**: ROW
   - **Fonction**: `update_nutrition_updated_at()`
   - **Description**: Met à jour le champ `updated_at` pour les jours de programme nutritionnel

### Fonctions Personnalisées

1. **`update_modified_column()`**
   - **Retourne**: TRIGGER
   - **Description**: Met à jour le champ `updated_at` avec la date et l'heure actuelles
   - **Utilisation**: Déclenché avant une mise à jour sur les tables pour maintenir les horodatages

2. **`update_updated_at_column()`**
   - **Retourne**: TRIGGER
   - **Description**: Similaire à `update_modified_column()`, met à jour le champ `updated_at`
   - **Utilisation**: Utilisé spécifiquement pour la table `programs`

3. **`update_nutrition_updated_at()`**
   - **Retourne**: TRIGGER
   - **Description**: Met à jour le champ `updated_at` pour les tables liées à la nutrition
   - **Utilisation**: Utilisé pour les tables `nutrition_programs` et `nutrition_days`

4. **`deactivate_other_programs()`**
   - **Retourne**: TRIGGER
   - **Description**: Désactive tous les autres programmes actifs d'un client lorsqu'un nouveau programme est marqué comme actif
   - **Fonctionnement** :
     - Vérifie si le programme est marqué comme actif (`is_active = true`)
     - Si oui, désactive tous les autres programmes du même client
     - Empêche ainsi d'avoir plusieurs programmes actifs pour un même client

   WITH CHECK (auth.uid() = user_id);
   ```

3. **Mise à jour des journaux**
   ```sql
   CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres journaux"
   ON daily_logs FOR UPDATE
   USING (auth.uid() = user_id);
   ```

## ⚙️ Triggers et Fonctions

### Mise à jour automatique des timestamps

```sql
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
```

### Vérification du rôle utilisateur

```sql
CREATE OR REPLACE FUNCTION is_coach()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() AND role = 'coach'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🔐 Sécurité et Bonnes Pratiques

1. **Row Level Security (RLS)**
   - Activé sur toutes les tables
   - Politiques restrictives par défaut

2. **Authentification**
   - Gérée par Supabase Auth
   - Vérification des emails requise
   - Mots de passe forts obligatoires

3. **Validation des Données**
   - Contraintes au niveau de la base de données
   - Validation côté serveur

## 🔍 Requêtes Utiles

### Pour les clients : Obtenir leurs cartes de calendrier
```sql
-- Cartes actives d'un client
SELECT * FROM calendar_cards 
WHERE client_id = auth.uid()
AND is_active = true
ORDER BY start_date;

-- Toutes les cartes d'un client avec statut
SELECT * FROM calendar_cards_with_info
WHERE client_id = auth.uid()
ORDER BY start_date DESC;
```

### Pour les coachs : Gérer les cartes
```sql
-- Toutes les cartes créées par le coach
SELECT * FROM calendar_cards
WHERE coach_id = auth.uid()
ORDER BY start_date DESC;

-- Cartes actives pour un client spécifique
SELECT * FROM calendar_cards
WHERE coach_id = auth.uid()
AND client_id = 'client-uuid-here'
AND is_active = true;

-- Mise à jour de la progression d'une carte
UPDATE calendar_cards
SET progress = 75,
    updated_at = NOW()
WHERE id = 'card-uuid-here'
AND coach_id = auth.uid();
```

### Requêtes d'analyse
```sql
-- Nombre de cartes par statut
SELECT 
  status,
  COUNT(*) as count
FROM calendar_cards_with_info
WHERE coach_id = auth.uid()
GROUP BY status;

-- Durée moyenne des cartes
SELECT 
  AVG(end_date - start_date) as avg_duration_days
FROM calendar_cards
WHERE coach_id = auth.uid();
```

## 👁️ Vues

### `calendar_cards_with_info`
Vue enrichie avec des informations calculées pour les cartes de calendrier.

**Colonnes** :
- Toutes les colonnes de `calendar_cards`
- `duration` : Durée formatée (ex: "2 semaines")
- `client_name` : Nom complet du client
- `coach_name` : Nom complet du coach
- `status` : État actuel ('upcoming', 'current', 'past')

**Exemple d'utilisation** :
```sql
-- Vue complète avec toutes les informations
SELECT * FROM calendar_cards_with_info
WHERE coach_id = auth.uid()
ORDER BY start_date DESC;
```

## 📊 Schéma Relationnel

```
profiles (1) → (n) daily_logs
profiles (1) → (n) calendar_cards (en tant que client)
profiles (1) → (n) calendar_cards (en tant que coach)
```

- Un utilisateur peut avoir plusieurs entrées de journal
- Un utilisateur peut avoir plusieurs cartes de calendrier (en tant que client)
- Un coach peut créer plusieurs cartes de calendrier
