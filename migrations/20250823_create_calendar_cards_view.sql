-- Suppression de la vue existante si elle existe
DROP VIEW IF EXISTS public.calendar_cards_with_info;

-- Création de la vue calendar_cards_with_info
CREATE VIEW public.calendar_cards_with_info AS
SELECT 
    cc.id,
    cc.client_id,
    cc.title,
    cc.description,
    cc.start_date,
    cc.end_date,
    cc.is_active,
    cc.created_at,
    cc.updated_at,
    
    -- Calcul de la durée en jours
    (cc.end_date - cc.start_date + 1) AS card_duration_days,
    
    -- Statut de la carte (upcoming, current, past)
    CASE 
        WHEN CURRENT_DATE < cc.start_date THEN 'upcoming'
        WHEN CURRENT_DATE BETWEEN cc.start_date AND cc.end_date THEN 'current'
        ELSE 'past'
    END AS status,
    
    -- Informations du client
    p.first_name AS client_first_name,
    p.last_name AS client_last_name,
    p.email AS client_email
FROM 
    public.calendar_cards cc
LEFT JOIN 
    public.profiles p ON cc.client_id = p.id;

-- Politique de sécurité pour la vue
GRANT SELECT ON public.calendar_cards_with_info TO authenticated;

-- Commentaire pour documenter la vue
COMMENT ON VIEW public.calendar_cards_with_info IS 'Vue qui fournit des informations enrichies sur les cartes de calendrier, y compris le statut et les informations du client.';
