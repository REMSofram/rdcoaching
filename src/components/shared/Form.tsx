import { ReactNode } from 'react';
import { FormProvider, SubmitHandler, useForm, UseFormProps, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type FormProps<TFormValues extends Record<string, unknown>> = {
  children: (methods: UseFormReturn<TFormValues>) => ReactNode;
  onSubmit: SubmitHandler<TFormValues>;
  options?: UseFormProps<TFormValues>;
  schema?: z.ZodType<any, any>;
  className?: string;
};

export function Form<TFormValues extends Record<string, unknown>>({
  children,
  onSubmit,
  options,
  schema,
  className = '',
}: FormProps<TFormValues>) {
  const methods = useForm<TFormValues>({
    ...options,
    resolver: schema ? zodResolver(schema) : undefined,
  });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={`space-y-6 ${className}`}
        noValidate
      >
        {children(methods)}
      </form>
    </FormProvider>
  );
}

// Composant de champ de formulaire générique
type FormFieldProps<T extends Record<string, unknown>> = {
  name: string;
  label: string;
  description?: string;
  children: (field: {
    id: string;
    name: string;
    error: string | undefined;
  }) => ReactNode;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'children'>;

export function FormField<T extends Record<string, unknown>>({
  name,
  label,
  description,
  children,
  className = '',
  ...props
}: FormFieldProps<T>) {
  const error = ''; // À implémenter avec useFormContext
  const id = `${name}-${Math.random().toString(36).substring(2, 11)}`;

  return (
    <div className={`space-y-2 ${className}`} {...props}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      {description && (
        <p className="text-sm text-gray-500 mb-2">{description}</p>
      )}
      {children({ id, name, error })}
      {error && (
        <p className="mt-1 text-sm text-red-600" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

// Composant pour les messages d'erreur
export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  
  return (
    <p className="mt-2 text-sm text-red-600" role="alert">
      {message}
    </p>
  );
}

// Composant pour les messages de succès
export function FormSuccess({ message }: { message?: string }) {
  if (!message) return null;
  
  return (
    <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg">
      {message}
    </div>
  );
}

// Composant pour regrouper les boutons d'action du formulaire
export function FormActions({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-end space-x-3 ${className}`}>
      {children}
    </div>
  );
}
