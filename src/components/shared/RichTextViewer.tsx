'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';

interface RichTextViewerProps {
  content: string;
  className?: string;
}

export const RichTextViewer = ({ content, className = '' }: RichTextViewerProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Désactive les extensions qui ne sont pas nécessaires en lecture seule
        heading: {
          levels: [1, 2],
          HTMLAttributes: {
            class: 'my-2',
          },
        },
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-600 hover:underline',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: content,
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose max-w-none',
      },
    },
    // Désactive le rendu immédiat pour éviter les problèmes d'hydratation SSR
    immediatelyRender: false,
  });

  // Mise à jour du contenu lorsque la valeur change
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) {
    return <div className={`h-40 w-full animate-pulse bg-gray-100 rounded-md ${className}`} />;
  }

  return (
    <div className={`prose max-w-none ${className}`}>
      <EditorContent editor={editor} />
    </div>
  );
};
