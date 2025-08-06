# Documentation Backend - RD Coaching

## 📋 Table des matières
- [Architecture Générale](#-architecture-générale)
- [Middleware d'Authentification](#-middleware-dauthentification)
- [Flux d'Authentification](#-flux-dauthentification)
- [Gestion des Rôles](#-gestion-des-rôles)
- [Structure des Routes](#-structure-des-routes)
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

1. **Connexion** (`/auth/login`)
   - Formulaire de connexion avec email/mot de passe
   - Redirection vers la vérification d'email si nécessaire
   - Gestion des erreurs de connexion

2. **Vérification d'Email** (`/auth/verify-email`)
   - Affichage des instructions de vérification
   - Redirection automatique après vérification réussie

3. **Onboarding** (`/onboarding`)
   - Complétion du profil utilisateur
   - Configuration des préférences initiales
   - Validation des données avant activation du compte

## 👥 Gestion des Rôles

L'application distingue deux rôles principaux :

### 1. Client
- Accès à l'espace personnel (`/client/*`)
- Suivi des entraînements et de la progression
- Tableau de bord personnalisé

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
/client/dashboard
/client/suivi
/client/calendrier
/client/nutrition
/client/profile
/client/programme
```

### Routes Protégées - Coach
```
/coach/dashboard
/coach/clients
/coach/clients/[id]
/coach/profile
```

### Autres Routes
```
/onboarding
/error
/not-found
```

## 🔒 Sécurité

### Protection des Routes
- Vérification de session côté serveur
- Protection contre les attaques CSRF
- Validation des entrées utilisateur

### Gestion des Sessions
- Stockage sécurisé des tokens
- Rafraîchissement automatique des sessions
- Invalidation des sessions expirées

### Politiques d'Accès
- Accès basé sur les rôles
- Vérification des permissions pour chaque ressource
- Journalisation des accès sensibles

## ⚙️ Variables d'Environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de l'instance Supabase | Oui |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme Supabase | Oui |
| `NEXT_PUBLIC_SITE_URL` | URL de l'application (pour les redirections) | Non |

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
