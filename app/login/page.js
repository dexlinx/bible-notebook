"use client";
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      router.push('/');
    } catch (err) { setError(err.message); }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    try {
      if (isRegistering) await createUserWithEmailAndPassword(auth, email, password);
      else await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err) { setError(err.message); }
  };

  return (
    /* 
       FIX: min-h-screen instead of h-screen allows the page to grow.
       FIX: py-12 ensures there is breathing room at the top and bottom on small phones.
    */
    <div className="min-h-screen w-full bg-[#fdfbf7] flex flex-col items-center justify-start sm:justify-center py-12 px-6 font-sans">
      
      <div className="max-w-md w-full">
        {/* LOGO AREA */}
        <div className="text-center mb-10">
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 drop-shadow-2xl">
             <Image 
               src="/fivebroken-logo-main.png" 
               alt="Five Broken Loaves" 
               fill 
               className="object-contain" 
               priority 
             />
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 uppercase tracking-tight leading-tight">
            Faith Unfiltered
          </h1>
          <p className="text-[#1a4f8b] font-black text-[9px] tracking-[0.3em] uppercase mt-2">
            Scripture Workspace
          </p>
        </div>

        {/* LOGIN CARD */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-stone-900/5 border border-stone-100 p-8 sm:p-10">
          {error && (
            <p className="text-red-500 text-xs mb-6 text-center bg-red-50 py-3 px-4 rounded-xl border border-red-100">
              {error}
            </p>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Email</label>
              <input 
                type="email" 
                placeholder="you@example.com" 
                className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#1a4f8b]/20 text-stone-800 transition-all"
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 ml-4">Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-6 py-4 bg-stone-50 border border-stone-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#1a4f8b]/20 text-stone-800 transition-all"
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-[#1a4f8b] text-white py-4 rounded-2xl font-bold hover:bg-[#153e70] transition-all shadow-lg shadow-blue-900/10 active:scale-[0.98] mt-2"
            >
              {isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-stone-100"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-[0.2em] font-black text-stone-300">
              <span className="bg-white px-4">Or</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleLogin} 
            className="w-full bg-white border border-stone-200 text-stone-700 py-4 rounded-2xl font-bold hover:bg-stone-50 transition flex items-center justify-center gap-3 shadow-sm active:scale-[0.98]"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <button 
            onClick={() => setIsRegistering(!isRegistering)} 
            className="w-full mt-8 text-[11px] font-black uppercase tracking-[0.2em] text-stone-400 hover:text-[#1a4f8b] transition-all"
          >
            {isRegistering ? 'Sign In Instead' : "Join for Free"}
          </button>
        </div>
      </div>

    </div>
  );
}