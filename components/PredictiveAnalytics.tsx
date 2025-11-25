import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { MOCK_EVENTS, MOCK_PREDICTION_DATA } from '../constants';
import { queryOracle } from '../services/geminiService';
import { BrainCircuit, Send, Sliders, TrendingUp, AlertTriangle, Play, Sparkles } from 'lucide-react';
import { SimpleMarkdown } from './SimpleMarkdown';

export const PredictiveAnalytics: React.FC = () => {
  // Oracle State
  const [query, setQuery] = useState('');
  const [oracleResponse, setOracleResponse] = useState<string | null>(null);
  const [loadingOracle, setLoadingOracle] = useState(false);

  // Simulation State
  const [budget, setBudget] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [speakers, setSpeakers] = useState(false);
  const [simulatedData, setSimulatedData] = useState(MOCK_PREDICTION_DATA);

  const handleOracleQuery = async () => {
    if (!query.trim()) return;
    setLoadingOracle(true);
    // Provide minimal context to avoid token limits
    const context = MOCK_EVENTS.map(e => ({ name: e.name, region: e.region, status: e.status, current: e.currentRegistrations, target: e.targetRegistrations }));
    const result = await queryOracle(query, context);
    setOracleResponse(result);
    setLoadingOracle(false);
  };

  const runSimulation = () => {
    // Simple heuristic simulation logic for UI demo
    const impactFactor = 1 + (budget / 50000) + (discount / 100) + (speakers ? 0.15 : 0);
    
    const newData = MOCK_PREDICTION_DATA.map(point => {
      if (point.actual === null) {
        // Forecast point
        return {
          ...point,
          predicted: Math.floor(point.predicted * impactFactor),
          lowerBound: Math.floor(point.lowerBound * impactFactor),
          upperBound: Math.floor(point.upperBound * impactFactor)
        };
      }
      return point;
    });
    
    setSimulatedData(newData);
  };

  return (
    <div className="flex h-[calc(100vh-140px)] -m-8 gap-6 p-8">
      {/* Left: Oracle Chat & NLP */}
      <div className="w-1/3 flex flex-col gap-6">
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-6 text-white shadow-xl flex-1 flex flex-col">
          <div className="flex items-center space-x-3 mb-6 border-b border-white/20 pb-4">
             <BrainCircuit className="text-cyan-400" size={32} />
             <div>
               <h2 className="text-xl font-display font-bold">Oracle Engine</h2>
               <p className="text-xs text-indigo-200">Predictive NLP Analytics (Thinking Mode Active)</p>
             </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 mb-4">
            {!oracleResponse && !loadingOracle && (
              <div className="text-center text-indigo-300/50 mt-10">
                <Sparkles size={48} className="mx-auto mb-4 opacity-50"/>
                <p className="text-sm">Ask complex questions like:</p>
                <ul className="text-xs mt-2 space-y-2">
                  <li>"Which region will miss Q3 targets?"</li>
                  <li>"Predict revenue if we cancel the Tokyo Summit."</li>
                  <li>"Show me the risk profile for EMEA."</li>
                </ul>
              </div>
            )}
            
            {loadingOracle && (
               <div className="flex flex-col items-center justify-center h-full text-cyan-300">
                  <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="text-sm animate-pulse">Deep Thinking in progress...</p>
               </div>
            )}

            {oracleResponse && (
               <div className="text-indigo-100 text-sm bg-black/20 p-4 rounded-xl">
                  <SimpleMarkdown>{oracleResponse}</SimpleMarkdown>
               </div>
            )}
          </div>

          <div className="relative">
            <input 
              type="text" 
              className="w-full bg-indigo-950/50 border border-indigo-700 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-cyan-400 outline-none text-white placeholder-indigo-400"
              placeholder="Ask the Oracle..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleOracleQuery()}
            />
            <button 
              onClick={handleOracleQuery}
              className="absolute right-2 top-2 p-1.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Right: Simulation Lab */}
      <div className="w-2/3 flex flex-col gap-6">
         {/* Forecasting Chart */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center">
                     <TrendingUp className="mr-2 text-idc-deepBlue" size={20}/> Registration Forecast
                  </h3>
                  <p className="text-xs text-gray-500">Prophet Model (Confidence Interval 95%)</p>
               </div>
               <div className="flex space-x-4 text-xs">
                  <div className="flex items-center"><span className="w-3 h-3 bg-blue-100 rounded mr-2"></span> Confidence Band</div>
                  <div className="flex items-center"><span className="w-3 h-3 bg-blue-600 rounded mr-2"></span> Predicted</div>
               </div>
            </div>

            <div className="flex-1 min-h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={simulatedData}>
                     <defs>
                        <linearGradient id="colorBand" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.3}/>
                           <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.1}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                     <XAxis dataKey="date" tickFormatter={(d) => d.substring(5)} tick={{fontSize: 10}}/>
                     <YAxis tick={{fontSize: 10}}/>
                     <Tooltip 
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                        labelStyle={{color: '#64748b', marginBottom: '0.5rem'}}
                     />
                     <Area type="monotone" dataKey="upperBound" stackId="1" stroke="none" fill="transparent" />
                     <Area type="monotone" dataKey="lowerBound" stackId="2" stroke="none" fill="#eff6ff" />
                     <Area type="monotone" dataKey="predicted" stroke="#2563eb" strokeWidth={3} fill="url(#colorBand)" />
                     <Area type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} fill="none" connectNulls />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Simulation Controls */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-[220px]">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <Sliders className="mr-2 text-idc-deepBlue" size={20}/> Scenario Simulator
               </h3>
               <button 
                 onClick={runSimulation}
                 className="bg-idc-deepBlue text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center hover:bg-blue-800 transition-colors shadow-lg"
               >
                  <Play size={16} className="mr-2 fill-current"/> Run Simulation
               </button>
            </div>

            <div className="grid grid-cols-3 gap-8">
               <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                     <span>Ad Budget Boost</span>
                     <span className="text-idc-lightBlue">+${budget}k</span>
                  </div>
                  <input 
                    type="range" min="0" max="50" step="5"
                    value={budget} onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-idc-deepBlue"
                  />
               </div>

               <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                     <span>Ticket Discount</span>
                     <span className="text-idc-lightBlue">{discount}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="30" step="5"
                    value={discount} onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-idc-deepBlue"
                  />
               </div>

               <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
                  <input 
                    type="checkbox" 
                    id="speaker"
                    checked={speakers}
                    onChange={(e) => setSpeakers(e.target.checked)}
                    className="w-5 h-5 text-idc-deepBlue rounded focus:ring-blue-500 border-gray-300" 
                  />
                  <label htmlFor="speaker" className="text-sm font-bold text-gray-700">Add Keynote Speaker</label>
               </div>
            </div>

            <div className="mt-4 flex items-center text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-100">
               <AlertTriangle size={14} className="mr-2 text-blue-500"/>
               AI estimates a <strong className="mx-1 text-blue-700">{(1 + (budget/50000) + (discount/100) + (speakers ? 0.15 : 0)).toFixed(2)}x</strong> uplift in registration velocity with these parameters.
            </div>
         </div>
      </div>
    </div>
  );
};
