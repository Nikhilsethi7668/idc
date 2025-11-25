import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { MOCK_REGIONAL_METRICS } from '../constants';
import { generateMarketAnalysis } from '../services/geminiService';
import { Loader2, Globe, TrendingUp, DollarSign, Activity, BrainCircuit } from 'lucide-react';
import { SimpleMarkdown } from './SimpleMarkdown';

export const RegionalIntelligence: React.FC = () => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateInsight = async () => {
    setLoading(true);
    const result = await generateMarketAnalysis(MOCK_REGIONAL_METRICS);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg text-idc-deepBlue flex items-center">
              <Activity className="mr-2" size={20} /> Regional Performance Matrix
            </h3>
            <div className="text-xs text-gray-500">Live Benchmarks v2.4</div>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={MOCK_REGIONAL_METRICS}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="region" tick={{ fill: '#4b5563', fontSize: 12, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#9ca3af" />
                
                <Radar name="Velocity (Regs/Day)" dataKey="velocity" stroke="#003A79" fill="#003A79" fillOpacity={0.2} />
                <Radar name="Conversion %" dataKey="conversion" stroke="#005CB9" fill="#005CB9" fillOpacity={0.2} />
                <Radar name="Sentiment (0-100)" dataKey="sentiment" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Panel */}
        <div className="bg-gradient-to-b from-idc-deepBlue to-blue-900 p-6 rounded-xl shadow-md text-white flex flex-col">
          <div className="flex items-center space-x-2 mb-6 border-b border-blue-700 pb-4">
             <BrainCircuit className="text-yellow-400" size={24} />
             <div>
               <h3 className="font-bold text-lg">AI Market Director</h3>
               <p className="text-xs text-blue-200">Predictive Regional Scoring</p>
             </div>
          </div>

          {!analysis && !loading && (
             <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4">
               <Globe className="text-blue-400 opacity-50" size={64} />
               <p className="text-blue-200 text-sm">
                 Compare regional velocity, conversion rates, and yield against global baselines.
               </p>
               <button 
                 onClick={handleGenerateInsight}
                 className="bg-white text-idc-deepBlue font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-50 transition-colors w-full"
               >
                 Generate Analysis
               </button>
             </div>
          )}

          {loading && (
             <div className="flex-1 flex flex-col justify-center items-center text-center">
               <Loader2 className="animate-spin mb-4 text-white" size={48} />
               <p className="text-blue-100 font-medium">Crunching market data...</p>
             </div>
          )}

          {analysis && (
             <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
               <div className="text-blue-100 text-sm">
                  <SimpleMarkdown>{analysis}</SimpleMarkdown>
               </div>
               <button 
                 onClick={() => setAnalysis(null)}
                 className="mt-6 w-full border border-blue-400 text-blue-100 py-2 rounded hover:bg-blue-800/50 text-sm"
               >
                 Reset Analysis
               </button>
             </div>
          )}
        </div>
      </div>

      {/* Benchmark Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
               <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Region</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase flex items-center"><TrendingUp size={14} className="mr-1"/> Velocity</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Conversion</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase flex items-center"><DollarSign size={14} className="mr-1"/> Yield / Attendee</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Sentiment</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
               {MOCK_REGIONAL_METRICS.map((m) => (
                  <tr key={m.region} className="hover:bg-gray-50 transition-colors">
                     <td className="px-6 py-4 font-bold text-idc-deepBlue">{m.region}</td>
                     <td className="px-6 py-4 font-medium text-gray-700">{m.velocity} / day</td>
                     <td className="px-6 py-4 font-medium text-gray-700">
                        <div className="w-full bg-gray-200 rounded-full h-1.5 w-24 mb-1">
                           <div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${m.conversion * 2}%`}}></div>
                        </div>
                        {m.conversion}%
                     </td>
                     <td className="px-6 py-4 font-medium text-gray-700">${m.yield}</td>
                     <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                           m.sentiment > 80 ? 'bg-green-100 text-green-700' : 
                           m.sentiment > 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                        }`}>
                           {m.sentiment}/100
                        </span>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};
