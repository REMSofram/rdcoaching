import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface LogStatusIndicatorProps {
  status: 'completed' | 'pending' | 'missed';
  date: Date;
  size?: 'sm' | 'md' | 'lg';
}

export const LogStatusIndicator = ({ status, date, size = 'md' }: LogStatusIndicatorProps) => {
  console.log('LogStatusIndicator reçu:', { status, date: date?.toISOString?.() });
  const dayOfWeek = date.toLocaleDateString('fr-FR', { weekday: 'short' });
  const dayOfMonth = date.getDate();
  const textSize = size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-sm' : 'text-xs';
  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
  const pad = size === 'lg' ? 'p-1.5' : 'p-1';
  
  const getStatusInfo = () => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className={`${iconSize} text-green-500`} />,
          tooltip: `Complété le ${date.toLocaleDateString('fr-FR')}`,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case 'pending':
        return {
          icon: <Clock className={`${iconSize} text-amber-500`} />,
          tooltip: `En attente pour le ${date.toLocaleDateString('fr-FR')}`,
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-800'
        };
      case 'missed':
        return {
          icon: <XCircle className={`${iconSize} text-red-500`} />,
          tooltip: `Manqué le ${date.toLocaleDateString('fr-FR')}`,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800'
        };
      default:
        return {
          icon: <div className={`${iconSize} rounded-full bg-gray-200`} />,
          tooltip: `Pas de données pour le ${date.toLocaleDateString('fr-FR')}`,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <div className="flex flex-col items-center mx-0.5 group relative" title={statusInfo.tooltip} style={{ minWidth: '40px' }}>
      <div className={`${textSize} ${statusInfo.textColor} font-medium mb-1`}>
        {dayOfWeek} {dayOfMonth}
      </div>
      <div className={`${pad} rounded-full ${statusInfo.bgColor}`}>
        {statusInfo.icon}
      </div>
    </div>
  );
};

export default LogStatusIndicator;
