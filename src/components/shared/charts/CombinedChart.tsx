'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
// Les icônes ne sont plus utilisées directement dans le JSX
// Elles sont conservées dans la configuration pour référence
import { cn } from '../../../lib/utils';

// Types
type TimeRange = 'week' | 'month' | '3months';

export type DataPoint = {
  date: string;
  dateLabel: string;
  poids: number | null;
  sommeil: number | null;
  energie: number | null;
  appetit: number | null;
  sommeilConverti?: number;
};

type MetricKey = 'poids' | 'sommeil' | 'energie' | 'appetit';

interface CombinedChartProps {
  data: DataPoint[];
  clientName: string;
  className?: string;
  hideChart?: boolean;
  noDataMessage?: string;
  timeRange?: TimeRange;
  hidePeriodSelector?: boolean;
}

// Données factices pour le développement
const sampleData: DataPoint[] = [
  {
    date: '12/09',
    dateLabel: 'lundi 12 septembre 2025',
    poids: 70.6,
    sommeil: 6,
    energie: 2,
    appetit: 3,
    sommeilConverti: 3
  },
  // Ajoutez plus de données de test ici...
];

const CombinedChart = (props: CombinedChartProps) => {
  // Déstructurer avec des valeurs par défaut
  const { 
    data = sampleData, 
    clientName = '',
    className = '',
    hideChart = false,
    noDataMessage = 'Aucune donnée disponible',
    timeRange: initialTimeRange = 'week',
    hidePeriodSelector = false
  } = props;
  
  // Utiliser le timeRange des props ou la valeur par défaut
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);
  
  // Mettre à jour le timeRange si la prop change
  useEffect(() => {
    setTimeRange(initialTimeRange);
  }, [initialTimeRange]);
  
  // Afficher les données reçues pour le débogage
  useEffect(() => {
    console.log('Données reçues dans CombinedChart:', data);
    console.log('Nombre total de points de données:', data.length);
    console.log('Premier point de données:', data[0]);
    console.log('Période sélectionnée (depuis les props):', initialTimeRange);
  }, [data, initialTimeRange]);
  
  // Déboguer les changements de timeRange
  useEffect(() => {
    console.log('timeRange a changé:', timeRange);
  }, [timeRange]);
  const [visibleMetrics, setVisibleMetrics] = useState<Record<MetricKey, boolean>>({
    poids: true,
    sommeil: true,
    energie: true,
    appetit: true,
  });

  // Fonction utilitaire pour convertir les dates en timestamp pour la comparaison
  const parseDate = (dateStr: string): number => {
    if (!dateStr) return 0;
    
    // Si la date est au format ISO (AAAA-MM-JD)
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      const [_, year, month, day] = isoMatch.map(Number);
      // Créer la date en UTC pour éviter les problèmes de fuseau horaire
      const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
      return date.getTime();
    }
    
    // Si la date est au format JJ/MM/AAAA
    const frMatch = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (frMatch) {
      const [_, day, month, year] = frMatch.map(Number);
      return new Date(year, month - 1, day).getTime();
    }
    
    // Si la date est au format JJ/MM
    const shortMatch = dateStr.match(/^(\d{2})\/(\d{2})$/);
    if (shortMatch) {
      const [_, day, month] = shortMatch.map(Number);
      const now = new Date();
      return new Date(now.getFullYear(), month - 1, day).getTime();
    }
    
    // Pour les autres formats, on essaie de parser directement
    const timestamp = new Date(dateStr).getTime();
    
    // Si la date n'est pas valide, on affiche un avertissement
    if (isNaN(timestamp)) {
      console.warn(`Format de date non reconnu: ${dateStr}`);
      return 0;
    }
    
    return timestamp;
  };

  // Fonction pour formater la date pour l'affichage
  const formatDateLabel = (dateStr: string): string => {
    try {
      // Si la date est au format AAAA-MM-JJ
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-').map(Number);
        return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year.toString().slice(2)}`;
      }
      
      // Pour les autres formats, on essaie de parser avec Date
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: '2-digit'
        });
      }
      return dateStr;
    } catch (e) {
      console.warn(`Erreur de formatage de la date: ${dateStr}`, e);
      return dateStr;
    }
  };

  // Type pour les données filtrées
  interface FilteredDataPoint {
    date: string;
    dateLabel?: string;  // Pour l'affichage formaté de la date
    poids?: number;
    sommeil?: number;
    energie?: number;
    appetit?: number;
    sommeilConverti?: number;
  }

  // Filtrer les données en fonction de la période sélectionnée
  const filteredData: FilteredDataPoint[] = useMemo(() => {
    const now = new Date();
    const nowTime = now.getTime();
    let cutoffTime: number;
    
    // Définir le timestamp de coupure en fonction de la période
    if (timeRange === 'week') {
      cutoffTime = nowTime - (7 * 24 * 60 * 60 * 1000); // 7 jours en millisecondes
      console.log('Filtrage pour 1 semaine - Date de coupure:', new Date(cutoffTime).toLocaleDateString('fr-FR'));
    } else if (timeRange === 'month') {
      // Pour 1 mois, on prend le début du mois précédent
      const prevMonth = new Date(now);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      prevMonth.setDate(1);
      prevMonth.setHours(0, 0, 0, 0);
      cutoffTime = prevMonth.getTime();
      console.log('Filtrage pour 1 mois - Date de coupure:', prevMonth.toLocaleDateString('fr-FR'));
    } else if (timeRange === '3months') {
      // Pour 3 mois, on prend le début du mois il y a 3 mois
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      threeMonthsAgo.setDate(1);
      threeMonthsAgo.setHours(0, 0, 0, 0);
      cutoffTime = threeMonthsAgo.getTime();
      console.log('Filtrage pour 3 mois - Date de coupure:', threeMonthsAgo.toLocaleDateString('fr-FR'));
    } else {
      cutoffTime = 0; // Tout depuis l'époque Unix
    }
    
    console.log('=== DÉBOGAGE FILTRAGE ===');
    console.log('Période sélectionnée:', timeRange);
    console.log('Date de coupure:', new Date(cutoffTime).toLocaleDateString('fr-FR'));
    console.log('Date maintenant:', new Date(nowTime).toLocaleDateString('fr-FR'));
    console.log('Timestamp de coupure:', cutoffTime);
    console.log('Timestamp maintenant:', nowTime);
    
    // Filtrer les données
    const result: FilteredDataPoint[] = [];
    
    for (const item of data) {
      try {
        if (!item || !item.date) continue;
        
        const itemTime = parseDate(item.date);
        const isInRange = itemTime >= cutoffTime && itemTime <= nowTime;
        
        console.log(`Date: ${item.date}, Timestamp: ${itemTime}, Dans la plage: ${isInRange} (${new Date(itemTime).toLocaleDateString('fr-FR')} entre ${new Date(cutoffTime).toLocaleDateString('fr-FR')} et ${new Date(nowTime).toLocaleDateString('fr-FR')})`);
        
        if (isInRange) {
          const formattedItem: FilteredDataPoint = {
            date: item.date,
            dateLabel: formatDateLabel(item.date)
          };
          
          // Ajouter uniquement les propriétés définies et non nulles
          if (item.poids !== undefined && item.poids !== null) formattedItem.poids = item.poids;
          if (item.sommeil !== undefined && item.sommeil !== null) formattedItem.sommeil = item.sommeil;
          if (item.energie !== undefined && item.energie !== null) formattedItem.energie = item.energie;
          if (item.appetit !== undefined && item.appetit !== null) formattedItem.appetit = item.appetit;
          if (item.sommeilConverti !== undefined && item.sommeilConverti !== null) formattedItem.sommeilConverti = item.sommeilConverti;
          
          result.push(formattedItem);
        }
      } catch (error) {
        console.warn(`Erreur lors du traitement de la date: ${item.date}`, error);
      }
    }
    
    // Trier par date croissante
    result.sort((a, b) => parseDate(a.date) - parseDate(b.date));
    
    console.log('Données filtrées:', result);
    console.log('Nombre de points de données:', result.length);
    console.log('======================');
    
    return result;
  }, [data, timeRange]);

  // Configuration des couleurs et styles des lignes
  const metricsConfig = {
    poids: {
      color: '#2563eb',
      name: 'Poids',
      unit: 'kg',
      yAxisId: 'poids',
      strokeWidth: 3,
      strokeDasharray: undefined,
    },
    sommeil: {
      color: '#16a34a',
      name: 'Sommeil',
      unit: '/10',
      yAxisId: 'wellbeing',
      strokeWidth: 2,
      strokeDasharray: '6 4',
    },
    energie: {
      color: '#f59e0b',
      name: 'Énergie',
      unit: '/5',
      yAxisId: 'wellbeing',
      strokeWidth: 2,
      strokeDasharray: '6 4',
    },
    appetit: {
      color: '#ef4444',
      name: 'Appétit',
      unit: '/5',
      yAxisId: 'wellbeing',
      strokeWidth: 2,
      strokeDasharray: '6 4',
    },
  };

  // Gérer le basculement de la visibilité d'une métrique
  const toggleMetric = (metric: MetricKey) => {
    // Vérifier si c'est la seule métrique active
    const activeMetrics = Object.entries(visibleMetrics).filter(([_, v]) => v);
    if (activeMetrics.length === 1 && visibleMetrics[metric]) {
      // Ne pas désactiver la dernière métrique active
      return;
    }
    
    setVisibleMetrics(prev => ({
      ...prev,
      [metric]: !prev[metric],
    }));
  };

  // Formater le tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as DataPoint;
      
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">
            {dataPoint.dateLabel}
          </p>
          <div className="space-y-1">
            {payload
              .filter((entry: any) => {
                // Ne pas afficher les entrées sans valeur
                const value = dataPoint[entry.dataKey as keyof DataPoint];
                return value !== null && value !== undefined;
              })
              .map((entry: any) => {
                const metricKey = entry.dataKey as MetricKey;
                const config = metricsConfig[metricKey as keyof typeof metricsConfig];
                const value = dataPoint[metricKey as keyof DataPoint];
                
                // Formater la valeur pour l'affichage
                let displayValue = 'N/A';
                if (value !== null && value !== undefined) {
                  displayValue = `${value}${config.unit}`;
                }
                
                return (
                  <div key={entry.dataKey} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {config.name}:
                    </span>
                    <span 
                      className="ml-1 text-sm font-semibold"
                      style={{ color: entry.color }}
                    >
                      {displayValue}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Vérifier si on a des données pour chaque métrique visible
  const hasDataForMetric = useMemo(() => {
    return filteredData.some(item => 
      item && (
        (visibleMetrics.poids && item.poids !== undefined) ||
        (visibleMetrics.sommeil && item.sommeil !== undefined) ||
        (visibleMetrics.energie && item.energie !== undefined) ||
        (visibleMetrics.appetit && item.appetit !== undefined)
      )
    );
  }, [filteredData, visibleMetrics]);

  // Vérifier s'il y a suffisamment de données pour la période sélectionnée
  const hasEnoughData = useMemo(() => {
    // Compter les points de données valides (non nuls) pour chaque métrique visible
    const validDataPoints = filteredData.filter(item => 
      item && (
        (visibleMetrics.poids && item.poids !== undefined) ||
        (visibleMetrics.sommeil && item.sommeil !== undefined) ||
        (visibleMetrics.energie && item.energie !== undefined) ||
        (visibleMetrics.appetit && item.appetit !== undefined)
      )
    );
    
    const dataCount = validDataPoints.length;
    
    // Si on a plus de 0 données, on affiche le graphique
    // Les validations spécifiques par période seront gérées par le composant parent si nécessaire
    return dataCount > 0;
  }, [filteredData, visibleMetrics]);

  // Vérifier s'il y a des données à afficher
  const hasData = filteredData.length > 0 && hasEnoughData && !hideChart;
  
  // Vérifier s'il y a au moins une métrique visible
  const hasVisibleMetrics = Object.values(visibleMetrics).some(visible => visible);

  return (
    <div className={cn('w-full p-4 md:p-6 space-y-4 md:space-y-6 bg-white rounded-lg shadow-sm border border-gray-200', className)}>
      {/* En-tête avec titre et contrôles */}
      <div className="space-y-4">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Graphique des suivis
            </h2>
            
            {/* Boutons de sélection des métriques - Visibles à droite du titre en mode étiré, en dessous en mode mobile */}
            <div className="flex flex-wrap gap-2 justify-end">
              {Object.entries(metricsConfig).map(([metric, config]) => {
                const isVisible = visibleMetrics[metric as MetricKey];
                return (
                  <Button
                    key={metric}
                    variant={isVisible ? 'default' : 'outline'}
                    size="sm"
                    className={cn(
                      'h-7 sm:h-8 px-2 sm:px-3 rounded-md',
                      'text-xs sm:text-sm font-medium transition-colors',
                      isVisible ? 'text-white' : 'text-gray-600 bg-gray-100 hover:bg-gray-200',
                      isVisible && {
                        'bg-blue-500 hover:bg-blue-600': config.color === '#2563eb',
                        'bg-green-500 hover:bg-green-600': config.color === '#16a34a',
                        'bg-yellow-500 hover:bg-yellow-600': config.color === '#f59e0b',
                        'bg-red-500 hover:bg-red-600': config.color === '#ef4444',
                      }
                    )}
                    onClick={() => toggleMetric(metric as MetricKey)}
                    title={`${isVisible ? 'Masquer' : 'Afficher'} ${config.name}`}
                  >
                    {config.name}
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* Sélecteur de période */}
          {!hidePeriodSelector && (
            <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:items-center gap-2">
              <div className="inline-flex rounded-md shadow-sm w-full sm:w-auto" role="group">
                {[
                  { value: 'week' as const, label: '1 Semaine' },
                  { value: 'month' as const, label: '1 Mois' },
                  { value: '3months' as const, label: '3 Mois' },
                ].map((range) => (
                  <Button
                    key={range.value}
                    variant={timeRange === range.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange(range.value)}
                    className={cn(
                      'flex-1 sm:flex-none text-xs sm:text-sm',
                      'px-2 sm:px-3 py-1 h-8',
                      'rounded-none first:rounded-l-md last:rounded-r-md',
                      timeRange === range.value && 'z-10'
                    )}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Conteneur du graphique */}
      <Card className="overflow-hidden">
        <CardContent className="p-2 sm:p-4 md:p-6">
          {!hasVisibleMetrics ? (
            <div className="flex flex-col items-center justify-center h-[300px] sm:h-[350px] md:h-[400px] w-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
              <p className="text-gray-500 text-lg font-medium mb-2">
                Aucune métrique sélectionnée
              </p>
              <p className="text-sm text-gray-400">
                Activez au moins une métrique pour afficher le graphique.
              </p>
            </div>
          ) : !hasData ? (
            <div className="flex flex-col items-center justify-center h-[300px] sm:h-[350px] md:h-[400px] w-full bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-6 text-center">
              <p className="text-gray-500 text-lg font-medium mb-2">
                {noDataMessage}
              </p>
              <p className="text-sm text-gray-400">
                {timeRange === 'week' 
                  ? 'Au moins 3 données sont nécessaires pour afficher la semaine.'
                  : timeRange === 'month'
                    ? 'Au moins 6 données sont nécessaires pour afficher le mois.'
                    : 'Au moins 10 données sont nécessaires pour afficher les 3 derniers mois.'
                }
              </p>
            </div>
          ) : (
            <div className="h-[300px] sm:h-[350px] md:h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={filteredData}
                  margin={{
                    top: 10,
                    right: 30,
                    left: 0,
                    bottom: 10,
                  }}
                >
                  {/* Axe X */}
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 500 }}
                    interval={timeRange === 'week' ? 0 : 'preserveStartEnd'}
                    padding={{ left: 10, right: 10 }}
                    tickMargin={8}
                  />
                  
                  {/* Axe Y Gauche - Poids */}
                  <YAxis
                    yAxisId="poids"
                    orientation="left"
                    domain={['dataMin - 0.5', 'dataMax + 0.5']}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 500 }}
                    width={35}
                    label={{
                      value: 'Poids',
                      angle: -90,
                      position: 'insideLeft',
                      offset: 5,
                      style: { 
                        textAnchor: 'middle', 
                        fill: '#6b7280',
                        fontSize: 10,
                        fontWeight: 500,
                      },
                    }}
                  />
                  
                  {/* Axe Y Droit - Bien-être */}
                  <YAxis
                    yAxisId="wellbeing"
                    orientation="right"
                    domain={[0, 5]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 500 }}
                    width={35}
                    label={{
                      value: '/5',
                      angle: 90,
                      position: 'insideRight',
                      offset: 5,
                      style: { 
                        textAnchor: 'middle', 
                        fill: '#6b7280',
                        fontSize: 10,
                        fontWeight: 500,
                      },
                    }}
                  />
                
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Lignes du graphique */}
                  {(Object.keys(metricsConfig) as MetricKey[]).map((metric) => {
                    if (!visibleMetrics[metric]) return null;
                    const config = metricsConfig[metric as keyof typeof metricsConfig];
                    
                    // Vérifier s'il y a des données pour cette métrique
                    const hasData = filteredData.some(item => 
                      item[metric as keyof DataPoint] !== null && 
                      item[metric as keyof DataPoint] !== undefined
                    );
                    
                    if (!hasData) return null;
                    
                    return (
                      <Line
                        key={metric}
                        yAxisId={config.yAxisId}
                        type="monotone"
                        dataKey={metric}
                        name={config.name}
                        stroke={config.color}
                        strokeWidth={config.strokeWidth}
                        strokeDasharray={config.strokeDasharray}
                        dot={timeRange === 'week' ? { r: 3 } : false}
                        activeDot={{ r: 4, strokeWidth: 1 }}
                        connectNulls={true}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CombinedChart;
