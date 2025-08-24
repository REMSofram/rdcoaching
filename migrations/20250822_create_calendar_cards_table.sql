-- Création de la table calendar_cards
CREATE TABLE IF NOT EXISTS public.calendar_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    color TEXT DEFAULT 'bg-blue-500',
    progress INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Création d'un index pour améliorer les performances des requêtes par client_id
CREATE INDEX IF NOT EXISTS idx_calendar_cards_client_id ON public.calendar_cards(client_id);

-- Fonction pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Déclencheur pour mettre à jour automatiquement le champ updated_at
CREATE TRIGGER update_calendar_cards_updated_at
BEFORE UPDATE ON public.calendar_cards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Politiques de sécurité RLS (Row Level Security)
ALTER TABLE public.calendar_cards ENABLE ROW LEVEL SECURITY;

-- Politique d'accès pour les coachs (peuvent voir/modifier les cartes de leurs clients)
CREATE POLICY "Les coachs peuvent voir les cartes de leurs clients"
ON public.calendar_cards
FOR SELECT
USING (
  auth.uid() IN (
    SELECT coach_id FROM public.coach_clients 
    WHERE client_id = calendar_cards.client_id
  )
  OR auth.uid() = client_id
);

-- Politique d'insertion pour les coachs
CREATE POLICY "Les coachs peuvent créer des cartes pour leurs clients"
ON public.calendar_cards
FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT coach_id FROM public.coach_clients 
    WHERE client_id = calendar_cards.client_id
  )
);

-- Politique de mise à jour pour les coachs
CREATE POLICY "Les coachs peuvent mettre à jour les cartes de leurs clients"
ON public.calendar_cards
FOR UPDATE
USING (
  auth.uid() IN (
    SELECT coach_id FROM public.coach_clients 
    WHERE client_id = calendar_cards.client_id
  )
);

-- Politique de suppression pour les coachs
CREATE POLICY "Les coachs peuvent supprimer les cartes de leurs clients"
ON public.calendar_cards
FOR DELETE
USING (
  auth.uid() IN (
    SELECT coach_id FROM public.coach_clients 
    WHERE client_id = calendar_cards.client_id
  )
);

-- Politique pour permettre aux utilisateurs de voir leurs propres cartes
CREATE POLICY "Les utilisateurs peuvent voir leurs propres cartes"
ON public.calendar_cards
FOR SELECT
USING (auth.uid() = client_id);

-- Politique pour permettre aux utilisateurs de créer leurs propres cartes
CREATE POLICY "Les utilisateurs peuvent créer leurs propres cartes"
ON public.calendar_cards
FOR INSERT
WITH CHECK (auth.uid() = client_id);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres cartes
CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres cartes"
ON public.calendar_cards
FOR UPDATE
USING (auth.uid() = client_id);

-- Politique pour permettre aux utilisateurs de supprimer leurs propres cartes
CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres cartes"
ON public.calendar_cards
FOR DELETE
USING (auth.uid() = client_id);

-- Fonction pour obtenir les cartes avec des informations supplémentaires
CREATE OR REPLACE FUNCTION get_calendar_cards_with_info(p_client_id UUID DEFAULT NULL)
RETURNS TABLE (
  id UUID,
  client_id UUID,
  title TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  color TEXT,
  progress INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  client_name TEXT,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cc.*,
    COALESCE(up.full_name, up.first_name || ' ' || up.last_name, 'Client inconnu') as client_name,
    CASE 
      WHEN cc.end_date < CURRENT_DATE THEN 'past'
      WHEN cc.start_date > CURRENT_DATE THEN 'upcoming'
      ELSE 'current'
    END as status
  FROM 
    public.calendar_cards cc
  LEFT JOIN 
    auth.users u ON cc.client_id = u.id
  LEFT JOIN 
    public.user_profiles up ON u.id = up.user_id
  WHERE 
    (p_client_id IS NULL OR cc.client_id = p_client_id)
    AND (
      -- L'utilisateur est le propriétaire
      auth.uid() = cc.client_id
      -- OU l'utilisateur est un coach qui a ce client
      OR EXISTS (
        SELECT 1 FROM public.coach_clients 
        WHERE coach_id = auth.uid() AND client_id = cc.client_id
      )
    )
  ORDER BY 
    cc.start_date, cc.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
