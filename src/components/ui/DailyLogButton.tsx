import Link from 'next/link';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface DailyLogButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export function DailyLogButton({ className, ...props }: DailyLogButtonProps) {
  return (
    <Link href="/client/daily-log" className="block">
      <Button 
        className={cn(
          "relative overflow-hidden group transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md cursor-pointer",
          "bg-gradient-to-r from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700/90",
          "text-white font-medium rounded-lg px-6 py-3",
          className
        )}
        {...props}
      >
        <span className="relative z-10 flex items-center">
          <svg 
            className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
            />
          </svg>
          <span className="relative">
            Remplir mon journal du jour
            <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
          </span>
        </span>
        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
      </Button>
    </Link>
  );
}
