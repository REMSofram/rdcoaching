'use client';

import { cn } from '@/lib/utils';

interface RatingButtonsProps {
  value: number | null;
  onChange: (value: number) => void;
  className?: string;
}

export function RatingButtons({ value, onChange, className }: RatingButtonsProps) {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => onChange(num)}
          className={cn(
            'flex-1 py-2 text-sm font-medium transition-colors',
            'border rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-gray-500',
            'hover:bg-gray-100',
            value === num
              ? 'bg-black text-white border-gray-800 hover:bg-gray-800'
              : 'bg-white text-gray-700 border-gray-300'
          )}
        >
          {num}
        </button>
      ))}
    </div>
  );
}
