import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const modules = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'clean']
    ],
};

const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link'
];

/**
 * Enhanced Rich Text Editor using React Quill.
 * Standardizes styling and formatting for product descriptions.
 */
const RichTextEditor = ({ value, onChange, placeholder = 'Write something amazing...' }) => {
    return (
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
            <ReactQuill
                theme="snow"
                value={value}
                onChange={onChange}
                modules={modules}
                formats={formats}
                placeholder={placeholder}
                className="h-64 mb-12"
            />
            <style dangerouslySetInnerHTML={{ __html: `
                .ql-toolbar.ql-snow {
                    border: none;
                    border-bottom: 1px solid #e4e4e7;
                    padding: 0.75rem 1rem;
                }
                .ql-container.ql-snow {
                    border: none;
                    font-size: 0.875rem;
                    font-family: inherit;
                }
                .ql-editor {
                    padding: 1.25rem 1rem;
                    min-height: 200px;
                    color: #18181b;
                }
                .ql-editor.ql-blank::before {
                    color: #a1a1aa;
                    font-style: normal;
                }
            `}} />
        </div>
    );
};

export default RichTextEditor;
