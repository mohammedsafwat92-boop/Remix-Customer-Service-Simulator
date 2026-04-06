import React, { useState, useMemo } from 'react';
import { SessionResult } from '../types';
import { Download, Search, LayoutDashboard, ArrowLeft, Trash2, ChevronDown, ChevronUp, FileText, CheckCircle2, AlertCircle, Lightbulb, Target, BarChart3, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import * as XLSX from 'xlsx';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

interface DashboardProps {
  results: SessionResult[];
  onBack: () => void;
  onClear: () => void;
}

export function Dashboard({ results, onBack, onClear }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const filteredResults = useMemo(() => {
    return results.filter(r => 
      r.traineeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.traineeId.includes(searchTerm) ||
      r.scenario.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [results, searchTerm]);

  // Aggregate Data for Charts
  const chartData = useMemo(() => {
    if (filteredResults.length === 0) return null;

    // 1. Average Scores per Attribute
    const attributes = ['greeting', 'empathy', 'probing', 'communication', 'resolution'];
    const avgScores = attributes.map(attr => {
      const sum = filteredResults.reduce((acc, curr) => acc + (curr.evaluation.scores[attr as keyof typeof curr.evaluation.scores] || 0), 0);
      return {
        name: attr.charAt(0).toUpperCase() + attr.slice(1),
        score: Number((sum / filteredResults.length).toFixed(1))
      };
    });

    // 2. Score Distribution (Pie Chart)
    const distribution = [
      { name: 'Excellent (8-10)', value: filteredResults.filter(r => r.evaluation.finalScore >= 8).length, color: '#10b981' },
      { name: 'Good (5-7.9)', value: filteredResults.filter(r => r.evaluation.finalScore >= 5 && r.evaluation.finalScore < 8).length, color: '#f59e0b' },
      { name: 'Needs Improvement (<5)', value: filteredResults.filter(r => r.evaluation.finalScore < 5).length, color: '#ef4444' }
    ].filter(d => d.value > 0);

    // 3. Performance Trend (Line Chart)
    // Sort by timestamp and group by date
    const sortedResults = [...filteredResults].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const trendData = sortedResults.reduce((acc: any[], curr) => {
      const date = new Date(curr.timestamp).toLocaleDateString();
      const existing = acc.find(item => item.date === date);
      if (existing) {
        existing.scores.push(curr.evaluation.finalScore);
        existing.avg = Number((existing.scores.reduce((a: number, b: number) => a + b, 0) / existing.scores.length).toFixed(1));
      } else {
        acc.push({ date, avg: curr.evaluation.finalScore, scores: [curr.evaluation.finalScore] });
      }
      return acc;
    }, []);

    // 4. Resolution Rate (Pie Chart)
    const resolutionRate = [
      { name: 'Resolved', value: filteredResults.filter(r => r.resolutionStatus === 'Resolved').length, color: '#10b981' },
      { name: 'Not Resolved', value: filteredResults.filter(r => r.resolutionStatus === 'Not Fully Resolved').length, color: '#ef4444' }
    ].filter(d => d.value > 0);

    return { avgScores, distribution, trendData, resolutionRate };
  }, [filteredResults]);

  const formatHandlingTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleExport = () => {
    const exportData = filteredResults.map(r => ({
      'Trainee ID': r.traineeId,
      'Trainee Name': r.traineeName,
      'Scenario': r.scenario,
      'Personality': r.personality,
      'Emotion': r.emotion,
      'Date': new Date(r.timestamp).toLocaleString(),
      'Resolution Status': r.resolutionStatus || 'Not Fully Resolved',
      'Handling Time': formatHandlingTime(r.handlingTime || 0),
      'Final Score': r.evaluation.finalScore,
      'Greeting': r.evaluation.scores.greeting,
      'Empathy': r.evaluation.scores.empathy,
      'Probing': r.evaluation.scores.probing,
      'Communication': r.evaluation.scores.communication,
      'Resolution': r.evaluation.scores.resolution,
      'Interaction Summary': r.evaluation.summary,
      'What Went Well': r.evaluation.pros.join('; '),
      'Areas for Improvement': r.evaluation.cons.join('; '),
      'Missed Opportunities': r.evaluation.missedOpportunities.join('; '),
      'Coaching Tips': r.evaluation.coachingTips.join('; '),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trainee Results');
    XLSX.writeFile(wb, `Trainee_Results_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-indigo-600" />
              Trainee Dashboard
            </h1>
            <p className="text-slate-500 mt-1">Monitor and export trainee performance data</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {results.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={filteredResults.length === 0}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm"
          >
            <Download className="w-5 h-5" />
            Export to Excel
          </button>
        </div>
      </div>

      {/* Visualizations Section */}
      {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Average Attribute Scores */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900">Average Attribute Scores</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.avgScores}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="score" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Score Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900">Score Distribution</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Resolution Rate */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900">Resolution Rate</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.resolutionRate}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.resolutionRate.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Trend */}
          <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900">Performance Trend (Avg. Final Score)</h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.trendData}>
                  <defs>
                    <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="avg" 
                    stroke="#4f46e5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAvg)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, or scenario..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-sm font-semibold uppercase tracking-wider">
                <th className="px-6 py-4 border-b border-slate-200">Trainee ID</th>
                <th className="px-6 py-4 border-b border-slate-200">Name</th>
                <th className="px-6 py-4 border-b border-slate-200">Scenario</th>
                <th className="px-6 py-4 border-b border-slate-200">Personality</th>
                <th className="px-6 py-4 border-b border-slate-200">Emotion</th>
                <th className="px-6 py-4 border-b border-slate-200">Date</th>
                <th className="px-6 py-4 border-b border-slate-200">Resolution</th>
                <th className="px-6 py-4 border-b border-slate-200">Time</th>
                <th className="px-6 py-4 border-b border-slate-200 text-center">Score</th>
                <th className="px-6 py-4 border-b border-slate-200">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <React.Fragment key={result.id}>
                    <tr 
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${expandedRow === result.id ? 'bg-indigo-50/30' : ''}`}
                      onClick={() => toggleRow(result.id)}
                    >
                      <td className="px-6 py-4 font-mono text-sm text-slate-600">{result.traineeId}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{result.traineeName}</td>
                      <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]">{result.scenario}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                          {result.personality}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="px-2 py-1 bg-rose-50 rounded-lg text-xs font-medium text-rose-600">
                          {result.emotion}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(result.timestamp).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          result.resolutionStatus === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {result.resolutionStatus || 'Not Fully Resolved'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatHandlingTime(result.handlingTime || 0)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${
                          result.evaluation.finalScore >= 8 ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          result.evaluation.finalScore >= 5 ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {result.evaluation.finalScore.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-500"
                            title="View Details"
                          >
                            {expandedRow === result.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedRow === result.id && (
                      <tr>
                        <td colSpan={8} className="px-6 py-8 bg-slate-50/50 border-b border-slate-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-300">
                            {/* Left Column: Summary & Scores */}
                            <div className="space-y-6">
                              <section>
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-indigo-600" />
                                  Interaction Summary
                                </h4>
                                <p className="text-sm text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                  {result.evaluation.summary}
                                </p>
                              </section>

                              <section>
                                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Performance Metrics</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {Object.entries(result.evaluation.scores).map(([key, score]) => {
                                    const numScore = score as number;
                                    return (
                                      <div key={key} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{key}</div>
                                        <div className="flex items-center justify-between">
                                          <div className="text-lg font-bold text-slate-900">{numScore}/10</div>
                                          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div 
                                              className={`h-full rounded-full ${
                                                numScore >= 8 ? 'bg-emerald-500' : numScore >= 5 ? 'bg-amber-500' : 'bg-red-500'
                                              }`}
                                              style={{ width: `${numScore * 10}%` }}
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </section>
                            </div>

                            {/* Right Column: Pros, Cons, Opportunities, Tips */}
                            <div className="space-y-6">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <section>
                                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    What Went Well
                                  </h4>
                                  <ul className="space-y-2">
                                    {result.evaluation.pros.map((pro, i) => (
                                      <li key={i} className="text-xs text-slate-700 flex gap-2">
                                        <span className="text-emerald-500 font-bold">•</span>
                                        {pro}
                                      </li>
                                    ))}
                                  </ul>
                                </section>

                                <section>
                                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-amber-500" />
                                    Areas for Improvement
                                  </h4>
                                  <ul className="space-y-2">
                                    {result.evaluation.cons.map((con, i) => (
                                      <li key={i} className="text-xs text-slate-700 flex gap-2">
                                        <span className="text-amber-500 font-bold">•</span>
                                        {con}
                                      </li>
                                    ))}
                                  </ul>
                                </section>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <section>
                                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-indigo-500" />
                                    Missed Opportunities
                                  </h4>
                                  <ul className="space-y-2">
                                    {result.evaluation.missedOpportunities.map((opt, i) => (
                                      <li key={i} className="text-xs text-slate-700 flex gap-2">
                                        <span className="text-indigo-500 font-bold">•</span>
                                        {opt}
                                      </li>
                                    ))}
                                  </ul>
                                </section>

                                <section>
                                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <Lightbulb className="w-4 h-4 text-amber-500" />
                                    Coaching Tips
                                  </h4>
                                  <ul className="space-y-2">
                                    {result.evaluation.coachingTips.map((tip, i) => (
                                      <li key={i} className="text-xs text-slate-700 flex gap-2">
                                        <span className="text-amber-500 font-bold">•</span>
                                        {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </section>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    {searchTerm ? 'No results match your search.' : 'No simulation results recorded yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
