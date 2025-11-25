import React, { useState } from 'react';
import { MOCK_MARKETING_CAMPAIGNS, MOCK_PERSONAS } from '../constants';
import { generateMarketingStrategy, generateCreativeSuite } from '../services/geminiService';
import { MarketingCampaign, ContentChannel, MarketingPersona } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Megaphone, Target, Palette, Zap, LayoutDashboard, BrainCircuit, Play, ArrowRight, MousePointer, Eye, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { SimpleMarkdown } from './SimpleMarkdown';

export const DeepMarketingEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'creative' | 'journey'>('dashboard');
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign>(MOCK_MARKETING_CAMPAIGNS[0]);
  
  // Strategy State
  const [strategy, setStrategy] = useState<string | null>(null);
  const [loadingStrategy, setLoadingStrategy] = useState(false);

  // Creative State
  const [selectedPersona, setSelectedPersona] = useState<MarketingPersona>(MOCK_PERSONAS[0]);
  const [creativeChannel, setCreativeChannel] = useState<ContentChannel>(ContentChannel.LINKEDIN_AD);
  const [generatedCreative, setGeneratedCreative] = useState<any | null>(null);
  const [loadingCreative, setLoadingCreative] = useState(false);

  const handleGenerateStrategy = async () => {
    setLoadingStrategy(true);
    const result = await generateMarketingStrategy(selectedCampaign);
    setStrategy(result);
    setLoadingStrategy(false);
  };

  const handleGenerateCreative = async () => {
    setLoadingCreative(true);
    // Parse the JSON result from the service (now guaranteed to be cleaner)
    const jsonStr = await generateCreativeSuite(selectedCampaign.name, selectedPersona, creativeChannel);
    try {
      const parsed = JSON.parse(jsonStr);
      setGeneratedCreative(parsed);
    } catch (e) {
      console.error("Failed to parse creative JSON", e);
    }
    setLoadingCreative(false);
  };

  const COLORS = ['#003A79', '#005CB9', '#10b981', '#f59e0b', '#ef4444'];

  const renderDashboard = () => (
    <div className="grid grid-cols-12 gap-6 h-full overflow-hidden">
      {/* KPI Cards */}
      <div className="col-span-12 grid grid-cols-4 gap-4">
         <div className="glass-card p-4 rounded-xl flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase">Active Budget</span>
            <span className="text-2xl font-black text-idc-deepBlue">${(selectedCampaign.budget/1000).toFixed(1)}k</span>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2">
               <div className="bg-blue-600 h-1.5 rounded-full" style={{width: `${(selectedCampaign.spent/selectedCampaign.budget)*100}%`}}></div>
            </div>
         </div>
         <div className="glass-card p-4 rounded-xl flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase">Health Score</span>
            <span className={`text-2xl font-black ${selectedCampaign.healthScore > 80 ? 'text-emerald-500' : 'text-amber-500'}`}>
               {selectedCampaign.healthScore}/100
            </span>
            <span className="text-[10px] text-gray-400 mt-1">AI Calculated</span>
         </div>
         <div className="glass-card p-4 rounded-xl flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase">Total ROAS</span>
            <span className="text-2xl font-black text-purple-600">3.8x</span>
            <span className="text-[10px] text-gray-400 mt-1">+0.4x vs Avg</span>
         </div>
         <div className="glass-card p-4 rounded-xl flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase">Fatigue Risk</span>
            <span className="text-2xl font-black text-red-500">Low</span>
            <span className="text-[10px] text-gray-400 mt-1">Creatives fresh</span>
         </div>
      </div>

      {/* Main Chart */}
      <div className="col-span-8 glass-card p-6 rounded-2xl flex flex-col">
         <h3 className="font-bold text-lg text-gray-800 mb-4">Channel Performance Matrix</h3>
         <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={selectedCampaign.channels}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                  <XAxis dataKey="channel" tickFormatter={(v) => v.split('_')[0]} axisLine={false} tick={{fontSize: 10}}/>
                  <YAxis yAxisId="left" orientation="left" stroke="#003A79" fontSize={10}/>
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={10}/>
                  <Tooltip cursor={{fill: '#f8fafc'}}/>
                  <Bar yAxisId="left" dataKey="spend" fill="#003A79" radius={[4, 4, 0, 0]} name="Spend"/>
                  <Bar yAxisId="right" dataKey="conversions" fill="#10b981" radius={[4, 4, 0, 0]} name="Conv."/>
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* AI Strategy Side Panel */}
      <div className="col-span-4 glass-card p-0 rounded-2xl flex flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white overflow-hidden">
         <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <div className="flex items-center space-x-2">
               <BrainCircuit size={18} className="text-emerald-400"/>
               <span className="font-bold text-sm">AI CMO Strategy</span>
            </div>
            <button onClick={handleGenerateStrategy} className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition">
               {loadingStrategy ? <Loader2 size={12} className="animate-spin"/> : 'Optimize'}
            </button>
         </div>
         <div className="p-4 overflow-y-auto flex-1 text-sm custom-scrollbar text-slate-300">
            {strategy ? (
               <SimpleMarkdown>{strategy}</SimpleMarkdown>
            ) : (
               <div className="text-center text-slate-500 mt-10">
                  <Megaphone size={32} className="mx-auto mb-2 opacity-50"/>
                  <p>Run AI optimization to rebalance budget across performing channels.</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );

  const renderCreativeStudio = () => (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Config */}
      <div className="col-span-4 glass-card p-6 rounded-2xl flex flex-col gap-6">
         <h3 className="font-bold text-lg text-idc-deepBlue flex items-center">
            <Palette size={20} className="mr-2"/> Creative Studio
         </h3>
         
         <div className="space-y-4">
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase">Target Persona</label>
               <select 
                 className="w-full mt-1 p-2 border rounded-lg bg-white text-sm"
                 value={selectedPersona.id}
                 onChange={(e) => setSelectedPersona(MOCK_PERSONAS.find(p => p.id === e.target.value) || MOCK_PERSONAS[0])}
               >
                 {MOCK_PERSONAS.map(p => <option key={p.id} value={p.id}>{p.name} - {p.role}</option>)}
               </select>
            </div>
            <div>
               <label className="text-xs font-bold text-gray-500 uppercase">Channel Format</label>
               <div className="grid grid-cols-2 gap-2 mt-1">
                  {[ContentChannel.LINKEDIN_AD, ContentChannel.META_AD, ContentChannel.GOOGLE_AD].map(c => (
                     <button 
                       key={c}
                       onClick={() => setCreativeChannel(c)}
                       className={`p-2 text-xs font-bold rounded border ${creativeChannel === c ? 'bg-idc-deepBlue text-white border-idc-deepBlue' : 'bg-white text-gray-600 border-gray-200'}`}
                     >
                        {c.replace('_AD', '')}
                     </button>
                  ))}
               </div>
            </div>
            <button 
              onClick={handleGenerateCreative}
              disabled={loadingCreative}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-lg shadow-lg hover:opacity-90 transition flex items-center justify-center"
            >
               {loadingCreative ? <Loader2 size={16} className="animate-spin mr-2"/> : <Sparkles size={16} className="mr-2"/>}
               Generate Concepts
            </button>
         </div>
      </div>

      {/* Preview */}
      <div className="col-span-8 bg-gray-100 rounded-2xl p-8 flex items-center justify-center border border-gray-200 shadow-inner relative overflow-hidden">
         {!generatedCreative && (
            <div className="text-center text-gray-400">
               <Zap size={48} className="mx-auto mb-4 opacity-50"/>
               <p>Select persona and channel to generate high-fidelity ad previews.</p>
            </div>
         )}
         
         {generatedCreative && (
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden animate-fade-in-up">
               {/* Mock Ad Header */}
               <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
                  <div className="w-10 h-10 bg-idc-deepBlue rounded flex items-center justify-center text-white font-black text-xs">IDC</div>
                  <div>
                     <div className="font-bold text-sm text-gray-900">IDC Global Events</div>
                     <div className="text-xs text-gray-500">Promoted • 24,592 followers</div>
                  </div>
               </div>
               
               {/* Ad Body */}
               <div className="p-4 text-sm text-gray-800">
                  {generatedCreative.primaryText}
               </div>
               
               {/* Ad Media Mock */}
               <div className="h-64 bg-gray-200 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-slate-900 opacity-90"></div>
                  <div className="relative z-10 text-center p-6 text-white">
                     <h3 className="text-2xl font-black font-display uppercase leading-tight mb-2">{generatedCreative.headline}</h3>
                     <p className="text-sm opacity-80">{generatedCreative.imageDescription}</p>
                  </div>
               </div>

               {/* Ad Footer */}
               <div className="bg-gray-50 p-4 flex justify-between items-center border-t border-gray-200">
                  <span className="text-xs text-gray-500 font-bold uppercase">Sign Up</span>
                  <button className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-blue-700 transition">
                     {generatedCreative.cta}
                  </button>
               </div>
            </div>
         )}
      </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-140px)] -m-8 p-8 flex flex-col gap-6">
      {/* Header Tabs */}
      <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 w-fit">
        {[
          { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
          { id: 'creative', label: 'Creative Studio', icon: Palette },
          { id: 'journey', label: 'Journey Builder', icon: ArrowRight }
        ].map((tab: any) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-all ${
               activeTab === tab.id ? 'bg-idc-deepBlue text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
             <tab.icon size={16} className="mr-2"/> {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
         {activeTab === 'dashboard' && renderDashboard()}
         {activeTab === 'creative' && renderCreativeStudio()}
         {activeTab === 'journey' && (
            <div className="flex items-center justify-center h-full text-gray-400">
               <div className="text-center">
                  <BrainCircuit size={48} className="mx-auto mb-4 opacity-50"/>
                  <h3 className="text-lg font-bold text-gray-600">Journey Builder Active</h3>
                  <p>Visual node editor coming in v2.5 update.</p>
               </div>
            </div>
         )}
      </div>
    </div>
  );
};
