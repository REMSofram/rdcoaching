import { cn } from "@/lib/utils";
import Link from "next/link";
import { ReactNode } from "react";

interface ToolCardProps {
  id: string;
  icon: ReactNode;
  label: string;
  description: string;
  color?: string;
}

export function ToolCard({ id, icon, label, description, color = 'blue' }: ToolCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 hover:bg-blue-50',
    red: 'bg-red-100 text-red-600 hover:bg-red-50',
    green: 'bg-green-100 text-green-600 hover:bg-green-50',
    purple: 'bg-purple-100 text-purple-600 hover:bg-purple-50',
  };

  return (
    <Link 
      href={`/coach/tools/${id}`}
      className={cn(
        "block p-6 rounded-lg border border-gray-200 hover:shadow-md transition-all",
        colorClasses[color as keyof typeof colorClasses] || colorClasses.blue
      )}
    >
      <div className="flex items-start">
        <div className="p-2 rounded-full bg-white/50 mr-4">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
          <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
}
