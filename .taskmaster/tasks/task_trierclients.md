# Tâche : Ajouter un système de tags multi-sélection pour les clients

## Objectif
Ajouter un attribut "Type" pour chaque client permettant de sélectionner plusieurs tags (comme Notion) pour faciliter le tri et la classification des clients.

## Fonctionnalités requises

### 1. Modèle de données
- Ajouter un champ `types: string[]` au modèle Client dans la base de données
- Ce champ stockera un tableau de strings représentant les tags sélectionnés
- Exemples de tags : "Actif", "Inactif", "Course", "Perte de poids", "Prise de masse", etc.

### 2. Gestion des tags disponibles
- Créer une liste de tags prédéfinis (modifiable par l'utilisateur coach)
- Stocker cette liste soit :
  - Dans une collection Firestore séparée `coachSettings` avec un document contenant `availableTags: string[]`
  - Ou directement dans le profil du coach

Tags par défaut suggérés :
- "Actif"
- "Inactif" 
- "Course"
- "Musculation"
- "Perte de poids"
- "Prise de masse"
- "Débutant"
- "Intermédiaire"
- "Avancé"

### 3. Interface utilisateur - Page "Mes clients"

#### Affichage dans le tableau
- Ajouter une colonne "TYPE" entre "CLIENT" et "POIDS ACTUEL"
- Afficher les tags comme des badges colorés (pills/chips)
- Limiter l'affichage à 2-3 tags avec un "+X" pour les tags supplémentaires
- Style similaire à l'image fournie (badges avec couleurs distinctes)

#### Filtrage
- Ajouter un système de filtres au-dessus du tableau
- Permettre de filtrer par un ou plusieurs tags
- Interface avec dropdown multi-sélection
- Afficher le nombre de clients correspondants

### 4. Interface d'édition des tags

#### Pour un client spécifique
- Dans la page de détail client (accessible via "Voir le profil")
- Ajouter une section "Types" avec un composant multi-select
- Interface similaire à celle montrée dans l'image 2 :
  - Dropdown avec chips sélectionnables
  - Possibilité d'ajouter/retirer des tags en cliquant
  - Tags sélectionnés apparaissent avec un fond coloré

#### Gestion des tags disponibles
- Ajouter une page ou modal "Gérer les types" accessible depuis les paramètres
- Permettre de :
  - Créer de nouveaux tags
  - Supprimer des tags existants
  - Modifier les noms de tags
  - Changer les couleurs associées aux tags

### 5. Modification rapide dans le tableau
- Permettre de cliquer sur la cellule "TYPE" directement dans le tableau
- Ouvrir un dropdown inline pour modifier les tags sans changer de page
- Sauvegarder automatiquement à la modification

## Structure technique suggérée

### Composants à créer

1. **TagSelector.tsx** - Composant de sélection multi-tags
   ```typescript
   interface TagSelectorProps {
     selectedTags: string[];
     availableTags: string[];
     onChange: (tags: string[]) => void;
     onCreateTag?: (tagName: string) => void;
   }
   ```

2. **TagBadge.tsx** - Badge d'affichage d'un tag
   ```typescript
   interface TagBadgeProps {
     tag: string;
     color?: string;
     onRemove?: () => void;
     clickable?: boolean;
   }
   ```

3. **TagFilter.tsx** - Composant de filtrage par tags
   ```typescript
   interface TagFilterProps {
     availableTags: string[];
     selectedFilters: string[];
     onFilterChange: (filters: string[]) => void;
   }
   ```

4. **TagManager.tsx** - Page/modal de gestion des tags
   ```typescript
   interface TagManagerProps {
     tags: Tag[];
     onAdd: (tag: Tag) => void;
     onUpdate: (tagId: string, updates: Partial<Tag>) => void;
     onDelete: (tagId: string) => void;
   }
   ```

### Types TypeScript

```typescript
interface Tag {
  id: string;
  name: string;
  color: string;
  category?: string;
}

interface Client {
  // ... champs existants
  types: string[]; // Tableau des noms de tags
}

interface CoachSettings {
  availableTags: Tag[];
  // ... autres paramètres
}
```

### Services Firestore

```typescript
// clientService.ts
async function updateClientTypes(clientId: string, types: string[]): Promise<void>
async function getClientsByTypes(types: string[]): Promise<Client[]>

// tagService.ts
async function getAvailableTags(coachId: string): Promise<Tag[]>
async function addTag(coachId: string, tag: Tag): Promise<void>
async function updateTag(coachId: string, tagId: string, updates: Partial<Tag>): Promise<void>
async function deleteTag(coachId: string, tagId: string): Promise<void>
```

## Étapes d'implémentation

### Phase 1 : Backend et modèle de données
1. Mettre à jour le schéma Firestore pour ajouter le champ `types` aux clients
2. Créer une collection ou document pour stocker les tags disponibles
3. Implémenter les fonctions CRUD pour les tags
4. Implémenter les fonctions de mise à jour des types de clients

### Phase 2 : Composants UI de base
1. Créer le composant `TagBadge` pour l'affichage
2. Créer le composant `TagSelector` pour la sélection multi-tags
3. Styliser selon le design de l'application (cohérence avec le reste)

### Phase 3 : Intégration dans le tableau clients
1. Ajouter la colonne "TYPE" dans le tableau
2. Afficher les tags de chaque client
3. Implémenter l'édition inline (optionnel pour v1)

### Phase 4 : Filtrage
1. Créer le composant `TagFilter`
2. Intégrer au-dessus du tableau clients
3. Implémenter la logique de filtrage côté client ou requête Firestore

### Phase 5 : Page de détail et gestion
1. Ajouter la section types dans la page de détail client
2. Créer la page/modal de gestion des tags disponibles
3. Ajouter le lien dans les paramètres ou navigation

### Phase 6 : Tests et polish
1. Tester tous les cas d'usage (ajout, suppression, filtrage)
2. Vérifier la performance avec beaucoup de clients
3. Ajouter des animations et feedback utilisateur
4. Documentation utilisateur si nécessaire

## Considérations techniques

### Performance
- Si beaucoup de clients, envisager la pagination avec filtrage côté serveur
- Indexer le champ `types` dans Firestore pour des requêtes efficaces
- Utiliser `array-contains-any` pour filtrer par tags

### UX
- Couleurs distinctes pour chaque tag (palette prédéfinie)
- Animations douces lors de l'ajout/suppression de tags
- Feedback visuel immédiat lors des modifications
- Validation : empêcher les tags vides ou en double

### Sécurité
- Valider côté backend que seul le coach peut modifier ses tags
- Limiter le nombre de tags par client (ex: max 10)
- Limiter le nombre de tags disponibles (ex: max 50)

## Assets nécessaires
- Palette de couleurs pour les tags (minimum 12 couleurs distinctes)
- Icônes pour add/remove/edit tags
- États hover/active pour les interactions

## Contexte de l'application

### Architecture mono-coach
- **Un seul coach** a accès à l'application
- Les tags sont donc spécifiques à ce coach unique
- Pas besoin de gestion multi-coach ou de permissions complexes
- Simplification possible du modèle de données

### Sécurité et confidentialité - CRITIQUE
**⚠️ LES TAGS SONT STRICTEMENT CONFIDENTIELS**

Les tags ne doivent **JAMAIS** être visibles ou accessibles par les clients. Ce sont des outils de gestion interne pour le coach uniquement.

#### Règles de sécurité Firestore
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Les clients NE PEUVENT PAS lire leur propre champ 'types'
    match /clients/{clientId} {
      allow read: if request.auth != null && 
                     request.auth.uid == resource.data.userId;
      // Mais le champ 'types' doit être exclu des lectures clients
      
      allow write: if request.auth != null && 
                      request.auth.uid == resource.data.coachId;
    }
    
    // Les tags disponibles sont accessibles uniquement par le coach
    match /coachSettings/{settingId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == get(/databases/$(database)/documents/coaches/$(request.auth.uid)).id;
    }
  }
}
```

#### Mesures de sécurité à implémenter

1. **Backend (Cloud Functions recommandé)**
   - Créer des Cloud Functions pour servir les données clients
   - Exclure systématiquement le champ `types` quand un client accède à ses données
   - Exemple :
   ```typescript
   // Fonction pour récupérer le profil client (sans types)
   export const getClientProfile = functions.https.onCall(async (data, context) => {
     const userId = context.auth?.uid;
     if (!userId) throw new Error('Non authentifié');
     
     const clientDoc = await db.collection('clients').doc(userId).get();
     const clientData = clientDoc.data();
     
     // SUPPRIMER le champ types avant de renvoyer
     delete clientData.types;
     
     return clientData;
   });
   ```

2. **Frontend - Vues séparées**
   - Interface coach : affiche tous les champs y compris `types`
   - Interface client : ne charge JAMAIS le champ `types`
   - Utiliser des requêtes Firestore différentes selon le rôle

3. **Queries Firestore sécurisées**
   ```typescript
   // Pour le coach - récupère tout
   const coachQuery = db.collection('clients').where('coachId', '==', coachId);
   
   // Pour un client - exclut types via Cloud Function
   // NE PAS faire de query directe côté client
   ```

4. **Validation des rôles**
   - Vérifier systématiquement que l'utilisateur connecté est bien le coach
   - Ajouter un champ `role: 'coach' | 'client'` dans les profils utilisateurs
   - Toutes les pages de gestion des tags vérifient `role === 'coach'`

#### Dans les composants

```typescript
// Hook pour vérifier le rôle
const useIsCoach = () => {
  const { user } = useAuth();
  return user?.role === 'coach';
};

// Composant protégé
const TagManager = () => {
  const isCoach = useIsCoach();
  
  if (!isCoach) {
    // Rediriger ou afficher erreur
    return <Navigate to="/dashboard" />;
  }
  
  // ... reste du composant
};
```

#### Tests de sécurité à effectuer

1. ✅ Vérifier qu'un client ne peut pas voir le champ `types` dans la console Firestore
2. ✅ Tester avec un compte client : aucune trace des tags dans les appels réseau
3. ✅ Vérifier que les règles Firestore bloquent l'accès direct au champ `types`
4. ✅ S'assurer que les pages de gestion des tags sont inaccessibles aux clients

## Questions résolues

1. **Les tags sont globaux ou spécifiques ?**
   - ✅ Spécifiques au coach unique de l'application
   
2. **Faut-il des catégories de tags ?**
   - ✅ Non pour la v1, commencer simple

3. **Faut-il un historique des changements ?**
   - ✅ Non pour la v1

4. **Couleurs personnalisées ou palette fixe ?**
   - ✅ Palette fixe pour la v1

5. **Qui peut voir les tags ?**
   - ✅ **UNIQUEMENT LE COACH** - jamais les clients