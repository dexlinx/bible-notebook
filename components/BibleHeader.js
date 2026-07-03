"use client";
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ChevronDown, X, Home, Type } from 'lucide-react';
import { BIBLE_BOOKS } from '@/lib/bible-data';

const BIBLE_FONT_OPTIONS = [
  { id: 'font-reading-serif', name: 'Instrument' },
  { id: 'font-reading-lora', name: 'Lora' },
  { id: 'font-reading-sans', name: 'Inter' },
  { id: 'font-reading-dyslexic', name: 'Dyslexic' },
];

export default function BibleHeader({ 
  bookId, chapter, setChapter, 
  bibleId, setBibleId, translations, 
  activeFont, setFont 
}) {
  const [showPicker, setShowPicker] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const fontMenuRef = useRef(null);
  
  const currentBook = BIBLE_BOOKS.find(b => b.id === bookId);
  const totalChapters = currentBook?.chapters || 1;

  useEffect(() => {
    function handleClickOutside(e) {
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target)) setShowFontMenu(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="h-16 border-b border-[#e8e4db] px-8 flex items-center justify-between sticky top-0 bg-[#fdfbf7]/80 backdrop-blur-md z-40">
      <div className="flex items-center gap-6">
        <Link href="/" className="relative w-8 h-8 rounded-full overflow-hidden border border-stone-200 bg-white shadow-sm flex items-center justify-center hover:scale-110 transition-transform">
          <Image src="/fivebroken-logo-main.png" alt="Logo" fill className="object-contain p-1" />
        </Link>
        <div className="w-px h-4 bg-stone-200" />
        <button onClick={() => setShowPicker(!showPicker)} className="flex items-center gap-2 text-sm font-bold tracking-tight text-stone-900 group">
          {bookId} <span className="text-[#1a4f8b]">{chapter}</span>
          <ChevronDown size={14} className="text-stone-300 group-hover:text-[#1a4f8b] transition-colors" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        {/* SCRIPTURE FONT ONLY */}
        <div className="relative" ref={fontMenuRef}>
          <button 
            onClick={() => setShowFontMenu(!showFontMenu)}
            className={`p-2 rounded-lg transition-all ${showFontMenu ? 'bg-stone-200 text-[#1a4f8b]' : 'text-stone-400 hover:text-stone-900'}`}
          >
            <Type size={18} />
          </button>
          
          {showFontMenu && (
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-40 bg-white shadow-2xl border border-stone-100 rounded-2xl p-2 z-50 animate-in zoom-in-95">
              <p className="text-[9px] font-black uppercase tracking-widest text-stone-300 mb-2 px-2 pt-1">Scripture Font</p>
              {BIBLE_FONT_OPTIONS.map(f => (
                <button
                  key={f.id}
                  onClick={() => { setFont(f.id); setShowFontMenu(false); }}
                  className={`w-full text-left px-3 py-2 text-xs font-bold rounded-xl transition-all ${activeFont === f.id ? 'bg-[#1a4f8b] text-white' : 'hover:bg-stone-50 text-stone-500'}`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex bg-stone-100/50 rounded-lg p-0.5 border border-stone-200 shadow-sm">
          <button onClick={() => setChapter(Math.max(1, chapter - 1))} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-stone-400"><ChevronLeft size={16}/></button>
          <button onClick={() => setChapter(chapter + 1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-stone-400"><ChevronRight size={16}/></button>
        </div>

        <select 
          value={bibleId} 
          onChange={(e) => setBibleId(e.target.value)}
          className="bg-transparent text-[10px] font-black uppercase tracking-[0.2em] text-[#1a4f8b] outline-none cursor-pointer border-none focus:ring-0"
        >
          {translations.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      {showPicker && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-stone-900/10 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.15)] border border-stone-100 overflow-hidden animate-in slide-in-from-top-4">
            <div className="p-6 border-b border-stone-50 flex justify-between items-center bg-stone-50/30">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Chapters</span>
              <button onClick={() => setShowPicker(false)} className="text-stone-300 hover:text-black transition-colors"><X size={20}/></button>
            </div>
            <div className="grid grid-cols-5 gap-1 p-5 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {[...Array(totalChapters)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => { setChapter(i+1); setShowPicker(false); }}
                  className={`h-10 text-xs font-bold rounded-xl transition-all ${chapter === i+1 ? 'bg-[#1a4f8b] text-white shadow-lg' : 'hover:bg-stone-50 text-stone-600'}`}
                >
                  {i+1}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}