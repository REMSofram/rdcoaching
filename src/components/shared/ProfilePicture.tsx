'use client';

import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

interface ProfilePictureProps {
  userId: string;
  currentPictureUrl?: string | null;
  onPictureUpdate: (url: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ProfilePicture({
  userId,
  currentPictureUrl,
  onPictureUpdate,
  size = 'md',
  className = '',
}: ProfilePictureProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner un fichier image valide');
      return;
    }

    // Vérifier la taille du fichier (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La taille de l\'image ne doit pas dépasser 2MB');
      return;
    }

    setIsUploading(true);
    
    try {
      // Créer un URL de prévisualisation
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Téléverser le fichier vers Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      
      // Utiliser uniquement le nom du fichier comme chemin
      const filePath = fileName;
      const bucketName = 'profile-pictures';

      console.log('Téléversement du fichier:', { bucketName, filePath });
      
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      console.log('URL publique générée:', publicUrl);

      // Mettre à jour l'URL dans le profil
      onPictureUpdate(publicUrl);
      
      toast.success('Photo de profil mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors du téléversement de l\'image:', error);
      toast.error('Une erreur est survenue lors du téléversement de l\'image');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Réinitialiser l'input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Nettoyer l'URL de prévisualisation lors du démontage
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const displayUrl = previewUrl || currentPictureUrl;

  return (
    <div className={`relative group ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100`}>
        {displayUrl ? (
          <img
            src={displayUrl}
            alt="Photo de profil"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
            <svg
              className="w-1/2 h-1/2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
        )}
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-40 rounded-full cursor-pointer">
        {isUploading ? (
          <div className="text-white">Téléchargement...</div>
        ) : (
          <div className="text-white text-center p-2">
            <svg
              className="w-6 h-6 mx-auto mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-xs">Modifier</span>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
      </div>
    </div>
  );
}
