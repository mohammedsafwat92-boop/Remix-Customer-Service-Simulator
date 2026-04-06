import React, { useState } from 'react';
import { SimulationConfig } from '../types';
import { Play, Settings2, ChevronDown, Info, AlertCircle, Target, Lightbulb, UserCircle } from 'lucide-react';
import { SCENARIOS, PERSONALITIES, EMOTIONAL_STATES } from '../constants';

interface SetupProps {
  onStart: (config: SimulationConfig) => void;
}

const CUSTOMER_TYPES = [
  { id: '1', label: 'Indian (English)' },
  { id: '2', label: 'British (English)' },
  { id: '3', label: 'American (English)' },
  { id: '4', label: 'Egyptian (English)' },
  { id: '5', label: 'Egyptian (Arabic)' },
  { id: '6', label: 'Middle Eastern (English)' },
  { id: '7', label: 'Middle Eastern (Arabic)' },
];

export function Setup({ onStart }: SetupProps) {
  const [config, setConfig] = useState<SimulationConfig>({
    driver: SCENARIOS[0],
    personality: '', // Start with empty for placeholder
    emotion: '', // Start with empty for placeholder
    difficulty: 'Medium',
    customerType: '3', // American English default
  });

  const selectedPersonality = PERSONALITIES.find(p => p.name === config.personality);
  const selectedEmotion = EMOTIONAL_STATES.find(e => e.name === config.emotion);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.personality) {
      alert('Please select a customer personality');
      return;
    }
    if (!config.emotion) {
      alert('Please select an emotional state');
      return;
    }
    onStart(config);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100">
        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
          <Settings2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Simulation Setup</h2>
          <p className="text-sm text-slate-500">Configure the customer persona and scenario</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Contact Driver (Scenario)
              </label>
              <div className="relative">
                <select
                  value={config.driver}
                  onChange={(e) => setConfig({ ...config, driver: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white appearance-none pr-10"
                  required
                >
                  {SCENARIOS.map((scenario) => (
                    <option key={scenario} value={scenario}>
                      {scenario}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Customer Personality
              </label>
              <div className="relative">
                <select
                  value={config.personality}
                  onChange={(e) => setConfig({ ...config, personality: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white appearance-none pr-10"
                  required
                >
                  <option value="" disabled>Select customer personality</option>
                  {PERSONALITIES.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Emotional State
                </label>
                <div className="relative">
                  <select
                    value={config.emotion}
                    onChange={(e) => setConfig({ ...config, emotion: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white appearance-none pr-10"
                    required
                  >
                    <option value="" disabled>Select emotion</option>
                    {EMOTIONAL_STATES.map((state) => (
                      <option key={state.name} value={state.name}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Difficulty
                </label>
                <select
                  value={config.difficulty}
                  onChange={(e) => setConfig({ ...config, difficulty: e.target.value as any })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white appearance-none pr-10"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Customer Type (Accent/Style)
              </label>
              <select
                value={config.customerType}
                onChange={(e) => setConfig({ ...config, customerType: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white appearance-none pr-10"
              >
                {CUSTOMER_TYPES.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-semibold mb-2">
                <UserCircle className="w-5 h-5" />
                Personality Profile
              </div>
              
              {!selectedPersonality ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                  <Info className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">Select a personality to view details</p>
                </div>
              ) : (
                <div className="space-y-4 text-sm animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <div className="flex items-center gap-2 text-slate-900 font-medium mb-1">
                      <Info className="w-4 h-4 text-slate-400" />
                      Profile
                    </div>
                    <p className="text-slate-600 leading-relaxed">{selectedPersonality.profile}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-slate-900 font-medium mb-1">
                      <AlertCircle className="w-4 h-4 text-slate-400" />
                      Typical Behaviors
                    </div>
                    <p className="text-slate-600 leading-relaxed">{selectedPersonality.behaviors}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-slate-900 font-medium mb-1">
                      <Target className="w-4 h-4 text-slate-400" />
                      Handling Strategy
                    </div>
                    <p className="text-slate-600 leading-relaxed">{selectedPersonality.strategy}</p>
                  </div>

                  <div className="pt-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium">
                      <Lightbulb className="w-4 h-4" />
                      Focus: {selectedPersonality.skillFocus}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
              <div className="flex items-center gap-2 text-rose-600 font-semibold mb-2">
                <AlertCircle className="w-5 h-5" />
                Emotional Context
              </div>
              
              {!selectedEmotion ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 py-12">
                  <Info className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">Select an emotion to view details</p>
                </div>
              ) : (
                <div className="space-y-4 text-sm animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <div className="flex items-center gap-2 text-slate-900 font-medium mb-1">
                      <Target className="w-4 h-4 text-slate-400" />
                      Indicators
                    </div>
                    <p className="text-slate-600 leading-relaxed">{selectedEmotion.indicators}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-slate-900 font-medium mb-1">
                      <Lightbulb className="w-4 h-4 text-slate-400" />
                      Agent Approach
                    </div>
                    <p className="text-slate-600 leading-relaxed">{selectedEmotion.approach}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl font-semibold transition-all hover:gap-3 focus:outline-none focus:ring-4 focus:ring-indigo-500/20"
          >
            <Play className="w-5 h-5" />
            Start Simulation
          </button>
        </div>
      </form>
    </div>
  );
}
