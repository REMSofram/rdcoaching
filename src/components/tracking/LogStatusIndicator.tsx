import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface LogStatusIndicatorProps {
  status: 'completed' | 'pending' | 'missed';
  date: Date;
}

export const LogStatusIndicator = ({ status, date }: LogStatusIndicatorProps) => {
  const dayOfWeek = date.toLocaleDateString('fr-FR', { weekday: 'short' });
  const dayOfMonth = date.getDate();
  
  const getStatusInfo = () => {
    switch (status) {
      case 'completed':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          tooltip: `Complété le ${date.toLocaleDateString('fr-FR')}`,
          bgColor: 'bg-green-100',
          textColor: 'text-green-800'
        };
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5 text-amber-500" />,
          tooltip: `En attente pour le ${date.toLocaleDateString('fr-FR')}`,
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-800'
        };
      case 'missed':
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          tooltip: `Manqué le ${date.toLocaleDateString('fr-FR')}`,
          bgColor: 'bg-red-100',
          textColor: 'text-red-800'
        };
      default:
        return {
          icon: <div className="h-5 w-5 rounded-full bg-gray-200" />,
          tooltip: `Pas de données pour le ${date.toLocaleDateString('fr-FR')}`,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800'
        };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  return (
    <div className="flex flex-col items-center mx-1 group relative" title={statusInfo.tooltip}>
      <div className={`text-xs ${statusInfo.textColor} font-medium mb-1`}>
        {dayOfWeek} {dayOfMonth}
      </div>
      <div className={`p-1 rounded-full ${statusInfo.bgColor}`}>
        {statusInfo.icon}
      </div>
    </div>
  );
};

export default LogStatusIndicator;
