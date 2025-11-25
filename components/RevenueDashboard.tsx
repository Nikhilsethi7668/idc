
import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MOCK_FINANCIALS } from '../constants';
import { generateFinancialAnalysis } from '../services/geminiService';
import { FinancialProfile } from '../types';
import { Wallet, TrendingUp, TrendingDown, DollarSign, BrainCircuit, PieChart as PieIcon, ArrowUpRight, Loader2, Sparkles } from 'lucide-react';
import { SimpleMarkdown } from './SimpleMarkdown';

export const RevenueDashboard: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState<FinancialProfile>(MOCK_FINANCIALS[0]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (profile: FinancialProfile) => {
    setSelectedProfile(profile);
    setAnalysis(null);
    setLoading(true);
    const result = await generateFinancialAnalysis(profile);
    setAnalysis(result);
    setLoading(false);
  };

  const COLORS = ['#003A79', '#005CB9', '#10b981', '#f59e0b'];

  const totalRevenue = MOCK_FINANCIALS.reduce((acc, curr) => acc + curr.totalRevenue, 0);
  const totalCost = MOCK_FINANCIALS.reduce((acc, curr) => acc + curr.totalCost, 0);
  const globalMargin = ((totalRevenue - totalCost) / totalRevenue * 100).toFixed(1);

  return (
    <div className="flex h-[calc(100vh-140px)] -m-8 gap-6 p-8 bg-slate-50 overflow-hidden">
      {/* Left: Financial Overview & List */}
      <div className="w-1/3 flex flex-col gap-6 h-full">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
             <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Total Revenue</div>
             <div className="text-2xl font-black text-idc-deepBlue flex items-baseline">
                ${(totalRevenue / 1000000).toFixed(2)}M
                <span className="text-xs font-bold text-green-500 ml-2 flex items-center bg-green-50 px-1.5 py-0.5 rounded">
                   <ArrowUpRight size={10} className="mr-0.5"/> 12%
                </span>
             </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
             <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Global Margin</div>
             <div className="text-2xl font-black text-emerald-600 flex items-baseline">
                {globalMargin}%
                <span className="text-xs font-bold text-gray-400 ml-2">YTD</span>
             </div>
          </div>
        </div>

        {/* Profitability Leaderboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
           <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center">
                 <TrendingUp className="text-idc-lightBlue mr-2" size={20}/> Event P&L Rankings
              </h3>
           </div>
           
           <div className="overflow-y-auto flex-1 p-2">
              <div className="space-y-2">
                 {[...MOCK_FINANCIALS].sort((a,b) => b.marginPercent - a.marginPercent).map(p => (
                    <div 
                      key={p.eventId}
                      onClick={() => handleAnalyze(p)}
                      className={`p-4 rounded-xl cursor-pointer border transition-all hover:shadow-md ${
                        selectedProfile.eventId === p.eventId ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-gray-800 text-sm truncate w-3/4">{p.eventName}</h4>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                             p.healthScore === 'EXCELLENT' ? 'bg-green-100 text-green-700' :
                             p.healthScore === 'POOR' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                             {p.healthScore}
                          </span>
                       </div>
                       
                       <div className="flex justify-between items-end">
                          <div>
                             <div className="text-xs text-gray-400">Revenue</div>
                             <div className="text-sm font-bold text-gray-700">${(p.totalRevenue/1000).toFixed(0)}k</div>
                          </div>
                          <div className="text-right">
                             <div className="text-xs text-gray-400">Margin</div>
                             <div className={`text-sm font-bold ${p.marginPercent > 30 ? 'text-green-600' : 'text-red-500'}`}>
                                {p.marginPercent}%
                             </div>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Right: Deep Dive Analysis */}
      <div className="w-2/3 flex flex-col gap-6 h-full overflow-y-auto pr-2 custom-scrollbar">
         {/* Top Financial Visualization */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-bold text-xl text-idc-deepBlue">Financial Composition</h3>
               <div className="flex space-x-6 text-sm font-medium text-gray-500">
                  <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-idc-deepBlue mr-2"></span> Tickets</span>
                  <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span> Sponsors</span>
                  <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-400 mr-2"></span> Costs</span>
               </div>
            </div>

            <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_FINANCIALS}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                     <XAxis dataKey="eventName" tick={false} axisLine={false}/>
                     <YAxis tickFormatter={(val) => `$${val/1000}k`} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}}/>
                     <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}
                     />
                     <Bar dataKey="totalRevenue" fill="#003A79" radius={[4, 4, 0, 0]} name="Revenue"/>
                     <Bar dataKey="grossProfit" fill="#10b981" radius={[4, 4, 0, 0]} name="Profit"/>
                     <Bar dataKey="totalCost" fill="#f87171" radius={[4, 4, 0, 0]} name="Cost"/>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* AI CFO Analysis */}
         <div className="flex-1 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg text-white overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
               <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                     <BrainCircuit className="text-white" size={24} />
                  </div>
                  <div>
                     <h3 className="font-bold text-lg">AI Chief Financial Officer</h3>
                     <p className="text-xs text-slate-400">Automated P&L Optimization</p>
                  </div>
               </div>
               {analysis && !loading && (
                 <button 
                   onClick={() => handleAnalyze(selectedProfile)}
                   className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-full transition-colors font-medium"
                 >
                    Refresh Analysis
                 </button>
               )}
            </div>

            <div className="p-8 flex-1 overflow-y-auto">
               {!analysis && !loading && (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                     <Wallet size={48} className="mb-4 opacity-50 text-emerald-400"/>
                     <h4 className="text-lg font-bold text-white mb-2">Select an Event to Analyze</h4>
                     <p className="max-w-md">The AI CFO will analyze revenue streams, cost centers, and ROI to provide actionable optimization strategies.</p>
                  </div>
               )}

               {loading && (
                  <div className="h-full flex flex-col items-center justify-center">
                     <Loader2 size={40} className="animate-spin text-blue-400 mb-4"/>
                     <p className="text-blue-200 font-medium animate-pulse">Running Monte Carlo Simulations...</p>
                  </div>
               )}

               {analysis && (
                  <div className="text-slate-300">
                     <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 mb-6">
                        <div className="flex justify-between items-center text-xs text-slate-400 uppercase tracking-widest mb-2">
                           <span>Target Analysis</span>
                           <span>{selectedProfile.eventId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                           <span className="text-2xl font-bold text-white">{selectedProfile.eventName}</span>
                           <span className={`text-xl font-bold ${selectedProfile.roiPercent > 50 ? 'text-emerald-400' : 'text-yellow-400'}`}>
                              {selectedProfile.roiPercent}% ROI
                           </span>
                        </div>
                     </div>
                     <SimpleMarkdown>{analysis}</SimpleMarkdown>
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
