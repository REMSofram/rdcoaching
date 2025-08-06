<div align="center">
  <h1>RD Coaching - Application de Suivi Sportif</h1>
  <p>Application web de coaching sportif permettant le suivi personnalisé des clients par leur coach.</p>
  
  [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)]()
  [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)]()
  [![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)]()
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)]()
</div>

## 📋 Table des matières
- [Fonctionnalités](#-fonctionnalités)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Structure du Projet](#-structure-du-projet)
- [Déploiement](#-déploiement)
- [Base de Données et Backend](#-base-de-données-et-backend)
- [Sécurité](#-sécurité)

## ✨ Fonctionnalités

### Pour les Clients
- 📱 Tableau de bord personnel
- 📅 Suivi des entraînements quotidiens
- 📊 Visualisation de la progression
- 📝 Journal d'entraînement
- 🔔 Notifications et rappels

### Pour les Coachs
- 👥 Gestion des clients
- 🎯 Création de programmes personnalisés
- 📊 Analyse des performances
- 💬 Communication directe
- 📈 Suivi des objectifs

## 🚀 Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/REMSofram/rdcoaching.git
   cd rdcoaching
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configurer les variables d'environnement**
   Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :
   ```
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
   ```

4. **Démarrer le serveur de développement**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

## ⚙️ Configuration

### Variables d'environnement

| Variable | Description | Requis |
|----------|-------------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de votre instance Supabase | Oui |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme de votre projet Supabase | Oui |

### Configuration de Supabase

1. Créez un projet sur [Supabase](https://supabase.com/)
2. Importez le schéma de base de données depuis le dossier `migrations`
3. Activez l'authentification par email/mot de passe
4. Configurez les politiques RLS (Row Level Security) comme décrit dans `readme_bdd.md`

## 📁 Structure du Projet

```
rdcoaching/
├── public/           # Fichiers statiques
├── src/
│   ├── app/          # Routes de l'application
│   ├── components/   # Composants React
│   ├── lib/          # Utilitaires et configurations
│   ├── services/     # Services API
│   └── types/        # Définitions de types TypeScript
├── migrations/       # Scripts de migration de base de données
└── public/           # Fichiers statiques
```

## 🚀 Déploiement

### Vercel (Recommandé)

1. Connectez-vous à [Vercel](https://vercel.com)
2. Importez votre dépôt
3. Ajoutez les variables d'environnement
4. Cliquez sur "Déployer"

## 💾 Base de Données et Backend

### Documentation de la Base de Données
L'application utilise Supabase comme backend. Consultez le fichier [readme_bdd.md](./readme_bdd.md) pour la documentation complète de la base de données, y compris :

- Structure des tables
- Politiques de sécurité (RLS)
- Triggers et fonctions
- Schéma relationnel

### Documentation du Backend
Pour une compréhension approfondie de l'architecture backend, des routes et de la logique d'authentification, consultez le fichier [readme_backend.md](./readme_backend.md). Ce document couvre :

- Architecture générale du backend
- Gestion des rôles et des autorisations
- Structure complète des routes
- Sécurité et flux d'authentification

## 🔐 Sécurité

- Authentification sécurisée avec Supabase Auth
- Politiques de sécurité au niveau des lignes (RLS) pour la protection des données
- Validation des entrées utilisateur
- Gestion sécurisée des tokens d'authentification

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).
