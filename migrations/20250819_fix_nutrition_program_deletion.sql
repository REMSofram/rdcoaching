-- Supprimer la fonction existante si elle existe
DROP FUNCTION IF EXISTS public.delete_nutrition_program_with_days(UUID);

-- Créer une fonction simplifiée pour la suppression
CREATE OR REPLACE FUNCTION public.delete_nutrition_program_with_days(
  p_program_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_user_coach BOOLEAN;
  program_owner_id UUID;
  result JSONB;
BEGIN
  -- Vérifier si l'utilisateur est un coach
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'coach'::user_role
  ) INTO is_user_coach;
  
  IF NOT is_user_coach THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Seuls les coachs peuvent supprimer des programmes nutritionnels'
    );
  END IF;

  -- Vérifier que le programme existe
  SELECT client_id INTO program_owner_id
  FROM nutrition_programs 
  WHERE id = p_program_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Programme non trouvé'
    );
  END IF;

  -- Supprimer le programme (cela supprimera automatiquement les jours associés)
  DELETE FROM nutrition_programs 
  WHERE id = p_program_id
  RETURNING jsonb_build_object(
    'success', true,
    'message', 'Programme nutritionnel supprimé avec succès'
  ) INTO result;

  RETURN COALESCE(result, jsonb_build_object(
    'success', false,
    'error', 'Erreur lors de la suppression du programme'
  ));
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$;

-- Donner les permissions nécessaires
GRANT EXECUTE ON FUNCTION public.delete_nutrition_program_with_days(UUID) TO authenticated;

COMMENT ON FUNCTION public.delete_nutrition_program_with_days IS 'Supprime un programme nutritionnel et tous ses jours associés';

-- Mise à jour de la documentation
COMMENT ON TABLE public.nutrition_programs IS 'Stocke les programmes nutritionnels des clients';
COMMENT ON TABLE public.nutrition_days IS 'Stocke les jours des programmes nutritionnels avec leurs contenus détaillés';
