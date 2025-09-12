'use client';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { useEffect, useState, useRef } from 'react';
import { useClickAway } from 'react-use';

interface TipTapEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

export const TipTapEditor = ({
  value,
  onChange,
  placeholder = 'Écrivez votre contenu ici...',
  className = '',
  readOnly = false,
}: TipTapEditorProps) => {
  const [mounted, setMounted] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef<HTMLDivElement>(null);
  
  // Gestion des clics en dehors du menu de lien
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (linkInputRef.current && !linkInputRef.current.contains(event.target as Node)) {
        setShowLinkInput(false);
        setLinkUrl('');
      }
    };

    if (showLinkInput) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLinkInput]);
  
  // Configuration de l'éditeur
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Désactive les extensions qui sont redéfinies ci-dessous
        link: false,
        underline: false,
        heading: {
          levels: [1, 2],
          HTMLAttributes: {
            class: 'my-2',
          },
        },
      }),
      Underline.configure({
        HTMLAttributes: {
          class: 'underline',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: value,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'min-h-[200px] p-4 focus:outline-none prose max-w-none',
        'data-placeholder': placeholder,
      },
    },
    // Désactive le rendu immédiat pour éviter les problèmes d'hydratation SSR
    immediatelyRender: false,
  });

  // Mise à jour du contenu lorsque la valeur change depuis l'extérieur
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [editor, value]);

  // Gestion du montage côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-40 w-full animate-pulse bg-gray-100 rounded-md ${className}`}>
        <div className="sr-only">Chargement de l'éditeur...</div>
      </div>
    );
  }

  if (!editor) {
    return null;
  }

  // Fonction pour obtenir le niveau de titre actuel
  const getCurrentHeadingLevel = (editor: Editor | null): string => {
    if (!editor) return 'paragraph';
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    return 'paragraph';
  };

  // Fonction pour gérer l'ajout de lien
  const handleSetLink = (e: React.MouseEvent) => {
    e.preventDefault();
    const previousUrl = editor.getAttributes('link').href;
    // Ne pas préremplir avec https://
    setLinkUrl(previousUrl?.replace(/^https?:\/\//, '') || '');
    setShowLinkInput(true);
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Annulé
    if (linkUrl === null) {
      setShowLinkInput(false);
      return;
    }

    // Supprimer le lien
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      // Nettoyer l'URL et ajouter https:// si nécessaire
      let finalUrl = linkUrl.trim();
      if (finalUrl) {
        // Supprimer https:// ou http:// s'ils sont déjà présents
        finalUrl = finalUrl.replace(/^https?:\/\//, '');
        // Ajouter https://
        finalUrl = 'https://' + finalUrl;
        // Mettre à jour le lien
        editor.chain().focus().extendMarkRange('link').setLink({ href: finalUrl }).run();
      }
    }
    
    setShowLinkInput(false);
    setLinkUrl('');
  };

  return (
    <div className={`border border-gray-200 rounded-md bg-white overflow-hidden ${className}`}>
      {!readOnly && (
        <div className="border-b border-gray-200 p-2">
          <div className="flex flex-wrap gap-1">
            <select
              value={getCurrentHeadingLevel(editor)}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'paragraph') {
                  editor.chain().focus().setParagraph().run();
                } else if (value === 'h1') {
                  editor.chain().focus().toggleHeading({ level: 1 }).run();
                } else if (value === 'h2') {
                  editor.chain().focus().toggleHeading({ level: 2 }).run();
                }
              }}
              className="rounded border border-gray-300 p-1 text-sm"
              title="Titre"
            >
              <option value="paragraph">Texte normal</option>
              <option value="h1">Titre 1</option>
              <option value="h2">Titre 2</option>
            </select>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('bold') ? 'bg-gray-200' : ''
              }`}
              type="button"
              title="Gras"
            >
              <span className="font-bold">B</span>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('italic') ? 'bg-gray-200' : ''
              }`}
              type="button"
              title="Italique"
            >
              <em>I</em>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('underline') ? 'bg-gray-200' : ''
              }`}
              type="button"
              title="Souligné"
            >
              <u>S</u>
            </button>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('bulletList') ? 'bg-gray-200' : ''
              }`}
              type="button"
              title="Liste à puces"
            >
              <span>•</span>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`p-2 rounded hover:bg-gray-100 ${
                editor.isActive('orderedList') ? 'bg-gray-200' : ''
              }`}
              type="button"
              title="Liste numérotée"
            >
              <span>1.</span>
            </button>
            <div className="relative">
              <button
                onClick={handleSetLink}
                className={`p-2 rounded hover:bg-gray-100 ${
                  editor.isActive('link') ? 'bg-gray-200' : ''
                }`}
                type="button"
                title="Lien"
              >
                <span className="text-blue-600">Lien</span>
              </button>
              {showLinkInput && (
                <div 
                  ref={linkInputRef}
                  className="absolute z-10 mt-1 p-2 bg-white border border-gray-200 rounded shadow-lg"
                  style={{ width: '300px' }}
                >
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="exemple.com"
                      className="p-2 border rounded"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowLinkInput(false)}
                        className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded"
                      >
                        Annuler
                      </button>
                      <button
                        type="button"
                        onClick={handleAddLink}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Appliquer
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="p-4">
        <EditorContent editor={editor} className="min-h-[200px]" />
      </div>
    </div>
  );
};
