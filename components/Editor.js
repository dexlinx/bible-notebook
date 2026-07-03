"use client";
import React, { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { saveNote, loadNote } from '@/lib/note-service';
import { 
  Bold, Italic, Highlighter, List, Type, 
  ListOrdered, Palette, Check, ALargeSmall 
} from 'lucide-react';

// --- CUSTOM FONT SIZE EXTENSION ---
const FontSize = Extension.create({
  name: 'fontSize',
  addOptions() { return { types: ['textStyle'] }; },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize,
            renderHTML: attributes => {
              if (!attributes.fontSize) return {};
              return { style: `font-size: ${attributes.fontSize}` };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize }).run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain().setMark('textStyle', { fontSize: null }).run();
      },
    };
  },
});

const EDITOR_FONTS = [
  { id: 'font-reading-serif', name: 'Instrument' },
  { id: 'font-reading-lora', name: 'Lora' },
  { id: 'font-reading-sans', name: 'Inter' },
  { id: 'font-reading-dyslexic', name: 'Dyslexic' },
];

const FONT_SIZES = [
  { name: 'Small', size: '14px' },
  { name: 'Normal', size: '18px' },
  { name: 'Large', size: '24px' },
  { name: 'Extra Large', size: '32px' },
];

const COLOR_PALETTE = [
  { name: 'Default', color: '#1a1a1a' },
  { name: 'Navy', color: '#1a4f8b' },
  { name: 'Slate', color: '#64748b' },
  { name: 'Brick', color: '#991b1b' },
  { name: 'Forest', color: '#166534' },
  { name: 'Gold', color: '#854d0e' },
];

export default function Editor({ bookId, chapter, userId }) {
  const [activeFont, setActiveFont] = useState('font-reading-lora');
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showColorMenu, setShowColorMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const menuRef = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: true },
        orderedList: { keepMarks: true, keepAttributes: true },
        listItem: {},
      }),
      TextStyle,
      Color,
      FontSize, // Custom extension
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: 'Share your reflections...' }),
    ],
    onUpdate: ({ editor }) => {
      if (userId) saveNote(userId, bookId, chapter, editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-stone lg:prose-xl focus:outline-none min-h-[80vh] leading-relaxed text-stone-800 pb-32 transition-all duration-500',
      },
    },
  });

  useEffect(() => {
    async function fetchNote() {
      if (!editor || !userId) return;
      const saved = await loadNote(userId, bookId, chapter);
      editor.commands.setContent(saved || "");
    }
    fetchNote();
  }, [bookId, chapter, editor, userId]);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowFontMenu(false);
        setShowColorMenu(false);
        setShowSizeMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!editor) return null;

  return (
    <div className="relative flex flex-col h-full" data-font={activeFont} ref={menuRef}>
      <div className="w-full bg-white border border-stone-200 rounded-3xl p-10 lg:p-16 shadow-sm transition-all duration-500 focus-within:border-[#1a4f8b] focus-within:shadow-xl focus-within:shadow-[#1a4f8b]/5">
        <EditorContent editor={editor} />
      </div>

      <div className="fixed bottom-10 left-[75%] -translate-x-1/2 flex items-center gap-1 p-2 bg-white/95 backdrop-blur-xl border border-stone-200 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50">
        
        {/* FONT SELECTOR */}
        <div className="relative">
          <button onClick={() => { setShowFontMenu(!showFontMenu); setShowColorMenu(false); setShowSizeMenu(false); }} className={`p-3 rounded-full transition ${showFontMenu ? 'text-[#1a4f8b] bg-stone-100' : 'text-stone-400 hover:text-stone-900'}`}>
            <Type size={18} />
          </button>
          {showFontMenu && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-40 bg-white shadow-2xl border border-stone-100 rounded-2xl p-2 animate-in slide-in-from-bottom-2 duration-200">
               <p className="text-[9px] font-black uppercase tracking-widest text-stone-300 mb-2 px-2 pt-1">Journal Font</p>
               {EDITOR_FONTS.map(f => (
                 <button key={f.id} onClick={() => { setActiveFont(f.id); setShowFontMenu(false); }} className={`w-full text-left px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all ${activeFont === f.id ? 'bg-[#1a4f8b] text-white' : 'hover:bg-stone-50 text-stone-500'}`}>{f.name}</button>
               ))}
            </div>
          )}
        </div>

        {/* SIZE SELECTOR */}
        <div className="relative">
          <button onClick={() => { setShowSizeMenu(!showSizeMenu); setShowFontMenu(false); setShowColorMenu(false); }} className={`p-3 rounded-full transition ${showSizeMenu ? 'text-[#1a4f8b] bg-stone-100' : 'text-stone-400 hover:text-stone-900'}`}>
            <ALargeSmall size={18} />
          </button>
          {showSizeMenu && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-40 bg-white shadow-2xl border border-stone-100 rounded-2xl p-2 animate-in slide-in-from-bottom-2 duration-200">
               <p className="text-[9px] font-black uppercase tracking-widest text-stone-300 mb-2 px-2 pt-1">Font Size</p>
               {FONT_SIZES.map(s => (
                 <button 
                  key={s.size} 
                  onClick={() => { editor.chain().focus().setFontSize(s.size).run(); setShowSizeMenu(false); }} 
                  className={`w-full text-left px-3 py-1.5 text-[10px] font-bold rounded-xl transition-all ${editor.isActive('textStyle', { fontSize: s.size }) ? 'bg-[#1a4f8b] text-white' : 'hover:bg-stone-50 text-stone-500'}`}
                 >
                   {s.name}
                 </button>
               ))}
            </div>
          )}
        </div>

        {/* COLOR SELECTOR */}
        <div className="relative">
          <button onClick={() => { setShowColorMenu(!showColorMenu); setShowFontMenu(false); setShowSizeMenu(false); }} className={`p-3 rounded-full transition ${showColorMenu ? 'text-[#1a4f8b] bg-stone-100' : 'text-stone-400 hover:text-stone-900'}`}>
            <Palette size={18} />
          </button>
          {showColorMenu && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-40 bg-white shadow-2xl border border-stone-100 rounded-2xl p-2 animate-in slide-in-from-bottom-2 duration-200">
               <p className="text-[9px] font-black uppercase tracking-widest text-stone-300 mb-2 px-2 pt-1">Text Color</p>
               {COLOR_PALETTE.map(c => (
                 <button key={c.color} onClick={() => { editor.chain().focus().setColor(c.color).run(); setShowColorMenu(false); }} className="w-full text-left px-3 py-2 flex items-center justify-between group hover:bg-stone-50 rounded-xl transition-all">
                   <div className="flex items-center gap-2">
                     <div className="w-3 h-3 rounded-full border border-stone-200" style={{ backgroundColor: c.color }}></div>
                     <span className="text-[10px] font-bold text-stone-600">{c.name}</span>
                   </div>
                   {editor.isActive('textStyle', { color: c.color }) && <Check size={12} className="text-[#1a4f8b]" />}
                 </button>
               ))}
            </div>
          )}
        </div>

        <div className="w-px h-6 bg-stone-100 mx-1" />

        <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-3 rounded-full transition ${editor.isActive('bold') ? 'text-[#1a4f8b] bg-stone-100 font-bold' : 'text-stone-400 hover:text-stone-900'}`}><Bold size={18} /></button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-3 rounded-full transition ${editor.isActive('italic') ? 'text-[#1a4f8b] bg-stone-100 font-bold' : 'text-stone-400'}`}><Italic size={18} /></button>
        
        <div className="w-px h-6 bg-stone-100 mx-1" />
        
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`p-3 rounded-full transition ${editor.isActive('bulletList') ? 'text-[#1a4f8b] bg-stone-100 font-bold' : 'text-stone-400 hover:text-stone-900'}`}><List size={18} /></button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`p-3 rounded-full transition ${editor.isActive('orderedList') ? 'text-[#1a4f8b] bg-stone-100 font-bold' : 'text-stone-400 hover:text-stone-900'}`}><ListOrdered size={18} /></button>
        
        <div className="w-px h-6 bg-stone-100 mx-1" />
        
        <button onClick={() => editor.chain().focus().toggleHighlight({ color: '#ffcc00' }).run()} className={`p-3 rounded-full transition ${editor.isActive('highlight') ? 'bg-[#1a4f8b] text-white shadow-lg' : 'text-[#1a4f8b] hover:bg-stone-50'}`}><Highlighter size={18} /></button>
      </div>
    </div>
  );
}