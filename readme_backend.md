# Documentation Backend - RD Coaching

## 📋 Table des matières
- [Architecture Générale](#-architecture-générale)
- [Middleware d'Authentification](#-middleware-dauthentification)
- [Flux d'Authentification](#-flux-dauthentification)
- [Gestion des Rôles](#-gestion-des-rôles)
- [Structure des Routes](#-structure-des-routes)
- [Services Backend](#-services-backend)
- [Sécurité](#-sécurité)
- [Variables d'Environnement](#-variables-denvironnement)

## 🏗️ Architecture Générale

L'application utilise une architecture basée sur Next.js avec les composants clés suivants :

- **Frontend** : Next.js 13+ avec App Router
- **Backend** : Supabase (Auth, Base de données, Stockage)
- **Authentification** : Supabase Auth avec gestion de session côté serveur
- **Middleware** : Gestion centralisée des autorisations et redirections

## 🔐 Middleware d'Authentification

Le fichier `middleware.ts` gère toutes les requêtes entrantes et applique une logique de sécurité cohérente :

### Fonctionnalités Principales

1. **Vérification de Session**
   - Vérifie la validité du token de session à chaque requête
   - Rafraîchit automatiquement la session si nécessaire
   - Gère les erreurs de session (tokens expirés, invalides)

2. **Gestion des Accès**
   - Routes publiques : Accessibles sans authentification
   - Routes protégées : Nécessitent une session valide
   - Redirections intelligentes basées sur le statut d'authentification

3. **Workflow d'Onboarding**
   - Vérifie si l'utilisateur a complété son profil
   - Redirige vers l'onboarding si nécessaire

## 🔄 Flux d'Authentification

1. **Création de Compte** (`/auth/create-account`)
   - Formulaire de création de compte avec email, mot de passe, prénom et nom
   - Vérification de la validité du mot de passe (6 caractères minimum)
   - Mise à jour du profil utilisateur avec les informations fournies
   - Redirection automatique vers la page d'onboarding après création réussie
   - Le champ `is_onboarded` est défini à `false` jusqu'à la complétion de l'onboarding

2. **Connexion** (`/auth/login`)
   - Formulaire de connexion avec email/mot de passe
   - Redirection vers la vérification d'email si nécessaire
   - Gestion des erreurs de connexion

3. **Vérification d'Email** (`/auth/verify-email`)
   - Affichage des instructions de vérification
   - Redirection automatique après vérification réussie

4. **Onboarding** (`/onboarding`)
   - Étape obligatoire après la création du compte
   - Collecte des informations complémentaires (téléphone, date de naissance, etc.)
   - Mise à jour du profil avec `is_onboarded` à `true` après complétion
   - Redirection vers le tableau de bord approprié selon le rôle

## 🏋️‍♂️ Gestion des Programmes d'Entraînement

### Services Disponibles

#### `programService.ts`
Gestion complète des programmes d'entraînement et de leurs jours associés.

**Fonctions principales :**
- `getActiveProgram(clientId: string)` : Récupère le programme actif d'un client avec ses jours
- `createProgram(programData: CreateProgramInput)` : Crée un nouveau programme
- `updateProgram(programId: string, updates: UpdateProgramInput)` : Met à jour un programme existant
- `deleteProgram(programId: string)` : Supprime un programme et ses jours associés
- `getProgramDay(dayId: string)` : Récupère un jour spécifique
- `updateProgramDay(dayId: string, updates: Partial<ProgramDayInput>)` : Met à jour un jour
- `deleteProgramDay(dayId: string)` : Supprime un jour
- `getAllPrograms()` : Récupère tous les programmes (coachs uniquement)
- `getClientPrograms(clientId: string)` : Récupère tous les programmes d'un client spécifique

#### `clientService.ts`
Gestion des profils clients et de leurs données associées.

**Fonctions principales :**
- `fetchClients()` : Récupère la liste des clients (coachs uniquement)
- `fetchClientLogs(clientId: string)` : Récupère les journaux d'un client
- `updateClientProfile(clientId: string, updates: Partial<ClientProfile>)` : Met à jour le profil d'un client

#### `dailyLogService.ts`
Gestion des journaux quotidiens des clients.

**Fonctions principales :**
- `createDailyLog(logData: Omit<DailyLog, 'id' | 'created_at' | 'updated_at'>)` : Crée une nouvelle entrée de journal
- `getLogByDate(clientId: string, date: string)` : Récupère le journal d'une date spécifique
- `updateDailyLog(id: string, updates: Partial<DailyLog>)` : Met à jour une entrée de journal
- `getClientLogs(clientId: string)` : Récupère tous les journaux d'un client

#### `nutritionService.ts`
Gestion des programmes nutritionnels et de leurs jours associés.

**Fonctions principales :**
- `getActiveNutritionProgram(clientId: string)` : Récupère le programme nutritionnel actif
- `createNutritionProgram(programData: CreateNutritionProgramInput)` : Crée un nouveau programme nutritionnel
- `updateNutritionProgram(programId: string, updates: UpdateNutritionProgramInput)` : Met à jour un programme existant
- `deleteNutritionProgram(programId: string)` : Supprime un programme et ses jours associés
- `getNutritionDay(dayId: string)` : Récupère un jour spécifique
- `updateNutritionDay(dayId: string, updates: Partial<NutritionDayInput>)` : Met à jour un jour
- `deleteNutritionDay(dayId: string)` : Supprime un jour
- `getAllNutritionPrograms()` : Récupère tous les programmes (coachs uniquement)
- `getClientNutritionPrograms(clientId: string)` : Récupère tous les programmes d'un client spécifique

1. **Récupérer le programme actif d'un client**
   ```typescript
   getActiveProgram(clientId: string): Promise<Program | null>
   ```
   - Récupère le programme actif d'un client spécifique
   - Retourne `null` si aucun programme actif n'est trouvé

2. **Créer un nouveau programme**
   ```typescript
   createProgram(programData: CreateProgramInput): Promise<Program>
   ```
   - Crée un nouveau programme pour un client
   - Désactive automatiquement les autres programmes du client
   - Retourne le programme créé

3. **Mettre à jour un programme existant**
   ```typescript
   updateProgram(programId: string, updates: UpdateProgramInput): Promise<Program>
   ```
   - Met à jour les informations d'un programme existant
   - Permet de modifier le titre, le contenu et le statut actif
   - Met à jour automatiquement le champ `updated_at`

4. **Supprimer un programme**
   ```typescript
   deleteProgram(programId: string): Promise<void>
   ```
   - Supprime définitivement un programme
   - Utilisation avec précaution (pas de corbeille)

5. **Récupérer tous les programmes (coachs uniquement)**
   ```typescript
   getAllPrograms(): Promise<Program[]>
   ```
   - Liste tous les programmes de tous les clients
   - Réservé aux utilisateurs avec le rôle 'coach'

6. **Récupérer les programmes d'un client spécifique**
   ```typescript
   getClientPrograms(clientId: string): Promise<Program[]>
   ```
   - Liste tous les programmes d'un client spécifique
   - Utile pour l'historique des programmes

3. **Onboarding** (`/onboarding`)
   - Complétion du profil utilisateur
   - Configuration des préférences initiales
   - Validation des données avant activation du compte

## 👥 Gestion des Rôles

L'application distingue deux rôles principaux :

### 1. Client
- Accès à l'espace personnel (`/client/*`)
- Suivi des entraînements et de la progression
- Accueil « Suivi » comme page principale

### 2. Coach
- Accès à l'interface d'administration (`/coach/*`)
- Gestion des clients et de leur progression
- Création et suivi des programmes

## 🛣️ Structure des Routes

### Routes Publiques
```
/
/auth/login
/auth/signup
/auth/verify-email
```

### Routes Protégées - Client
```
/client/suivi          # Accueil suivi, page principale
/client/calendrier     # Calendrier des séances et événements
/client/nutrition      # Programme alimentaire et suivi nutritionnel
/client/profile        # Gestion du profil utilisateur
/client/programme      # Programme d'entraînement actuel
/client/daily-log      # Journal quotidien (logs)
```

### Routes Protégées - Coach
```
/coach/dashboard            # Tableau de bord coach
/coach/clients              # Liste des clients
/coach/clients/[id]         # Profil détaillé d'un client
/coach/clients/[id]/programme  # Programme d'entraînement du client
/coach/clients/[id]/nutrition  # Programme nutritionnel du client
/coach/profile              # Profil coach
```

 

### Autres Routes
```
/onboarding               # Processus d'intégration des nouveaux utilisateurs
```

## 🔒 Sécurité

### Protection des Routes
- Vérification de session côté serveur pour toutes les routes protégées
- Protection contre les attaques CSRF via les en-têtes appropriés
- Validation stricte des entrées utilisateur avec des schémas de validation
- Protection contre les injections SQL via l'utilisation de requêtes paramétrées

### Gestion des Sessions
- Stockage sécurisé des tokens dans des cookies HTTPOnly et Secure
- Rafraîchissement automatique des sessions avant expiration
- Invalidation des sessions expirées et compromises
- Rotation des tokens de rafraîchissement

### Politiques d'Accès
- Accès basé sur les rôles avec vérification côté serveur
- Vérification des permissions au niveau des ressources
- Principe du moindre privilège appliqué systématiquement
- Journalisation détaillée des accès sensibles et des modifications de données
- Protection contre les attaques par force brute sur l'authentification

### Bonnes Pratiques
- Hachage sécurisé des mots de passe (bcrypt)
- Protection contre les attaques XSS via l'échappement des données
- Headers de sécurité HTTP (CSP, HSTS, etc.)
- Validation des types de fichiers pour les téléversements
- Limitation des tentatives de connexion

## ⚙️ Variables d'Environnement

| Variable | Description | Requis | Valeur par défaut |
|----------|-------------|--------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de l'instance Supabase | Oui | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme Supabase | Oui | - |
| `NEXT_PUBLIC_SITE_URL` | URL de base de l'application (pour les redirections, emails, etc.) | Oui | http://localhost:3000 |
| `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY` | Clé de service Supabase (côté serveur uniquement) | Oui (production) | - |
| `NODE_ENV` | Environnement d'exécution (development, production, test) | Non | development |
| `NEXT_PUBLIC_APP_ENV` | Environnement d'application (dev, staging, prod) | Non | dev |

### Configuration requise pour les emails
Les variables suivantes sont nécessaires pour l'envoi d'emails (vérification, réinitialisation de mot de passe, etc.) :
- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_PORT`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`
- `EMAIL_FROM`

## 🔄 Workflow de Développement

1. **Configuration Initiale**
   ```bash
   cp .env.example .env.local
   # Configurer les variables d'environnement
   ```

2. **Développement Local**
   ```bash
   npm run dev
   ```

3. **Tests**
   ```bash
   npm test
   ```

## 🐛 Dépannage

### Problèmes Courants
1. **Session non détectée**
   - Vérifier les cookies dans le navigateur
   - S'assurer que les domaines sont correctement configurés

2. **Erreurs CORS**
   - Vérifier les configurations CORS dans Supabase
   - S'assurer que les URLs autorisées sont à jour

3. **Problèmes de Redirection**
   - Vérifier les logs du middleware
   - S'assurer que les URLs de redirection sont valides
