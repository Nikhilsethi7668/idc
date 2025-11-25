
import React, { useState } from 'react';
import { MOCK_SPONSORS, MOCK_PACKAGES } from '../constants';
import { generateSponsorshipStrategy, generateSponsorOutreach } from '../services/geminiService';
import { Sponsor, SponsorshipPackage } from '../types';
import { Wallet, Target, Mail, Send, Award, CheckCircle, Loader2, TrendingUp, Sparkles, PieChart, Plus } from 'lucide-react';
import { SimpleMarkdown } from './SimpleMarkdown';
import { Modal } from './Modal';

export const SponsorshipEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'outreach'>('overview');
  const [sponsors, setSponsors] = useState<Sponsor[]>([...MOCK_SPONSORS]); // State for sponsors
  const [selectedPackage, setSelectedPackage] = useState<SponsorshipPackage>(MOCK_PACKAGES[0]);
  const [selectedSponsor, setSelectedSponsor] = useState<Sponsor>(MOCK_SPONSORS[0]);
  
  // Modals
  const [isAddSponsorOpen, setIsAddSponsorOpen] = useState(false);
  const [newSponsor, setNewSponsor] = useState({ companyName: '', industry: '', email: '', value: 0 });

  // Strategy State
  const [strategy, setStrategy] = useState<string | null>(null);
  const [loadingStrategy, setLoadingStrategy] = useState(false);

  // Outreach State
  const [outreachEmail, setOutreachEmail] = useState<string | null>(null);
  const [loadingOutreach, setLoadingOutreach] = useState(false);

  const handleGenerateStrategy = async () => {
    setLoadingStrategy(true);
    const result = await generateSponsorshipStrategy(selectedPackage);
    setStrategy(result);
    setLoadingStrategy(false);
  };

  const handleGenerateOutreach = async () => {
    setLoadingOutreach(true);
    const result = await generateSponsorOutreach(selectedSponsor, selectedPackage.eventName);
    setOutreachEmail(result);
    setLoadingOutreach(false);
  };

  const handleAddSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    const sponsor: Sponsor = {
      id: `sp-${Date.now()}`,
      companyName: newSponsor.companyName,
      industry: newSponsor.industry,
      fitScore: 50, // Default pending AI score
      status: 'PROSPECT',
      projectedValue: Number(newSponsor.value),
      contactEmail: newSponsor.email
    };
    setSponsors([...sponsors, sponsor]);
    setIsAddSponsorOpen(false);
    setNewSponsor({ companyName: '', industry: '', email: '', value: 0 });
  };

  const totalPipeline = sponsors.reduce((acc, curr) => acc + curr.projectedValue, 0);
  const securedRevenue = MOCK_PACKAGES.reduce((acc, pkg) => {
    return acc + pkg.tiers.reduce((tAcc, tier) => tAcc + (tier.price * tier.slotsSold), 0);
  }, 0);

  const renderOverview = () => (
    <div className="grid grid-cols-12 gap-6 h-full">
       <div className="col-span-8 space-y-6">
          <div className="grid grid-cols-3 gap-4">
             <div className="glass-card p-4 rounded-xl">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Secured Revenue</div>
                <div className="text-2xl font-black text-emerald-600">${(securedRevenue/1000).toFixed(1)}k</div>
             </div>
             <div className="glass-card p-4 rounded-xl">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Pipeline Value</div>
                <div className="text-2xl font-black text-blue-600">${(totalPipeline/1000).toFixed(1)}k</div>
             </div>
             <div className="glass-card p-4 rounded-xl">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Package Sell-Through</div>
                <div className="text-2xl font-black text-idc-deepBlue">68%</div>
             </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
             <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 flex items-center">
                   <Target size={20} className="mr-2 text-idc-deepBlue"/> Active Prospect List
                </h3>
                <button 
                  onClick={() => setIsAddSponsorOpen(true)}
                  className="text-xs bg-idc-deepBlue text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-800 flex items-center"
                >
                  <Plus size={12} className="mr-1"/> Add Prospect
                </button>
             </div>
             <div className="space-y-3">
                {sponsors.map(s => (
                   <div key={s.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl hover:bg-white border border-transparent hover:border-gray-200 hover:shadow-sm transition-all">
                      <div className="flex items-center space-x-4">
                         <div className={`w-2 h-2 rounded-full ${s.status === 'SIGNED' ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                         <div>
                            <div className="font-bold text-gray-900">{s.companyName}</div>
                            <div className="text-xs text-gray-500">{s.industry}</div>
                         </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                         <div>
                            <span className="text-xs text-gray-400 uppercase mr-2">Fit Score</span>
                            <span className={`font-bold ${s.fitScore > 80 ? 'text-green-600' : 'text-amber-600'}`}>{s.fitScore}/100</span>
                         </div>
                         <div className="font-mono font-bold text-gray-700">
                            ${(s.projectedValue/1000).toFixed(1)}k
                         </div>
                         <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-bold text-gray-500 uppercase">
                            {s.status}
                         </span>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       </div>

       <div className="col-span-4 bg-gradient-to-b from-slate-900 to-idc-deepBlue rounded-2xl p-6 text-white flex flex-col">
          <div className="flex items-center space-x-2 mb-6 border-b border-white/10 pb-4">
             <Sparkles className="text-yellow-400" size={24}/>
             <div>
                <h3 className="font-bold text-lg">Monetization AI</h3>
                <p className="text-xs text-blue-200">Revenue Optimization Engine</p>
             </div>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center text-blue-200/50">
             <PieChart size={64} className="mb-4 opacity-50"/>
             <p className="text-sm">Select a package or prospect to generate AI strategies.</p>
          </div>
       </div>

       <Modal isOpen={isAddSponsorOpen} onClose={() => setIsAddSponsorOpen(false)} title="Add New Prospect">
         <form onSubmit={handleAddSponsor} className="space-y-4">
           <div>
             <label className="block text-sm font-bold text-slate-700 mb-1">Company Name</label>
             <input 
               required
               type="text" 
               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
               value={newSponsor.companyName}
               onChange={e => setNewSponsor({...newSponsor, companyName: e.target.value})}
             />
           </div>
           <div>
             <label className="block text-sm font-bold text-slate-700 mb-1">Industry</label>
             <input 
               required
               type="text" 
               className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
               value={newSponsor.industry}
               onChange={e => setNewSponsor({...newSponsor, industry: e.target.value})}
             />
           </div>
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1">Contact Email</label>
               <input 
                 required
                 type="email" 
                 className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                 value={newSponsor.email}
                 onChange={e => setNewSponsor({...newSponsor, email: e.target.value})}
               />
             </div>
             <div>
               <label className="block text-sm font-bold text-slate-700 mb-1">Proj. Value</label>
               <input 
                 required
                 type="number" 
                 className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                 placeholder="50000"
                 value={newSponsor.value}
                 onChange={e => setNewSponsor({...newSponsor, value: Number(e.target.value)})}
               />
             </div>
           </div>
           <div className="pt-4 flex justify-end space-x-3">
             <button 
               type="button" 
               onClick={() => setIsAddSponsorOpen(false)}
               className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
             >
               Cancel
             </button>
             <button 
               type="submit" 
               className="px-6 py-2 bg-idc-deepBlue text-white text-sm font-bold rounded-lg hover:bg-blue-800"
             >
               Add Prospect
             </button>
           </div>
         </form>
       </Modal>
    </div>
  );

  const renderPackages = () => (
    <div className="grid grid-cols-12 gap-6 h-full">
       <div className="col-span-7 space-y-6">
          {selectedPackage.tiers.map((tier) => (
             <div key={tier.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex justify-between items-start relative overflow-hidden group">
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                   tier.name === 'Platinum' ? 'bg-slate-800' : 
                   tier.name === 'Gold' ? 'bg-yellow-400' : 'bg-gray-300'
                }`}></div>
                
                <div>
                   <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{tier.name} Tier</h3>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold">${tier.price.toLocaleString()}</span>
                   </div>
                   <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <span>Slots: {tier.slotsSold} / {tier.slotsAvailable}</span>
                      <div className="w-24 bg-gray-100 h-1.5 rounded-full">
                         <div className="bg-blue-600 h-1.5 rounded-full" style={{width: `${(tier.slotsSold/tier.slotsAvailable)*100}%`}}></div>
                      </div>
                   </div>
                   <ul className="space-y-1">
                      {tier.benefits.slice(0, 3).map((b, i) => (
                         <li key={i} className="text-sm text-gray-600 flex items-center">
                            <CheckCircle size={12} className="mr-2 text-green-500"/> {b}
                         </li>
                      ))}
                   </ul>
                </div>
             </div>
          ))}
       </div>

       <div className="col-span-5 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
             <h3 className="font-bold text-idc-deepBlue flex items-center">
                <Sparkles size={18} className="mr-2 text-purple-500"/> Package Optimizer
             </h3>
             <button 
               onClick={handleGenerateStrategy}
               disabled={loadingStrategy}
               className="text-xs bg-idc-deepBlue text-white px-3 py-1.5 rounded-lg hover:bg-blue-800 transition-colors flex items-center"
             >
                {loadingStrategy ? <Loader2 size={12} className="animate-spin mr-1"/> : null}
                Analyze Structure
             </button>
          </div>
          <div className="p-6 flex-1 overflow-y-auto">
             {strategy ? (
                <div className="text-sm text-gray-700">
                   <SimpleMarkdown>{strategy}</SimpleMarkdown>
                </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                   <Target size={48} className="mb-4 opacity-50"/>
                   <p className="text-sm">Run analysis to identify pricing gaps and upsell opportunities.</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );

  const renderOutreach = () => (
    <div className="grid grid-cols-12 gap-6 h-full">
       <div className="col-span-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 block">Select Prospect</label>
          <div className="space-y-2">
             {sponsors.filter(s => s.status !== 'SIGNED').map(s => (
                <div 
                   key={s.id}
                   onClick={() => setSelectedSponsor(s)}
                   className={`p-3 rounded-lg cursor-pointer border transition-all ${
                      selectedSponsor.id === s.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-transparent hover:bg-white hover:shadow-sm'
                   }`}
                >
                   <div className="font-bold text-sm text-gray-800">{s.companyName}</div>
                   <div className="text-xs text-gray-500 flex justify-between mt-1">
                      <span>Val: ${(s.projectedValue/1000).toFixed(0)}k</span>
                      <span className="font-bold text-green-600">Fit: {s.fitScore}%</span>
                   </div>
                </div>
             ))}
          </div>
          <button 
            onClick={handleGenerateOutreach}
            disabled={loadingOutreach}
            className="w-full mt-6 bg-idc-deepBlue text-white py-3 rounded-xl font-bold hover:bg-blue-800 transition-colors flex items-center justify-center shadow-lg"
          >
             {loadingOutreach ? <Loader2 size={16} className="animate-spin mr-2"/> : <Mail size={16} className="mr-2"/>}
             Generate Email
          </button>
       </div>

       <div className="col-span-8 bg-gray-50 rounded-2xl border border-gray-200 p-8 flex flex-col relative">
          <div className="absolute top-4 right-4 bg-white/50 px-3 py-1 rounded text-xs text-gray-400 font-mono">
             Draft Mode
          </div>
          
          {outreachEmail ? (
             <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 h-full overflow-y-auto animate-fade-in-up">
                <div className="text-gray-800 text-sm font-sans leading-relaxed">
                   <SimpleMarkdown>{outreachEmail}</SimpleMarkdown>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
                   <button className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-600 transition-colors flex items-center shadow-md">
                      <Send size={16} className="mr-2"/> Send to CRM
                   </button>
                </div>
             </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center">
                <Mail size={64} className="mb-4 opacity-50"/>
                <p className="max-w-xs">Select a high-value prospect and generate a personalized, AI-crafted sponsorship pitch.</p>
             </div>
          )}
       </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-140px)] -m-8 p-8 flex flex-col gap-6">
      <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 w-fit">
        {[
          { id: 'overview', label: 'Dashboard', icon: Wallet },
          { id: 'packages', label: 'Package Strategy', icon: Award },
          { id: 'outreach', label: 'Prospect Outreach', icon: Mail }
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

      <div className="flex-1 overflow-hidden">
         {activeTab === 'overview' && renderOverview()}
         {activeTab === 'packages' && renderPackages()}
         {activeTab === 'outreach' && renderOutreach()}
      </div>
    </div>
  );
};
