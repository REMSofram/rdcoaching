'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/shared';
import { Input } from '@/components/shared';

export default function OnboardingPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    birthDate: '',
    height: '',
    weight: '',
    goals: '',
    medicalHistory: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, updateProfile, role } = useAuth();
  const router = useRouter();

  // Vérifier si l'utilisateur est un coach ou déjà onboardé
  React.useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Si l'utilisateur est un coach ou déjà onboardé, le rediriger
    const checkOnboarding = async () => {
      const isCoach = user.email === 'remy.denay6@gmail.com';
      if (isCoach) {
        router.push('/coach/dashboard');
        return;
      }

      // Vérifier si l'utilisateur a déjà complété l'onboarding
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_onboarded')
        .eq('id', user.id)
        .single();

      if (profile?.is_onboarded) {
        router.push('/client/dashboard');
      }
    };

    checkOnboarding();
  }, [user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validation des champs obligatoires
      if (!formData.firstName || !formData.lastName) {
        throw new Error('Le prénom et le nom sont obligatoires');
      }

      // Préparer les données pour la mise à jour du profil
      const profileUpdate = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        birth_date: formData.birthDate, // Utiliser le bon nom de champ selon le schéma
        height: formData.height ? parseFloat(formData.height) : null,
        starting_weight: formData.weight ? parseFloat(formData.weight) : null,
        objectives: formData.goals,
        injuries: formData.medicalHistory,
        is_onboarded: true,
        role: user?.email === 'remy.denay6@gmail.com' ? 'coach' : 'client'
      };

      console.log('Tentative de mise à jour du profil avec les données:', profileUpdate);

      const { error } = await updateProfile(profileUpdate);

      console.log('Réponse de updateProfile:', { error });

      if (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        throw new Error(
          error.message || 'Une erreur est survenue lors de la mise à jour de votre profil. Veuillez réessayer.'
        );
      }

      // Rediriger vers le tableau de bord approprié
      const redirectPath = user?.email === 'remy.denay6@gmail.com' 
        ? '/coach/dashboard' 
        : '/client/dashboard';
      
      console.log('Redirection vers:', redirectPath);
      router.push(redirectPath);
      
    } catch (err: any) {
      console.error('Erreur lors de la soumission du formulaire:', err);
      
      // Afficher un message d'erreur plus détaillé si disponible
      const errorMessage = err.message || 'Une erreur est survenue lors de la mise à jour de votre profil';
      setError(errorMessage);
      
      // Faire défiler vers le haut pour afficher le message d'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complétez votre profil
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ces informations nous permettront de personnaliser votre expérience.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="Prénom"
                name="firstName"
                type="text"
                required
                value={formData.firstName}
                onChange={handleChange}
              />
              <Input
                label="Nom"
                name="lastName"
                type="text"
                required
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="Téléphone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
              />
              <Input
                label="Date de naissance"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="Taille (cm)"
                name="height"
                type="number"
                min="100"
                max="250"
                value={formData.height}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="Poids (kg)"
                name="weight"
                type="number"
                min="30"
                max="300"
                step="0.1"
                value={formData.weight}
                onChange={handleChange}
              />
              
              <div>
                <label htmlFor="goals" className="block text-sm font-medium text-gray-700">
                  Objectifs principaux
                </label>
                <select
                  id="goals"
                  name="goals"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={formData.goals}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner...</option>
                  <option value="weight_loss">Perte de poids</option>
                  <option value="muscle_gain">Prise de masse musculaire</option>
                  <option value="endurance">Amélioration de l'endurance</option>
                  <option value="toning">Tonification</option>
                  <option value="fitness">Remise en forme générale</option>
                  <option value="other">Autre</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="medicalHistory" className="block text-sm font-medium text-gray-700">
                Antécédents médicaux (facultatif)
              </label>
              <div className="mt-1">
                <textarea
                  id="medicalHistory"
                  name="medicalHistory"
                  rows={3}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Blessures, maladies chroniques, allergies, etc."
                  value={formData.medicalHistory}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                isLoading={isLoading}
              >
                {isLoading ? 'Enregistrement...' : 'Terminer mon profil'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
