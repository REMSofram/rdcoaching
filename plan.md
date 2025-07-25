# Plan de développement - Application de Coaching

## État actuel

- ✅ Tests de triggers (mise à jour automatique du champ updated_at) et de sécurité RLS validés avec succès sur les tables `profiles` et `daily_logs`.
- ✅ Fichiers d'authentification créés et fonctionnels
- ✅ Flows d'authentification (email/password, magic link) implémentés
- ✅ Gestion des rôles : seul remy.denay6@gmail.com est coach, les autres sont clients
- ✅ Parcours d'onboarding implémenté avec redirection après vérification d'email
- ✅ Création automatique du profil utilisateur via trigger après création dans auth.users

## Notes importantes

- Correction appliquée : utilisation de la colonne `is_onboarded` (et non `onboarding_completed`) dans la table `profiles`
- Toutes les références à `onboarding_completed` ont été remplacées par `is_onboarded`
- Workflow hybride en place :
  1. Après inscription → page de vérification d'email
  2. Après confirmation email → redirection vers onboarding
  3. Après onboarding → accès à l'application
- Problème identifié : `AuthSessionMissingError` occasionnel lors de la vérification de session
- Correction appliquée : gestion de session améliorée côté client (AuthContext et configuration Supabase)

## Tâches techniques

- [x] 1.1 Install Node.js and setup development environment
- [x] 1.2 Create Next.js project with TypeScript and TailwindCSS
- [x] 1.3 Install Supabase client library
- [x] 1.4 Create environment variables file (.env.local)
- [x] 1.5 Verify project setup (build and dev server)
- [x] 2.1-2.7 Configuration de la base de données (tables, relations, RLS, triggers)
- [x] 3.1-3.11 Authentification (configuration, helpers, middleware, pages)
- [x] 4.1-4.6 Structure du projet et layouts
- [x] 5.1 Créer la page d'accueil publique (landing page)
- [x] 6.1 Créer le dashboard coach (pages/coach/dashboard)
- [x] 7.1 Créer le dashboard client (pages/client/dashboard)
- [x] 8.1 Mettre en place la navigation entre dashboards
- [x] 9.1 Créer la page d'accueil client (pages/client/home)
- [x] Implémenter la logique d'onboarding
- [x] Corriger la gestion des sessions pour éviter les erreurs `AuthSessionMissingError`
- [ ] Tester et valider le flux complet d'inscription/connexion

## Tests manuels à effectuer

### Authentification

- [x] 3.8.1 Test d'inscription (client et coach)
  - [x] Accéder à /auth/signup
  - [x] Remplir le formulaire
  - [x] Vérifier l'email de confirmation
  - [x] Vérifier la création du compte
  - [x] Créer un compte avec l'email remy.denay6@gmail.com (doit devenir coach)
- [x] 3.8.2 Test de connexion
  - [x] Se connecter avec email/mot de passe
  - [x] Vérifier la persistance de session
- [x] 3.8.3 Test des rôles
  - [x] Vérifier la redirection vers /coach/dashboard pour le coach (remy.denay6@gmail.com)
  - [x] Vérifier la redirection vers /client/dashboard pour les clients
  - [x] Tester l'accès aux routes protégées
- [x] 3.8.4 Test de déconnexion
  - [x] Cliquer sur "Déconnexion" dans le dashboard
  - [x] Vérifier que la session est bien supprimée
  - [x] Vérifier la redirection vers la page de login

### Fonctionnalités principales

- [ ] 5.2 Tester l'affichage de la landing page
- [ ] 6.2 Tester l'accès et l'affichage du dashboard coach
- [ ] 7.2 Tester l'accès et l'affichage du dashboard client
- [ ] 8.2 Tester la navigation entre dashboards
- [ ] 9.2 Tester l'accès à la page d'accueil client
- [ ] Tester le parcours d'onboarding complet
- [ ] Valider la correction du bug `AuthSessionMissingError`

## Problèmes connus

- Boutons de validation (login/signup) non visibles : remplacer la classe `primary` par `bg-blue-600`
- Message de validation d'email à améliorer pour inviter à vérifier la boîte mail
- Problèmes occasionnels de session à surveiller

## Current Goal

Tester le flux d'inscription avec trigger serveur (profil auto-créé) et valider la gestion des sessions
