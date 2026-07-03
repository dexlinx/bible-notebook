"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { getLibraryData, addToLibrary, archiveBook, deleteBookPermanently } from '@/lib/library-service';
import { Plus, Book, Trash2, ExternalLink, Loader2, LogOut, Search, X, ChevronRight, LayoutGrid, Archive, RotateCcw } from 'lucide-react';

const ALL_BOOKS = [
  { id: 'GEN', name: 'Genesis', cat: 'OT' }, { id: 'EXO', name: 'Exodus', cat: 'OT' }, { id: 'LEV', name: 'Leviticus', cat: 'OT' }, { id: 'NUM', name: 'Numbers', cat: 'OT' }, { id: 'DEU', name: 'Deuteronomy', cat: 'OT' }, { id: 'JOS', name: 'Joshua', cat: 'OT' }, { id: 'JDG', name: 'Judges', cat: 'OT' }, { id: 'RUT', name: 'Ruth', cat: 'OT' }, { id: '1SA', name: '1 Samuel', cat: 'OT' }, { id: '2SA', name: '2 Samuel', cat: 'OT' }, { id: '1KI', name: '1 Kings', cat: 'OT' }, { id: '2KI', name: '2 Kings', cat: 'OT' }, { id: '1CH', name: '1 Chronicles', cat: 'OT' }, { id: '2CH', name: '2 Chronicles', cat: 'OT' }, { id: 'EZR', name: 'Ezra', cat: 'OT' }, { id: 'NEH', name: 'Nehemiah', cat: 'OT' }, { id: 'EST', name: 'Esther', cat: 'OT' }, { id: 'JOB', name: 'Job', cat: 'OT' }, { id: 'PSA', name: 'Psalms', cat: 'OT' }, { id: 'PRO', name: 'Proverbs', cat: 'OT' }, { id: 'ECC', name: 'Ecclesiastes', cat: 'OT' }, { id: 'SNG', name: 'Song of Solomon', cat: 'OT' }, { id: 'ISA', name: 'Isaiah', cat: 'OT' }, { id: 'JER', name: 'Jeremiah', cat: 'OT' }, { id: 'LAM', name: 'Lamentations', cat: 'OT' }, { id: 'EZK', name: 'Ezekiel', cat: 'OT' }, { id: 'DAN', name: 'Daniel', cat: 'OT' }, { id: 'HOS', name: 'Hosea', cat: 'OT' }, { id: 'JOL', name: 'Joel', cat: 'OT' }, { id: 'AMO', name: 'Amos', cat: 'OT' }, { id: 'OBA', name: 'Obadiah', cat: 'OT' }, { id: 'JON', name: 'Jonah', cat: 'OT' }, { id: 'MIC', name: 'Micah', cat: 'OT' }, { id: 'NAM', name: 'Nahum', cat: 'OT' }, { id: 'HAB', name: 'Habakkuk', cat: 'OT' }, { id: 'ZEP', name: 'Zephaniah', cat: 'OT' }, { id: 'HAG', name: 'Haggai', cat: 'OT' }, { id: 'ZEC', name: 'Zechariah', cat: 'OT' }, { id: 'MAL', name: 'Malachi', cat: 'OT' },
  { id: 'MAT', name: 'Matthew', cat: 'NT' }, { id: 'MRK', name: 'Mark', cat: 'NT' }, { id: 'LUK', name: 'Luke', cat: 'NT' }, { id: 'JHN', name: 'John', cat: 'NT' }, { id: 'ACT', name: 'Acts', cat: 'NT' }, { id: 'ROM', name: 'Romans', cat: 'NT' }, { id: '1CO', name: '1 Corinthians', cat: 'NT' }, { id: '2CO', name: '2 Corinthians', cat: 'NT' }, { id: 'GAL', name: 'Galatians', cat: 'NT' }, { id: 'EPH', name: 'Ephesians', cat: 'NT' }, { id: 'PHP', name: 'Philippians', cat: 'NT' }, { id: 'COL', name: 'Colossians', cat: 'NT' }, { id: '1TH', name: '1 Thessalonians', cat: 'NT' }, { id: '2TH', name: '2 Thessalonians', cat: 'NT' }, { id: '1TI', name: '1 Timothy', cat: 'NT' }, { id: '2TI', name: '2 Timothy', cat: 'NT' }, { id: 'TIT', name: 'Titus', cat: 'NT' }, { id: 'PHM', name: 'Philemon', cat: 'NT' }, { id: 'HEB', name: 'Hebrews', cat: 'NT' }, { id: 'JAS', name: 'James', cat: 'NT' }, { id: '1PE', name: '1 Peter', cat: 'NT' }, { id: '2PE', name: '2 Peter', cat: 'NT' }, { id: '1JN', name: '1 John', cat: 'NT' }, { id: '2JN', name: '2 John', cat: 'NT' }, { id: '3JN', name: '3 John', cat: 'NT' }, { id: 'JUD', name: 'Jude', cat: 'NT' }, { id: 'REV', name: 'Revelation', cat: 'NT' }
];

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeBooks, setActiveBooks] = useState([]);
  const [archivedBooks, setArchivedBooks] = useState([]);
  const [view, setView] = useState('library');
  const [showAdd, setShowAdd] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(true);

  // 1. Auth Protection
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // 2. Data Loading with Fix for Spinner
  const loadData = async () => {
    // FIX: Only try to fetch if we have a UID, but always handle the syncing state
    if (user?.uid) {
      try {
        console.log("Fetching library for:", user.uid);
        const data = await getLibraryData(user.uid);
        setActiveBooks(data.active || []);
        setArchivedBooks(data.archived || []);
      } catch (e) { 
        console.error("Library Load Error:", e); 
      } finally {
        setIsSyncing(false); // Turn off spinner after success OR failure
      }
    } else if (!authLoading && !user) {
        // If auth finished and no user, we are redirecting anyway
        setIsSyncing(false);
    }
  };

  useEffect(() => { 
    loadData(); 
  }, [user, authLoading]);

  const handleLogout = () => signOut(auth).then(() => router.push('/login'));

  // IF STILL LOADING AUTH OR WAITING FOR FIREBASE SYNC, SHOW SPINNER
  if (authLoading || isSyncing) return (
    <div className="h-screen flex items-center justify-center bg-canvas">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-[#1a4f8b]/40" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-300">Synchronizing Table</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-canvas overflow-hidden font-sans">
      <aside className="w-64 border-r border-stone-200 bg-white flex flex-col z-20 shadow-xl shadow-stone-900/5">
        <div className="p-8 pb-12 flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-lg shadow-sm overflow-hidden border border-stone-100 bg-white">
            <Image src="/fivebroken-logo-main.png" alt="Logo" fill className="object-contain p-1" />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-sm tracking-tight block text-stone-900 leading-none uppercase text-nowrap">Broken Loaves</span>
            <span className="text-[10px] font-black text-[#1a4f8b] uppercase tracking-[0.2em]">Unfiltered</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <button onClick={() => setView('library')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-all rounded-xl ${view === 'library' ? 'font-black text-stone-900 bg-stone-50 border border-stone-100' : 'font-medium text-stone-400 hover:text-stone-900'}`}>
            <LayoutGrid size={16} className={view === 'library' ? 'text-[#1a4f8b]' : ''} /> My Table
          </button>
          <button onClick={() => setView('archive')} className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-all rounded-xl ${view === 'archive' ? 'font-black text-stone-900 bg-stone-50 border border-stone-100' : 'font-medium text-stone-400 hover:text-stone-900'}`}>
            <Archive size={16} className={view === 'archive' ? 'text-[#1a4f8b]' : ''} /> Archives
          </button>
        </nav>

        <div className="p-6 border-t border-stone-100">
           <button onClick={handleLogout} className="w-full flex items-center justify-between px-3 py-3 bg-stone-50 rounded-xl hover:bg-red-50 transition-all group overflow-hidden">
             <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-[#1a4f8b] text-white flex items-center justify-center text-[10px] font-bold shrink-0 uppercase">{user?.email?.[0] || 'U'}</div>
                <span className="text-[11px] font-bold text-stone-900 truncate">{user?.email?.split('@')[0] || 'User'}</span>
             </div>
             <LogOut size={12} className="text-stone-300 group-hover:text-red-500" />
           </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative p-12 lg:p-20 scroll-smooth">
        <div className="max-w-6xl mx-auto">
          {view === 'library' ? (
            <>
              <header className="flex justify-between items-end mb-16">
                <div>
                  <h1 className="text-5xl font-serif font-medium tracking-tight text-stone-900">Your Study Table.</h1>
                  <p className="text-stone-400 mt-3 text-lg italic font-serif">Open the scrolls and begin your reflection.</p>
                </div>
                <button onClick={() => { setSearchTerm(''); setShowAdd(true); }} className="bg-[#1a4f8b] text-white px-8 py-3 rounded-full text-sm font-black uppercase tracking-widest shadow-2xl shadow-[#1a4f8b]/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                  <Plus size={18} strokeWidth={3} /> New Study
                </button>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {activeBooks.map(bookId => (
                  <Link key={bookId} href={`/study/${bookId}`} className="group relative bg-white border border-stone-200 rounded-[2.5rem] p-10 shadow-sm hover:shadow-2xl hover:shadow-stone-200/50 hover:border-[#1a4f8b] transition-all duration-500 overflow-hidden">
                    <div className="flex justify-between items-start mb-10">
                      <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-300 group-hover:bg-[#1a4f8b] group-hover:text-white transition-all duration-300"><Book size={28} /></div>
                      <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                         <button onClick={async (e) => { e.preventDefault(); await archiveBook(user.uid, bookId); loadData(); }} className="p-2 bg-stone-50 rounded-lg text-stone-400 hover:text-[#1a4f8b] hover:bg-white border border-transparent hover:border-stone-100 transition-all shadow-sm"><Archive size={16} /></button>
                         <button onClick={async (e) => { e.preventDefault(); if (confirm("Delete?")) { await deleteBookPermanently(user.uid, bookId); loadData(); } }} className="p-2 bg-stone-50 rounded-lg text-stone-400 hover:text-red-500 hover:bg-white border border-transparent hover:border-stone-100 transition-all shadow-sm"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <h3 className="text-4xl font-serif font-bold text-stone-900 mb-2 leading-none">{ALL_BOOKS.find(b => b.id === bookId)?.name || bookId}</h3>
                    <p className="text-[11px] font-black text-stone-300 uppercase tracking-[0.2em] mb-12">Personal Notebook</p>
                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-[#1a4f8b] group-hover:gap-5 transition-all">Continue Study <ChevronRight size={16} strokeWidth={3} /></div>
                  </Link>
                ))}
                {activeBooks.length === 0 && (
                  <div className="col-span-full border-2 border-dashed border-stone-200 rounded-[3rem] py-40 text-center bg-white/50">
                    <p className="text-stone-300 font-serif italic text-3xl">The table is prepared.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <header className="mb-16">
                <h1 className="text-5xl font-serif font-medium tracking-tight text-stone-900">Archives.</h1>
                <p className="text-stone-400 mt-3 text-lg italic font-serif">Completed journals and faithful reflections.</p>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {archivedBooks.map(bookId => (
                  <div key={bookId} className="bg-white border border-stone-200 rounded-[2rem] p-8 flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
                    <h4 className="font-serif font-bold text-2xl text-stone-700 mb-1">{bookId}</h4>
                    <button onClick={async () => { await addToLibrary(user.uid, bookId); loadData(); }} className="mt-8 w-full py-3 bg-stone-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1a4f8b] hover:bg-[#1a4f8b] hover:text-white transition-all flex items-center justify-center gap-2 border border-stone-100"><RotateCcw size={12}/> Restore</button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/10 backdrop-blur-xl">
           <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col border border-stone-100">
              <div className="relative border-b border-stone-50 px-10 py-10 bg-white">
                <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-stone-200" size={28} />
                <input autoFocus type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Select a Book..." className="w-full pl-12 text-4xl font-serif outline-none text-stone-900" />
                <button onClick={() => setShowAdd(false)} className="absolute right-10 top-1/2 -translate-y-1/2 text-stone-300 hover:text-[#1a4f8b] transition-colors"><X size={32}/></button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 bg-stone-50/30 max-h-[50vh]">
                {['OT', 'NT'].map(cat => (
                  <div key={cat} className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#1a4f8b]">{cat === 'OT' ? 'Old Testament' : 'New Testament'}</span>
                      <div className="h-px flex-1 bg-stone-100"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {ALL_BOOKS.filter(b => b.cat === cat && b.name.toLowerCase().includes(searchTerm.toLowerCase())).map(book => (
                        <button key={book.id} onClick={async () => { await addToLibrary(user.uid, book.id); loadData(); setShowAdd(false); }} disabled={activeBooks.includes(book.id)} className={`p-5 text-left bg-white border border-stone-100 hover:border-[#1a4f8b] hover:shadow-lg transition-all rounded-2xl group ${activeBooks.includes(book.id) ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}>
                          <span className="font-bold text-stone-800 text-sm">{book.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}