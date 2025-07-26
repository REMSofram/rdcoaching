-- Migration pour ajouter une politique RLS permettant aux coachs de mettre à jour les profils clients
-- Date: 2025-07-26
-- Auteur: Cascade AI Assistant

-- Vérifier si la politique existe déjà
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Allow coaches to update client profiles'
  ) THEN
    -- Créer la politique RLS pour permettre aux coachs de mettre à jour les profils clients
    EXECUTE '
    CREATE POLICY "Allow coaches to update client profiles" 
    ON public.profiles
    FOR UPDATE 
    TO public
    USING (
      -- Vérifier que l''utilisateur est un coach
      EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = auth.uid() 
        AND email = ''remy.denay6@gmail.com''
      )
    )
    WITH CHECK (
      -- S''assurer que les coachs ne peuvent pas modifier leur propre rôle
      NOT (
        auth.uid() = id
      )
    )';
    
    RAISE NOTICE 'Politique RLS "Allow coaches to update client profiles" créée avec succès';
  ELSE
    RAISE NOTICE 'La politique RLS "Allow coaches to update client profiles" existe déjà';
  END IF;
END $$;
