'use client';

import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface CustomQuillProps extends ReactQuill.ReactQuillProps {
  forwardedRef?: React.ForwardedRef<ReactQuill>;
}

const CustomQuill = forwardRef<ReactQuill, CustomQuillProps>(({ forwardedRef, ...props }, ref) => {
  const quillRef = useRef<ReactQuill>(null);
  
  // Expose the quill instance to parent components
  useImperativeHandle(forwardedRef, () => quillRef.current as ReactQuill);

  // Fix for React 19 compatibility
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      // Force a re-render after the editor is mounted
      quill.once('editor-change', () => {
        quill.blur();
        quill.focus();
      });
    }
  }, []);

  return <ReactQuill ref={quillRef} {...props} />;
});

CustomQuill.displayName = 'CustomQuill';

export default CustomQuill;
