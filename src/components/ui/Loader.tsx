import { cn } from '@/lib/utils';

type LoaderProps = {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
};

export default function Loader({ size = 'md', className }: LoaderProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-4',
    xl: 'h-16 w-16 border-4',
  };

  return (
    <div className={cn('relative inline-block', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-solid border-primary border-t-transparent',
          sizeClasses[size]
        )}
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
