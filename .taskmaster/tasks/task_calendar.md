# Task Calendar - Implémentation Vue Calendrier RD Coaching

## 🎯 Objectif
Créer un système de calendrier avec des cartes personnalisables permettant aux coachs de planifier et aux clients de visualiser leur parcours d'entraînement.

## 📊 Base de Données

### 1. Création de la table calendar_cards
```sql
-- Table pour les cartes de calendrier
CREATE TABLE calendar_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    color TEXT NOT NULL DEFAULT 'bg-blue-500',
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX idx_calendar_cards_client_id ON calendar_cards(client_id);
CREATE INDEX idx_calendar_cards_dates ON calendar_cards(start_date, end_date);
CREATE INDEX idx_calendar_cards_active ON calendar_cards(client_id, is_active) WHERE is_active = TRUE;

-- Contrainte pour s'assurer qu'une date de fin est >= date de début
ALTER TABLE calendar_cards ADD CONSTRAINT check_dates CHECK (end_date >= start_date);
```

### 2. Triggers et Fonctions
```sql
-- Trigger pour updated_at automatique
CREATE TRIGGER update_calendar_cards_modtime
    BEFORE UPDATE ON calendar_cards
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- Fonction pour calculer la durée automatiquement
CREATE OR REPLACE FUNCTION calculate_duration(start_date DATE, end_date DATE)
RETURNS TEXT AS $$
BEGIN
    IF start_date = end_date THEN
        RETURN '1 jour';
    ELSE
        DECLARE
            diff INTEGER := end_date - start_date + 1;
        BEGIN
            IF diff < 7 THEN
                RETURN diff || ' jours';
            ELSIF diff < 31 THEN
                RETURN ROUND(diff / 7.0, 1) || ' semaines';
            ELSE
                RETURN ROUND(diff / 30.0, 1) || ' mois';
            END IF;
        END;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour déterminer automatiquement les cartes actives
CREATE OR REPLACE FUNCTION update_card_active_status()
RETURNS TRIGGER AS $
BEGIN
    -- Mettre à jour le statut actif de toutes les cartes du client
    UPDATE calendar_cards 
    SET is_active = (CURRENT_DATE BETWEEN start_date AND end_date)
    WHERE client_id = NEW.client_id;
    
    RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le statut actif
CREATE TRIGGER trigger_update_card_active_status
    AFTER INSERT OR UPDATE ON calendar_cards
    FOR EACH ROW EXECUTE PROCEDURE update_card_active_status();

-- Fonction pour mise à jour quotidienne (à automatiser via cron)
CREATE OR REPLACE FUNCTION daily_update_active_cards()
RETURNS VOID AS $$
BEGIN
    UPDATE calendar_cards SET is_active = FALSE;
    UPDATE calendar_cards 
    SET is_active = TRUE 
    WHERE CURRENT_DATE BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;
```

### 3. Politiques de Sécurité (RLS)
```sql
-- Activer RLS
ALTER TABLE calendar_cards ENABLE ROW LEVEL SECURITY;

-- Politique de lecture pour les clients : voir seulement leurs cartes
CREATE POLICY "Clients can view their own calendar cards"
ON calendar_cards FOR SELECT
USING (
    client_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'client'
    )
);

-- Politique de lecture pour les coachs : voir toutes les cartes
CREATE POLICY "Coaches can view all calendar cards"
ON calendar_cards FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'coach'
    )
);

-- Politique de création pour les coachs uniquement
CREATE POLICY "Coaches can create calendar cards"
ON calendar_cards FOR INSERT
WITH CHECK (
    coach_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'coach'
    )
);

-- Politique de mise à jour pour les coachs
CREATE POLICY "Coaches can update their calendar cards"
ON calendar_cards FOR UPDATE
USING (
    coach_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'coach'
    )
);

-- Politique de suppression pour les coachs
CREATE POLICY "Coaches can delete their calendar cards"
ON calendar_cards FOR DELETE
USING (
    coach_id = auth.uid()
    AND EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'coach'
    )
);
```

### 4. Vue enrichie
```sql
-- Vue avec informations calculées
CREATE VIEW calendar_cards_with_info AS
SELECT 
    cc.*,
    calculate_duration(cc.start_date, cc.end_date) as duration,
    p_client.first_name || ' ' || p_client.last_name as client_name,
    p_coach.first_name || ' ' || p_coach.last_name as coach_name,
    CASE 
        WHEN CURRENT_DATE < cc.start_date THEN 'upcoming'
        WHEN CURRENT_DATE > cc.end_date THEN 'past'
        ELSE 'current'
    END as status
FROM calendar_cards cc
JOIN profiles p_client ON cc.client_id = p_client.id
JOIN profiles p_coach ON cc.coach_id = p_coach.id;
```

## 🛠️ Backend - Services

### 1. Créer calendarService.ts dans /lib/services/
**Emplacement** : `lib/services/calendarService.ts`

**Fonctions à implémenter** :
- `getClientCards(clientId: string)` - Récupérer les cartes d'un client
- `getAllCards()` - Récupérer toutes les cartes (coachs)
- `createCard(cardData)` - Créer une nouvelle carte
- `updateCard(cardId, updates)` - Mettre à jour une carte
- `deleteCard(cardId)` - Supprimer une carte
- `updateCardProgress(cardId, progress)` - Mettre à jour la progression

**Pattern à suivre** : Identique aux autres services (programService, nutritionService)

### 2. Types TypeScript
**Emplacement** : `types/calendar.ts`

```typescript
export interface CalendarCard {
  id: string;
  client_id: string;
  coach_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  color: string;
  progress: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCalendarCardInput {
  client_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  color: string;
}

export interface CalendarCardWithInfo extends CalendarCard {
  duration: string;
  client_name: string;
  coach_name: string;
  status: 'upcoming' | 'current' | 'past';
}
```

## 🎨 Frontend - Composants

### 1. Structure des pages
**Routes à ajouter** :
- `/client/calendrier` - Vue calendrier client
- `/coach/clients/[id]/calendrier` - Vue calendrier coach pour un client

### 2. Composants à créer

#### CalendarView.tsx (composant principal)
**Emplacement** : `components/calendar/CalendarView.tsx`

**Fonctionnalités** :
- Timeline verticale des cartes
- Affichage de la carte active avec indicateur
- Statistiques rapides (cartes planifiées, événements à venir, etc.)
- Responsive design

#### CalendarCard.tsx (carte individuelle)
**Emplacement** : `components/calendar/CalendarCard.tsx`

**Props** :
- `card: CalendarCard`
- `isActive: boolean`
- `onEdit?: (card) => void` (coach uniquement)

**Fonctionnalités** :
- Affichage titre, description, dates, durée
- Barre de progression si carte active
- Indicateur "En cours" pour carte active
- Couleur personnalisable

#### CreateCardModal.tsx (modal de création)
**Emplacement** : `components/calendar/CreateCardModal.tsx`

**Props** :
- `isOpen: boolean`
- `onClose: () => void`
- `onSubmit: (data) => void`
- `clientId?: string` (si appelé depuis vue coach)

**Fonctionnalités** :
- Formulaire : titre, description, dates, couleur
- Sélecteur de couleurs (6 couleurs prédéfinies)
- Validation des dates (fin >= début)
- Auto-calcul de la durée

### 3. Hooks personnalisés

#### useCalendarCards.ts
**Emplacement** : `hooks/useCalendarCards.ts`

**Fonctions** :
- `useClientCards(clientId)` - Hook pour récupérer les cartes d'un client
- `useCreateCard()` - Hook pour créer une carte
- `useUpdateCard()` - Hook pour mettre à jour une carte
- `useDeleteCard()` - Hook pour supprimer une carte

**Pattern** : Utiliser React Query comme les autres hooks existants

## 🧭 Navigation et Routing

### 1. Ajouter dans la navigation client
**Fichier** : `components/layout/ClientNavigation.tsx` (ou équivalent)

**Ajout** :
```tsx
{
  name: 'Calendrier',
  href: '/client/calendrier',
  icon: CalendarIcon
}
```

### 2. Ajouter dans la navigation coach
**Fichier** : Navigation des détails client

**Ajout** : Onglet "Calendrier" dans les détails client

## 🎯 Fonctionnalités par rôle

### Client
- **Vue lecture seule** des cartes de son calendrier
- **Timeline verticale** avec cartes chronologiques
- **Indicateur visuel** de la période actuelle
- **Statistiques** : nombre de cartes, progression, événements à venir
- **Responsive** pour mobile

### Coach
- **Toutes les fonctionnalités client** +
- **Création de cartes** via modal
- **Modification** des cartes existantes
- **Suppression** de cartes
- **Mise à jour de la progression** en temps réel

## 📱 Responsive et UX

### Mobile First
- Timeline verticale (déjà optimal)
- Cartes empilées naturellement
- Modal plein écran sur mobile
- Touch-friendly buttons

### Couleurs prédéfinies
- `bg-blue-500` (défaut)
- `bg-green-500`
- `bg-yellow-500` 
- `bg-purple-500`
- `bg-indigo-500`
- `bg-red-500`

### Animations
- Carte active avec `animate-pulse`
- Transitions smooth sur hover
- Barre de progression animée

## 🔄 Intégration avec l'existant

### 1. Réutiliser les composants UI existants
- Boutons (suivre le style existant)
- Inputs de formulaire
- Modals (même structure que création de programme)
- Loading states et error handling

### 2. Suivre les patterns existants
- **Structure de dossiers** : identique aux autres features
- **Naming conventions** : cohérent avec le projet
- **Error handling** : même approche que les autres services
- **Loading states** : même composants/patterns

### 3. Notifications (optionnel)
- Toast de succès/erreur lors des actions CRUD
- Réutiliser le système de notifications existant

## ✅ Checklist d'implémentation

### Base de données
- [ ] Créer la table `calendar_cards`
- [ ] Ajouter les index et contraintes
- [ ] Créer les triggers et fonctions
- [ ] Configurer les politiques RLS
- [ ] Tester les requêtes en console Supabase

### Backend
- [ ] Créer `calendarService.ts`
- [ ] Ajouter les types TypeScript
- [ ] Créer les hooks personnalisés
- [ ] Tester les appels API

### Frontend
- [ ] Créer le composant `CalendarView`
- [ ] Créer le composant `CalendarCard`
- [ ] Créer le modal `CreateCardModal`
- [ ] Ajouter les routes de navigation
- [ ] Intégrer dans la navigation

### Tests et Polish
- [ ] Tester création/modification/suppression
- [ ] Vérifier le responsive
- [ ] Tester les permissions coach/client
- [ ] Optimiser les performances
- [ ] Ajouter les animations
