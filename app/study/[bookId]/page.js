"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getChapterText } from '@/lib/bible-api';
import { addWordHighlight, getChapterHighlights, removeWordHighlight } from '@/lib/highlight-service';
import { BIBLE_BOOKS } from '@/lib/bible-data';
import Editor from '@/components/Editor';
import BibleHeader from '@/components/BibleHeader';
import Verse from '@/components/Verse';
import { Loader2 } from 'lucide-react';

const TRANSLATIONS = [
  { id: process.env.NEXT_PUBLIC_NASB_ID, name: 'ASV' }, 
  { id: 'de4e12af7f28f599-01', name: 'KJV' },
  { id: '9879dbb7cfe39e4d-02', name: 'WEB' }, 
];

export default function StudyPage({ params }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const resolvedParams = React.use(params);
  const bookId = resolvedParams?.bookId;
  
  const [chapter, setChapter] = useState(1);
  const [bibleId, setBibleId] = useState(TRANSLATIONS[0].id);
  const [loading, setLoading] = useState(true);
  const [processedVerses, setProcessedVerses] = useState([]);
  const [wordHighlights, setWordHighlights] = useState({});
  const [fontClass, setFontClass] = useState('font-reading-serif');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    async function load() {
      if (!bookId || !bibleId || !user?.uid) return;
      setLoading(true);
      try {
        const [data, highlights] = await Promise.all([
          getChapterText(bibleId, bookId, chapter),
          getChapterHighlights(user.uid, bookId, chapter)
        ]);

        const flatList = [];
        let currentVerseNum = "1";
        data?.content?.forEach((p) => {
          p.items?.forEach((item) => {
            if (item.type === 'tag' && (item.name === 'v' || item.attrs?.style === 'v')) {
              currentVerseNum = item.attrs?.number || item.text || currentVerseNum;
            } else if (item.type === 'text' && item.text.trim()) {
              flatList.push({ verseId: `${bookId}.${chapter}.${currentVerseNum}`, verseNum: currentVerseNum, text: item.text });
            }
          });
        });

        const groupedVerses = flatList.reduce((acc, curr) => {
          const existing = acc.find(v => v.verseId === curr.verseId);
          if (existing) existing.text += " " + curr.text;
          else acc.push(curr);
          return acc;
        }, []);

        setProcessedVerses(groupedVerses || []);
        setWordHighlights(highlights || {});
      } catch (err) { console.error(err); }
      setLoading(false);
    }
    load();
  }, [bookId, chapter, bibleId, user?.uid]);

  const onHighlight = async (verseId, start, end) => {
    if (!user?.uid) return;
    await addWordHighlight(user.uid, verseId, "", start, end);
    setWordHighlights(prev => ({
      ...prev,
      [verseId]: [...(prev[verseId] || []), { start, end }]
    }));
  };

  const onRemoveHighlight = async (verseId, highlightObj) => {
    if (!user?.uid) return;
    await removeWordHighlight(user.uid, verseId, highlightObj);
    setWordHighlights(prev => ({
      ...prev,
      [verseId]: (prev[verseId] || []).filter(h => h.start !== highlightObj.start || h.end !== highlightObj.end)
    }));
  };

  if (authLoading || !user || !bookId) return <div className="h-screen flex items-center justify-center bg-[#fdfbf7]"><Loader2 className="animate-spin text-stone-300" /></div>;

  return (
    <div className="flex h-screen bg-[#fdfbf7] overflow-hidden">
      <div className="flex-1 flex flex-col border-r border-[#e8e4db] relative shadow-2xl bg-[#fdfbf7]">
        <BibleHeader 
           bookId={bookId} chapter={chapter} setChapter={setChapter} 
           bibleId={bibleId} setBibleId={setBibleId} translations={TRANSLATIONS}
           activeFont={fontClass} setFont={setFontClass}
        />
        <div className="flex-1 overflow-y-auto px-12 lg:px-20 py-24 scroll-smooth">
          <div className="max-w-[600px] mx-auto">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#1a4f8b]/20" size={40} /></div>
            ) : (
              <div data-font={fontClass}> 
                {processedVerses.map((v, i) => (
                  <Verse 
                    key={`${v.verseId}-${i}`} 
                    verseId={v.verseId} 
                    vNum={v.verseNum} 
                    text={v.text} 
                    highlights={wordHighlights[v.verseId]} 
                    onHighlight={onHighlight}
                    onRemoveHighlight={onRemoveHighlight}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        <header className="h-16 border-b border-gray-100 px-12 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-md z-10">
           <div className="flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-[#1a4f8b]"></div>
             <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">Study Journal</span>
           </div>
           <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{bookId} {chapter}</span>
        </header>
        <div className="flex-1 overflow-y-auto p-8 lg:p-16 relative bg-white">
           <div className="max-w-[700px] mx-auto">
             <Editor bookId={bookId} chapter={chapter} userId={user?.uid} />
           </div>
        </div>
      </div>
    </div>
  );
}