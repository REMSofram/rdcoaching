import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

type InputField = {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select';
  placeholder?: string;
  step?: string;
  options?: Array<string | { value: string; label: string }>;
};

interface ToolFormProps {
  title: string;
  description: string;
  inputs: InputField[];
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  result?: string;
  backLink: string;
  children?: ReactNode;
}

export function ToolForm({
  title,
  description,
  inputs,
  onSubmit,
  result,
  backLink,
  children
}: ToolFormProps) {
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-sm">
      <div className="mb-6">
        <Link 
          href={backLink}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Retour aux outils
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-1 text-gray-600">{description}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          {inputs.map((input) => (
            <div key={input.id}>
              <Label htmlFor={input.id} className="block text-sm font-medium text-gray-700 mb-1">
                {input.label}
              </Label>
              {input.type === 'select' ? (
                <Select name={input.id} required>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Sélectionnez ${input.label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {input.options?.map((option) => {
                      const value = typeof option === 'string' ? option : option.value;
                      const label = typeof option === 'string' ? option : option.label;
                      return (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={input.id}
                  name={input.id}
                  type={input.type}
                  step={input.type === 'number' ? input.step || 'any' : undefined}
                  placeholder={input.placeholder}
                  required
                  className="w-full"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button type="submit">
            Calculer
          </Button>
        </div>
      </form>

      {result && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-md">
          <h3 className="font-medium text-blue-800">Résultat :</h3>
          <p className="mt-1 text-blue-700">{result}</p>
        </div>
      )}

      {children}
    </div>
  );
}
