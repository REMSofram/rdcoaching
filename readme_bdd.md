# Documentation de la Base de Données RD Coaching

## 📋 Table des matières
- [Structure des Tables](#-structure-des-tables)
- [Politiques de Sécurité (RLS)](#-politiques-de-sécurité-rls)
- [Triggers et Fonctions](#-triggers-et-fonctions)
- [Sécurité et Bonnes Pratiques](#-sécurité-et-bonnes-pratiques)
- [Requêtes Utiles](#-requêtes-utiles)

## 🏗️ Structure des Tables

### Table: `profiles`
Stocke les informations des utilisateurs (clients et coachs).

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire, référence l'utilisateur Auth |
| `email` | text | Email de l'utilisateur |
| `first_name` | text | Prénom |
| `last_name` | text | Nom |
| `birth_date` | date | Date de naissance |
| `height` | numeric | Taille en centimètres |
| `phone` | text | Numéro de téléphone |
| `starting_weight` | numeric | Poids de départ (kg) |
| `sports_practiced` | ARRAY | Liste des sports pratiqués |
| `objectives` | text | Objectifs de l'utilisateur |
| `injuries` | text | Blessures ou problèmes de santé connus |
| `role` | user_role | 'client' ou 'coach' (enum) |
| `is_onboarded` | boolean | Si l'utilisateur a complété l'onboarding |
| `created_at` | timestamp with time zone | Date de création |
| `updated_at` | timestamp with time zone | Dernière mise à jour |

### Table: `daily_logs`
Journal des entrées quotidiennes des clients.

| Colonne | Type | Description |
|---------|------|-------------|
| `id` | UUID | Clé primaire |
| `client_id` | UUID | Référence au client |
| `weight` | numeric | Poids (kg) |
| `energy_level` | integer | Niveau d'énergie (échelle 1-10) |
| `sleep_quality` | integer | Qualité du sommeil (échelle 1-10) |
| `appetite` | text | Appétit de la journée |
| `notes` | text | Notes personnelles |
| `created_at` | timestamp with time zone | Date de création |
| `log_date` | date | Date du journal (par défaut: date du jour) |
| `training_type` | text | Type d'entraînement effectué |
| `plaisir_seance` | integer | Plaisir ressenti pendant la séance (échelle 1-10) |
| `sleep_hours` | numeric | Nombre d'heures de sommeil |
| `training_done` | boolean | Si l'entraînement a été effectué (défaut: false) |

## 🔒 Politiques de Sécurité (RLS)

### Politiques pour `profiles`

1. **Lecture du profil**
   ```sql
   CREATE POLICY "Les utilisateurs peuvent voir leur propre profil"
   ON profiles FOR SELECT
   USING (auth.uid() = id);
   ```

2. **Mise à jour du profil**
   ```sql
   CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre profil"
   ON profiles FOR UPDATE
   USING (auth.uid() = id);
   ```

### Politiques pour `daily_logs`

1. **Lecture des journaux**
   ```sql
   CREATE POLICY "Les utilisateurs peuvent voir leurs propres journaux"
   ON daily_logs FOR SELECT
   USING (auth.uid() = user_id);
   ```

2. **Création de journaux**
   ```sql
   CREATE POLICY "Les utilisateurs peuvent créer des entrées dans leur journal"
   ON daily_logs FOR INSERT
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

### Obtenir les journaux d'un utilisateur
```sql
SELECT * FROM daily_logs 
WHERE user_id = auth.uid()
ORDER BY date DESC;
```

### Compter les entrées de journal par mois
```sql
SELECT 
  DATE_TRUNC('month', date) AS month,
  COUNT(*) AS entries
FROM daily_logs
WHERE user_id = auth.uid()
GROUP BY month
ORDER BY month;
```

### Vérifier les autorisations
```sql
-- Vérifier si l'utilisateur est un coach
SELECT is_coach();
```

## 📊 Schéma Relationnel

```
profiles (1) → (n) daily_logs
```

- Un utilisateur peut avoir plusieurs entrées de journal
- Chaque entrée de journal appartient à un seul utilisateur
