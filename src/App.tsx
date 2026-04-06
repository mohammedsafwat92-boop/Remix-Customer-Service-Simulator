import React, { useState, useEffect } from 'react';
import { Setup } from './components/Setup';
import { Chat } from './components/Chat';
import { Evaluation } from './components/Evaluation';
import { TraineeLogin } from './components/TraineeLogin';
import { Evaluation as EvaluationType, SimulationConfig, SessionResult, Message } from './types';
import { startSimulation, sendMessage, evaluateSimulation } from './services/gemini';
import { HeadphonesIcon, Loader2, User, LayoutDashboard, Home } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { DashboardGate } from './components/DashboardGate';
import { normalizeScenario, normalizePersonality, normalizeEmotion } from './constants';
import { db, collection, addDoc, getDocs, query, orderBy, handleFirestoreError, OperationType, auth, onAuthStateChanged, where } from './firebase';

type Step = 'login' | 'setup' | 'chat' | 'evaluation' | 'dashboard';

export default function App() {
  const [step, setStep] = useState<Step>('login');
  const [trainee, setTrainee] = useState<{ name: string; id: string } | null>(null);
  const [config, setConfig] = useState<SimulationConfig | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<'Resolved' | 'Not Fully Resolved'>('Not Fully Resolved');
  const [evaluation, setEvaluation] = useState<EvaluationType | null>(null);
  const [isDashboardAuthenticated, setIsDashboardAuthenticated] = useState(false);
  const [results, setResults] = useState<SessionResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthReady(true);
      if (user) {
        // If user is logged in, we stay on current step or move to setup if at login
        if (step === 'login') {
          // We don't automatically move to setup because we need trainee name/id
          // But we can check if they were already logged in as a trainee
          const savedTrainee = localStorage.getItem('cs_simulator_trainee');
          if (savedTrainee) {
            setTrainee(JSON.parse(savedTrainee));
            setStep('setup');
          }
        }
      } else {
        // If user logs out, go back to login
        setStep('login');
        setTrainee(null);
      }
    });

    return () => unsubscribe();
  }, [step]);

  useEffect(() => {
    const fetchResults = async () => {
      if (!auth.currentUser) {
        setResults([]);
        return;
      }

      try {
        setIsLoading(true);
        const q = query(
          collection(db, 'sessions'), 
          where('userId', '==', auth.currentUser.uid),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const fetchedResults: SessionResult[] = [];
        querySnapshot.forEach((doc) => {
          fetchedResults.push(doc.data() as SessionResult);
        });
        setResults(fetchedResults);
      } catch (err) {
        console.error('Failed to fetch results from Firestore', err);
        // Fallback to localStorage if Firestore fails
        try {
          const saved = localStorage.getItem(`cs_simulator_results_${auth.currentUser.uid}`);
          if (saved) {
            setResults(JSON.parse(saved));
          }
        } catch (e) {
          console.error('Failed to parse results from localStorage', e);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthReady) {
      fetchResults();
    }
  }, [isAuthReady, auth.currentUser]);

  const handleLogin = (name: string, id: string) => {
    const traineeData = { name, id };
    setTrainee(traineeData);
    localStorage.setItem('cs_simulator_trainee', JSON.stringify(traineeData));
    setStep('setup');
  };

  const handleStart = async (newConfig: SimulationConfig) => {
    try {
      setIsLoading(true);
      setError(null);
      const fullConfig = { ...newConfig, traineeName: trainee?.name, traineeId: trainee?.id };
      setConfig(fullConfig);
      const response = await startSimulation(fullConfig);
      setHistory(response.history);
      setStartTime(Date.now());
      setResolutionStatus('Not Fully Resolved');
      setStep('chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start simulation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    if (!config) return;
    try {
      setIsLoading(true);
      setError(null);
      
      // Optimistically update UI
      const optimisticHistory = [...history, { role: 'user' as const, text: message }];
      setHistory(optimisticHistory);

      const response = await sendMessage(config, history, message);
      setHistory(response.history);
      setResolutionStatus(response.resolutionStatus);
      
      if (response.isResolved) {
        // Small delay to let the user see the final message before evaluation
        setTimeout(() => {
          handleEndSimulation(response.resolutionStatus);
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Revert optimistic update on error
      setHistory(history);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSimulation = async (statusOverride?: 'Resolved' | 'Not Fully Resolved') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const finalStatus = (typeof statusOverride === 'string' ? statusOverride : resolutionStatus) as 'Resolved' | 'Not Fully Resolved';
      const endTime = Date.now();
      const handlingTimeSeconds = startTime ? Math.floor((endTime - startTime) / 1000) : 0;

      const result = await evaluateSimulation(history);
      setEvaluation(result);
      
      // Save result to dashboard
      if (config && trainee && auth.currentUser) {
        const newResult: SessionResult = {
          id: crypto.randomUUID(),
          userId: auth.currentUser.uid,
          traineeName: trainee.name,
          traineeId: trainee.id,
          scenario: config.driver,
          personality: config.personality,
          emotion: config.emotion,
          timestamp: new Date().toISOString(),
          evaluation: result,
          resolutionStatus: finalStatus,
          handlingTime: handlingTimeSeconds,
        };
        
        // Save to Firestore
        try {
          await addDoc(collection(db, 'sessions'), newResult);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'sessions');
        }

        setResults(prev => [newResult, ...prev]);
        
        // Also save to localStorage as backup
        try {
          const storageKey = `cs_simulator_results_${auth.currentUser.uid}`;
          const saved = localStorage.getItem(storageKey);
          const parsed = saved ? JSON.parse(saved) : [];
          localStorage.setItem(storageKey, JSON.stringify([newResult, ...parsed]));
        } catch (e) {
          console.error('Failed to save to localStorage', e);
        }
      }

      setStep('evaluation');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate simulation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearResults = () => {
    if (window.confirm('Are you sure you want to clear all trainee results?')) {
      setResults([]);
    }
  };

  const handleRestart = () => {
    setStep('setup'); // Stay in setup if logged in
    setConfig(null);
    setHistory([]);
    setEvaluation(null);
    setError(null);
    setIsDashboardAuthenticated(false);
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('cs_simulator_trainee');
      setStep('login');
      setTrainee(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleGoHome = () => {
    if (step === 'chat') {
      if (!window.confirm('Are you sure you want to leave the current simulation? Your progress will be lost.')) {
        return;
      }
    }
    handleRestart();
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={handleGoHome}>
              <div className="p-2 bg-indigo-600 text-white rounded-lg">
                <HeadphonesIcon className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                CS Training Simulator
              </h1>
            </div>

            {step !== 'login' && (
              <button
                onClick={handleGoHome}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-600 transition-colors"
                title="Return to Home"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Home</span>
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {step !== 'dashboard' && (
              <button
                onClick={() => setStep('dashboard')}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-100 rounded-lg text-sm font-medium text-slate-600 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </button>
            )}
            {trainee && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-sm font-medium text-slate-600">
                <User className="w-4 h-4" />
                {trainee.name} ({trainee.id})
                <button 
                  onClick={handleLogout}
                  className="ml-2 text-xs text-indigo-600 hover:underline"
                >
                  Logout
                </button>
              </div>
            )}
            {step === 'chat' && (
              <div className="flex items-center gap-2 text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Session Active
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
              !
            </div>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {step === 'login' && (
          <TraineeLogin onLogin={handleLogin} />
        )}

        {step === 'setup' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Setup onStart={handleStart} />
            {isLoading && (
              <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-xl border border-slate-200">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-slate-600 font-medium">Initializing Simulation...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'chat' && config && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Chat
              config={config}
              history={history}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              onEndSimulation={handleEndSimulation}
            />
            {isLoading && !history.length && (
              <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-xl border border-slate-200">
                  <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                  <p className="text-slate-600 font-medium">Evaluating Session...</p>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'evaluation' && evaluation && config && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Evaluation evaluation={evaluation} config={config} onRestart={handleRestart} />
          </div>
        )}

        {step === 'dashboard' && (
          !isDashboardAuthenticated ? (
            <DashboardGate
              onAccessGranted={() => setIsDashboardAuthenticated(true)}
              onBack={() => setStep(trainee ? 'setup' : 'login')}
            />
          ) : (
            <Dashboard
              results={results}
              onBack={() => setStep(trainee ? 'setup' : 'login')}
              onClear={handleClearResults}
            />
          )
        )}
      </main>
    </div>
  );
}
