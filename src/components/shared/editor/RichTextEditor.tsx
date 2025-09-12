'use client';

import { useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

// Import our custom Quill component with React 19 compatibility
const CustomQuill = dynamic(
  () => import('./CustomQuill').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="h-40 w-full animate-pulse bg-gray-100 rounded-md"></div>
    )
  }
);

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  readOnly?: boolean;
}

const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Écrivez votre contenu ici...',
  className = '',
  readOnly = false,
}: RichTextEditorProps) => {
  const quillRef = useRef<any>(null);

  // Configuration des modules de l'éditeur
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  // Configuration des formats autorisés
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'link',
  ];

  // Gestion du changement de contenu
  const handleChange = (content: string) => {
    onChange(content);
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      <CustomQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        readOnly={readOnly}
        className="bg-white rounded-md overflow-hidden border border-gray-200"
      />
      <style jsx global>{`
        .rich-text-editor .ql-container {
          min-height: 200px;
          font-family: inherit;
        }
        .rich-text-editor .ql-toolbar {
          border-top-left-radius: 0.375rem;
          border-top-right-radius: 0.375rem;
          border: 1px solid #e5e7eb;
          border-bottom: none;
        }
        .rich-text-editor .ql-container {
          border-bottom-left-radius: 0.375rem;
          border-bottom-right-radius: 0.375rem;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .rich-text-editor .ql-editor {
          min-height: 200px;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
