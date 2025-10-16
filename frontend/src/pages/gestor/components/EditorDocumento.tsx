import React, { useEffect, useRef } from 'react';
import '@wangeditor/editor/dist/css/style.css';
import { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor';
import { Toolbar, Editor } from '@wangeditor/editor-for-react';

import { i18nChangeLanguage } from '@wangeditor/editor';


interface EditorDocumentoProps {
  value: string;
  onChange: (val: string) => void;
  height?: number;
}

const EditorDocumento: React.FC<EditorDocumentoProps> = ({ value, onChange, height = 500 }) => {
  const editorRef = useRef<IDomEditor | null>(null);

  const toolbarConfig: Partial<IToolbarConfig> = {
    // Não especificar toolbarKeys para permitir carregamento completo baseado no contexto
  };

  const editorConfig: Partial<IEditorConfig> = {
    placeholder: 'Escreva aqui o conteúdo do contrato...',
    MENU_CONF: {
      uploadImage: {
        server: '/upload-img',
        fieldName: 'file',
      },
      insertTable: {
        rowNum: 3,
        colNum: 3,
        width: '100%',
      },
      bgColor: {
        colors: ['#ffffff', '#f8f9fa', '#dee2e6', '#adb5bd', '#6c757d', '#ffc107', '#dc3545', '#007bff', '#28a745', '#dc3545', '#6f42c1'],
      },
      borderColor: {
        colors: ['#000000', '#ced4da', '#495057', '#343a40', '#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1'],
      },
      borderSize: {
        options: ['1px', '2px', '3px', '4px', '5px', '6px'],
      },
      fontColor: {
        colors: ['#000000', '#495057', '#6c757d', '#ffffff', '#dc3545', '#0d6efd'],
      },
      fontSize: {
        options: ['12px', '14px', '16px', '18px', '20px', '24px'],
      },
      fontFamily: {
        options: ['Arial', 'Georgia', 'Times New Roman', 'Courier New', 'Verdana'],
      },
    },
  };

  useEffect(() => {
    i18nChangeLanguage('en');
  }, []);

  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  return (
    <div className="border rounded-md bg-white">
      <Toolbar
        editor={editorRef.current}
        defaultConfig={toolbarConfig}
        mode="default"
        style={{ borderBottom: '1px solid #ddd' }}
      />
      <Editor
        defaultConfig={editorConfig}
        value={value}
        onCreated={(editor) => (editorRef.current = editor)}
        onChange={(editor) => onChange(editor.getHtml())}
        mode="default"
        style={{ height: height, overflowY: 'auto' }}
      />
    </div>
  );
};

export default EditorDocumento;
