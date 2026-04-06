import React from 'react';
import { Evaluation as EvaluationType, SimulationConfig } from '../types';
import { CheckCircle2, XCircle, AlertCircle, RefreshCcw, Trophy, Star, User } from 'lucide-react';

interface EvaluationProps {
  evaluation: EvaluationType;
  config: SimulationConfig;
  onRestart: () => void;
}

export function Evaluation({ evaluation, config, onRestart }: EvaluationProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 5) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 p-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-indigo-600" />
            Simulation Results
          </h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-slate-500">Review your performance and coaching tips</p>
            {config.traineeName && (
              <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
                <User className="w-3.5 h-3.5" />
                {config.traineeName} ({config.traineeId})
              </div>
            )}
          </div>
        </div>
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCcw className="w-5 h-5" />
          Start New Session
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scores */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Final Score: <span className="text-2xl ml-auto">{evaluation.finalScore.toFixed(1)}/10</span>
            </h3>
            
            <div className="space-y-4">
              {Object.entries(evaluation.scores).map(([key, score]) => (
                <div key={key} className="flex flex-col gap-1">
                  <div className="flex justify-between text-sm font-medium text-slate-600 capitalize">
                    <span>{key}</span>
                    <span>{score}/10</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full ${
                        score >= 8 ? 'bg-emerald-500' : score >= 5 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${(score / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Interaction Summary</h3>
            <p className="text-slate-700 leading-relaxed">{evaluation.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100">
              <h3 className="text-emerald-800 font-semibold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                What went well
              </h3>
              <ul className="space-y-3">
                {evaluation.pros.map((pro, i) => (
                  <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                    {pro}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-red-50/50 p-6 rounded-2xl border border-red-100">
              <h3 className="text-red-800 font-semibold mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                Areas for improvement
              </h3>
              <ul className="space-y-3">
                {evaluation.cons.map((con, i) => (
                  <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
            <h3 className="text-amber-800 font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Missed Opportunities
            </h3>
            <ul className="space-y-3">
              {evaluation.missedOpportunities.map((opp, i) => (
                <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  {opp}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
            <h3 className="text-indigo-800 font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-600" />
              Coaching Tips
            </h3>
            <ul className="space-y-3">
              {evaluation.coachingTips.map((tip, i) => (
                <li key={i} className="text-sm text-indigo-700 flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
