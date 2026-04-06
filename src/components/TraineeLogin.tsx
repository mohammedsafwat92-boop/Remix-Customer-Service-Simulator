import React, { useState } from 'react';
import { UserCircle, Fingerprint, ArrowRight, LogIn } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../firebase';

interface TraineeLoginProps {
  onLogin: (name: string, id: string) => void;
}

export function TraineeLogin({ onLogin }: TraineeLoginProps) {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        setName(result.user.displayName || '');
      }
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!auth.currentUser) {
      setError('Please sign in with Google first');
      return;
    }

    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    const idRegex = /^\d{7}$/;
    if (!idRegex.test(id)) {
      setError('ID Number must be exactly 7 digits');
      return;
    }

    onLogin(name.trim(), id);
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-sm border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
          <UserCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Trainee Access</h2>
        <p className="text-slate-500 mt-2">Sign in to track your progress across devices</p>
      </div>

      {!auth.currentUser ? (
        <button
          onClick={handleGoogleSignIn}
          disabled={isSigningIn}
          className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3 rounded-xl font-semibold transition-all shadow-sm mb-6 disabled:opacity-50"
        >
          {isSigningIn ? (
            <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <LogIn className="w-5 h-5 text-indigo-600" />
          )}
          Sign in with Google
        </button>
      ) : (
        <div className="mb-6 p-4 bg-indigo-50 rounded-xl flex items-center gap-3">
          <img 
            src={auth.currentUser.photoURL || ''} 
            alt="Profile" 
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
            referrerPolicy="no-referrer"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{auth.currentUser.displayName}</p>
            <p className="text-xs text-slate-500 truncate">{auth.currentUser.email}</p>
          </div>
          <button 
            onClick={() => auth.signOut()}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            Switch
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <UserCircle className="w-4 h-4" />
            Full Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="e.g. John Doe"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <Fingerprint className="w-4 h-4" />
            ID Number (7 Digits)
          </label>
          <input
            type="text"
            value={id}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(0, 7);
              setId(val);
              setError('');
            }}
            placeholder="1234567"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors font-mono"
            required
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold transition-all hover:gap-3 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
        >
          Continue to Setup
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
