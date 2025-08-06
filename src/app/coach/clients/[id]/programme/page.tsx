'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getActiveProgram, 
  createProgram, 
  updateProgram,
  deleteProgram
} from '@/services/programService';
import { Program } from '@/types/Program';

interface ProgramFormData {
  title: string;
  content: string;
}

export default function ClientProgramPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const clientId = params.id;
  
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProgramFormData>({
    title: '',
    content: ''
  });

  // Charger le programme existant
  useEffect(() => {
    const loadProgram = async () => {
      if (!clientId) return;
      
      try {
        setLoading(true);
        const activeProgram = await getActiveProgram(clientId);
        setProgram(activeProgram);
        
        if (activeProgram) {
          setFormData({
            title: activeProgram.title,
            content: activeProgram.content
          });
        }
      } catch (err) {
        console.error('Error loading program:', err);
        setError('Erreur lors du chargement du programme.');
      } finally {
        setLoading(false);
      }
    };

    loadProgram();
  }, [clientId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !clientId) return;
    
    try {
      setSaving(true);
      setError(null);
      
      if (program) {
        // Mise à jour du programme existant
        const updatedProgram = await updateProgram(program.id, {
          title: formData.title,
          content: formData.content,
          is_active: true
        });
        setProgram(updatedProgram);
      } else {
        // Création d'un nouveau programme
        const newProgram = await createProgram({
          client_id: clientId,
          title: formData.title,
          content: formData.content
        });
        setProgram(newProgram);
      }
      
      // Recharger la page pour s'assurer que tout est à jour
      window.location.reload();
    } catch (err) {
      console.error('Error saving program:', err);
      setError('Erreur lors de l\'enregistrement du programme.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!program?.id || !window.confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) {
      return;
    }
    
    try {
      setDeleting(true);
      await deleteProgram(program.id);
      // Rediriger vers la page du client après suppression
      router.push(`/coach/clients/${clientId}`);
    } catch (err) {
      console.error('Error deleting program:', err);
      setError('Erreur lors de la suppression du programme.');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Gestion du programme</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {program ? 'Modifier le programme' : 'Créer un programme'}
        </h1>
        {program && (
          <span className="text-sm text-gray-500">
            Dernière mise à jour : {new Date(program.updated_at).toLocaleDateString('fr-FR')}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Titre du programme
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Programme Débutant - Semaine 1"
            required
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Contenu du programme
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder="Décrivez le programme d'entraînement ici..."
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Utilisez les retours à la ligne pour structurer le contenu.
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div>
            {program && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {deleting ? 'Suppression...' : 'Supprimer le programme'}
              </button>
            )}
          </div>
          <div className="space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
