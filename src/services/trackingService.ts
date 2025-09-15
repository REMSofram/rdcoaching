import { supabase } from '@/lib/supabase';

export interface TrackingData {
  date: string;
  dateLabel: string;
  poids: number | null;
  sommeil: number | null;
  energie: number | null;
  appetit: number | null;
}

export const getClientTrackingData = async (clientId: string, period: 'week' | 'month' | '3months' = 'week'): Promise<TrackingData[]> => {
  try {
    // Calculer la date de début en fonction de la période
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
    }

    // Formater la date pour la requête
    const formattedStartDate = startDate.toISOString().split('T')[0];
    
    // Récupérer les logs du client pour la période
    const { data: logs, error } = await supabase
      .from('daily_logs')
      .select('log_date, weight, sleep_hours, energy_level, appetite')
      .eq('client_id', clientId)
      .gte('log_date', formattedStartDate)
      .order('log_date', { ascending: true });

    if (error) throw error;

    // Convertir les données au format attendu par le graphique
    const formattedData = logs.map(log => {
      // Convertir l'appétit en valeur numérique (1-5)
      let appetitValue = null;
      if (log.appetite) {
        switch (log.appetite) {
          case 'faible':
            appetitValue = 2;
            break;
          case 'moyen':
            appetitValue = 3;
            break;
          case 'élevé':
            appetitValue = 4;
            break;
          default:
            appetitValue = null;
        }
      }

      // Formater la date pour l'affichage (jour mois)
      const date = new Date(log.log_date);
      const dateLabel = date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short'
      });

      return {
        date: log.log_date,
        dateLabel,
        poids: log.weight || null,
        sommeil: log.sleep_hours || null,
        energie: log.energy_level ? log.energy_level * 2 : null, // Convertir de 1-5 à 2-10
        appetit: appetitValue,
      };
    });

    return formattedData;
  } catch (error) {
    console.error('Erreur lors de la récupération des données de suivi:', error);
    return [];
  }
};
