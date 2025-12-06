'use client';

import { useRef, useCallback, useEffect } from 'react';
import { Bold, Italic, Underline, Strikethrough, Link, List, ListOrdered, Heading1, Heading2, RemoveFormatting } from 'lucide-react';

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function HtmlEditor({ value, onChange, placeholder }: HtmlEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Sync value to editor when it changes externally
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      if (editorRef.current.innerHTML !== value) {
        editorRef.current.innerHTML = value;
      }
    }
  }, [value]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      onChange(editorRef.current.innerHTML);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  }, [onChange]);

  const execCommand = useCallback((command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    handleInput();
  }, [handleInput]);

  const formatBlock = useCallback((tag: string) => {
    editorRef.current?.focus();
    document.execCommand('formatBlock', false, tag);
    handleInput();
  }, [handleInput]);

  const insertLink = useCallback(() => {
    const url = prompt('Введите URL ссылки:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  const tools = [
    { icon: Bold, command: 'bold', title: 'Жирный (Ctrl+B)' },
    { icon: Italic, command: 'italic', title: 'Курсив (Ctrl+I)' },
    { icon: Underline, command: 'underline', title: 'Подчёркнутый (Ctrl+U)' },
    { icon: Strikethrough, command: 'strikeThrough', title: 'Зачёркнутый' },
    { type: 'separator' },
    { icon: Heading1, command: 'h1', title: 'Заголовок 1', isBlock: true },
    { icon: Heading2, command: 'h2', title: 'Заголовок 2', isBlock: true },
    { type: 'separator' },
    { icon: List, command: 'insertUnorderedList', title: 'Маркированный список' },
    { icon: ListOrdered, command: 'insertOrderedList', title: 'Нумерованный список' },
    { type: 'separator' },
    { icon: Link, command: 'link', title: 'Вставить ссылку', isLink: true },
    { icon: RemoveFormatting, command: 'removeFormat', title: 'Убрать форматирование' },
  ];

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-300 dark:border-gray-600">
        {tools.map((tool, index) => {
          if (tool.type === 'separator') {
            return (
              <div
                key={`sep-${index}`}
                className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"
              />
            );
          }

          const Icon = tool.icon!;
          return (
            <button
              key={tool.command}
              type="button"
              onClick={() => {
                if (tool.isLink) {
                  insertLink();
                } else if (tool.isBlock) {
                  formatBlock(tool.command!);
                } else {
                  execCommand(tool.command!);
                }
              }}
              title={tool.title}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <Icon className="w-4 h-4" />
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[400px] p-4 text-gray-900 dark:text-white focus:outline-none prose prose-sm dark:prose-invert max-w-none"
        style={{ whiteSpace: 'pre-wrap' }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />

      {/* Styles for placeholder */}
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
