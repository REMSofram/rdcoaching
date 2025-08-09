-- Migration pour ajouter les fonctions RPC nécessaires pour la gestion des programmes d'entraînement
-- Date: 2025-08-09
-- Auteur: Cascade AI Assistant

-- Fonction pour créer un programme d'entraînement avec ses jours
CREATE OR REPLACE FUNCTION public.create_program_with_days(
  program_data JSONB,
  days_data JSONB[]
) 
RETURNS SETOF programs
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_program programs%ROWTYPE;
  day_item JSONB;
  day_order INTEGER := 1;
BEGIN
  -- Désactiver les autres programmes actifs pour ce client
  UPDATE programs
  SET is_active = false, updated_at = NOW()
  WHERE client_id = (program_data->>'client_id')::UUID
  AND is_active = true;
  
  -- Créer le nouveau programme
  INSERT INTO programs (
    client_id,
    title,
    content,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    (program_data->>'client_id')::UUID,
    program_data->>'title',
    program_data->>'content', -- Inclure le contenu du programme
    COALESCE((program_data->>'is_active')::BOOLEAN, true),
    NOW(),
    NOW()
  )
  RETURNING * INTO new_program;
  
  -- Ajouter les jours du programme
  FOREACH day_item IN ARRAY days_data LOOP
    INSERT INTO program_days (
      program_id,
      day_title,
      content,
      day_order,
      created_at,
      updated_at
    ) VALUES (
      new_program.id,
      day_item->>'day_title',
      day_item->>'content',
      day_order,
      NOW(),
      NOW()
    );
    
    day_order := day_order + 1;
  END LOOP;
  
  -- Retourner le programme créé avec ses jours
  RETURN QUERY
  SELECT p.*
  FROM programs p
  WHERE p.id = new_program.id;
  
  RETURN;
END;
$$;

-- Fonction pour mettre à jour un programme d'entraînement avec ses jours
CREATE OR REPLACE FUNCTION public.update_program_with_days(
  program_id UUID,
  program_data JSONB,
  days_data JSONB[]
)
RETURNS SETOF programs
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_program programs%ROWTYPE;
  day_item JSONB;
  existing_day_ids UUID[];
  updated_day_ids UUID[] := '{}';
BEGIN
  -- Mettre à jour le programme
  UPDATE programs
  SET 
    title = COALESCE(program_data->>'title', title),
    content = COALESCE(program_data->>'content', content),
    is_active = COALESCE((program_data->>'is_active')::BOOLEAN, is_active),
    updated_at = NOW()
  WHERE id = program_id
  RETURNING * INTO updated_program;
  
  -- Récupérer les IDs des jours existants
  SELECT array_agg(id) INTO existing_day_ids
  FROM program_days
  WHERE program_id = program_id;
  
  -- Mettre à jour ou insérer les jours
  DECLARE
    current_day_order INTEGER := 1;
  BEGIN
    FOREACH day_item IN ARRAY days_data LOOP
      IF day_item->>'id' IS NOT NULL THEN
        -- Mettre à jour un jour existant
        UPDATE program_days
        SET 
          day_title = day_item->>'day_title',
          content = day_item->>'content',
          day_order = current_day_order,
          updated_at = NOW()
        WHERE id = (day_item->>'id')::UUID
        RETURNING id INTO updated_day_ids[array_length(updated_day_ids, 1) + 1];
      ELSE
        -- Insérer un nouveau jour
        INSERT INTO program_days (
          program_id,
          day_title,
          content,
          day_order,
          created_at,
          updated_at
        ) VALUES (
          program_id,
          day_item->>'day_title',
          day_item->>'content',
          current_day_order,
          NOW(),
          NOW()
        )
        RETURNING id INTO updated_day_ids[array_length(updated_day_ids, 1) + 1];
      END IF;
      
      current_day_order := current_day_order + 1;
    END LOOP;
  END;
  
  -- Supprimer les jours qui n'existent plus
  DELETE FROM program_days
  WHERE program_id = program_id
  AND id != ALL(updated_day_ids);
  
  -- Retourner le programme mis à jour
  RETURN QUERY
  SELECT *
  FROM programs
  WHERE id = program_id;
  
  RETURN;
END;
$$;

-- Fonction pour récupérer le programme actif d'un client avec ses jours
CREATE OR REPLACE FUNCTION public.get_active_program_with_days(client_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'program', row_to_json(p.*),
    'program_days', COALESCE(
      (SELECT jsonb_agg(row_to_json(d.*) ORDER BY d.day_order)
       FROM program_days d 
       WHERE d.program_id = p.id),
      '[]'::jsonb
    )
  )
  INTO result
  FROM programs p
  WHERE p.client_id = $1
  AND p.is_active = true
  LIMIT 1;
  
  RETURN result;
END;
$$;

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.create_program_with_days(JSONB, JSONB[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_program_with_days(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_program_with_days(UUID, JSONB, JSONB[]) TO authenticated;
