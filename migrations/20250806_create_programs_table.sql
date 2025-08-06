-- Migration pour créer la table des programmes d'entraînement
-- Date: 2025-08-06
-- Auteur: Cascade AI Assistant

-- Créer la table programs
CREATE TABLE IF NOT EXISTS public.programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contrainte de clé étrangère
    CONSTRAINT fk_client FOREIGN KEY (client_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Activer RLS sur la table
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Politique d'accès : les coachs peuvent gérer tous les programmes
CREATE POLICY "Allow coaches to manage all programs"
ON public.programs
FOR ALL
USING (
    -- Tous les utilisateurs avec le rôle 'coach' ou 'admin' ont accès complet
    EXISTS (
        SELECT 1 FROM auth.users
        WHERE id = auth.uid() 
        AND (raw_user_meta_data->>'role' = 'coach' OR raw_user_meta_data->>'role' = 'admin')
    )
);

-- Politique d'accès : les clients peuvent voir leur propre programme
CREATE POLICY "Allow clients to view their own program"
ON public.programs
FOR SELECT
USING (
    client_id = auth.uid()
    AND is_active = true
);

-- Créer un index pour améliorer les performances des requêtes par client
CREATE INDEX IF NOT EXISTS idx_programs_client_id ON public.programs(client_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le déclencheur pour mettre à jour automatiquement updated_at
CREATE TRIGGER update_programs_updated_at
BEFORE UPDATE ON public.programs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Commentaires sur la table et les colonnes
COMMENT ON TABLE public.programs IS 'Table des programmes d''entraînement assignés aux clients';
COMMENT ON COLUMN public.programs.client_id IS 'ID du client à qui le programme est assigné';
COMMENT ON COLUMN public.programs.title IS 'Titre du programme d''entraînement';
COMMENT ON COLUMN public.programs.content IS 'Contenu détaillé du programme d''entraînement';
COMMENT ON COLUMN public.programs.is_active IS 'Indique si le programme est actif (un seul programme actif par client)';
COMMENT ON COLUMN public.programs.created_at IS 'Date de création du programme';
COMMENT ON COLUMN public.programs.updated_at IS 'Date de dernière mise à jour du programme';
