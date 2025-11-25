
import React, { useState } from 'react';
import { MOCK_SPEAKERS, MOCK_SESSIONS } from '../constants';
import { analyzeSpeakerProfile, optimizeSessionContent } from '../services/geminiService';
import { Speaker, Session } from '../types';
import { Mic2, Star, TrendingUp, Users, Edit3, Loader2, Award, BookOpen, AlertCircle, ArrowRight, Sparkles, Plus, Database } from 'lucide-react';
import { Modal } from './Modal';

export const SpeakerIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'speakers' | 'content'>('speakers');
  const [speakers, setSpeakers] = useState<Speaker[]>([...MOCK_SPEAKERS]); // Use State for speakers
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  
  // Modals
  const [isAddSpeakerOpen, setIsAddSpeakerOpen] = useState(false);
  const [newSpeaker, setNewSpeaker] = useState({ name: '', role: '', company: '', bio: '' });
  
  // Analysis States
  const [speakerAnalysis, setSpeakerAnalysis] = useState<any | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  
  const [optimizedContent, setOptimizedContent] = useState<any | null>(null);
  const [loadingOptimization, setLoadingOptimization] = useState(false);

  const handleAnalyzeSpeaker = async (speaker: Speaker) => {
    setSelectedSpeaker(speaker);
    setSpeakerAnalysis(null);
    setLoadingAnalysis(true);
    const jsonStr = await analyzeSpeakerProfile(speaker);
    try {
      setSpeakerAnalysis(JSON.parse(jsonStr));
    } catch (e) {
      console.error("Failed to parse speaker analysis", e);
    }
    setLoadingAnalysis(false);
  };

  const handleOptimizeContent = async (session: Session) => {
    setSelectedSession(session);
    setOptimizedContent(null);
    setLoadingOptimization(true);
    const jsonStr = await optimizeSessionContent(session);
    try {
      setOptimizedContent(JSON.parse(jsonStr));
    } catch (e) {
      console.error("Failed to parse content optimization", e);
    }
    setLoadingOptimization(false);
  };

  const handleAddSpeaker = (e: React.FormEvent) => {
    e.preventDefault();
    const speaker: Speaker = {
      id: `spk-${Date.now()}`,
      name: newSpeaker.name,
      role: newSpeaker.role,
      company: newSpeaker.company,
      bio: newSpeaker.bio || 'Bio pending...',
      historicalRating: 0, // New speaker
      engagementScore: 50, // Default start
      specialties: ['TBD'],
      image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newSpeaker.name}`
    };
    setSpeakers([...speakers, speaker]);
    setIsAddSpeakerOpen(false);
    setNewSpeaker({ name: '', role: '', company: '', bio: '' });
  };

  const renderSpeakerLeaderboard = () => (
    <div className="grid grid-cols-12 gap-6 h-full">
       {/* Left: Leaderboard List */}
       <div className="col-span-5 bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
             <h3 className="font-bold text-idc-deepBlue flex items-center">
                <Award size={18} className="mr-2 text-yellow-500"/> Top Rated Speakers
             </h3>
             <div className="flex space-x-2">
               <button 
                 onClick={() => setIsAddSpeakerOpen(true)}
                 className="text-xs bg-white border border-gray-200 hover:border-blue-400 text-slate-600 px-2 py-1 rounded flex items-center"
               >
                 <Plus size={12} className="mr-1"/> Add
               </button>
               <button className="text-xs bg-white border border-gray-200 hover:border-blue-400 text-slate-600 px-2 py-1 rounded flex items-center">
                 <Database size={12} className="mr-1"/> Sync
               </button>
             </div>
          </div>
          <div className="overflow-y-auto p-2 space-y-2">
             {[...speakers].sort((a,b) => b.engagementScore - a.engagementScore).map((s, index) => (
                <div 
                  key={s.id}
                  onClick={() => handleAnalyzeSpeaker(s)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all hover:shadow-md flex items-center space-x-4 ${
                    selectedSpeaker?.id === s.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-gray-100 hover:bg-gray-50'
                  }`}
                >
                   <div className="w-8 h-8 flex items-center justify-center font-bold text-gray-400 text-sm">#{index + 1}</div>
                   <img src={s.image} alt={s.name} className="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                   <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-sm truncate">{s.name}</h4>
                      <p className="text-xs text-gray-500 truncate">{s.role}, {s.company}</p>
                   </div>
                   <div className="text-right">
                      <div className="font-black text-lg text-idc-deepBlue">{s.engagementScore}</div>
                      <div className="text-[10px] text-gray-400 uppercase">Eng. Score</div>
                   </div>
                </div>
             ))}
          </div>
       </div>

       {/* Right: AI Scorecard */}
       <div className="col-span-7 bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col relative overflow-hidden">
          {!selectedSpeaker ? (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <Mic2 size={48} className="mb-4 opacity-50"/>
                <p>Select a speaker to view AI Performance Scorecard.</p>
             </div>
          ) : (
             <div className="h-full flex flex-col">
                <div className="flex items-start space-x-6 mb-8">
                   <img src={selectedSpeaker.image} className="w-24 h-24 rounded-2xl shadow-lg border-4 border-white" alt="Speaker" />
                   <div>
                      <h2 className="text-2xl font-black text-gray-900">{selectedSpeaker.name}</h2>
                      <p className="text-gray-600 font-medium">{selectedSpeaker.role} @ {selectedSpeaker.company}</p>
                      <div className="flex items-center space-x-4 mt-3">
                         <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center">
                            <Star size={12} className="mr-1 fill-current"/> {selectedSpeaker.historicalRating}/5.0
                         </span>
                         <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                            {selectedSpeaker.specialties[0]}
                         </span>
                      </div>
                   </div>
                </div>

                {loadingAnalysis ? (
                   <div className="flex-1 flex flex-col items-center justify-center">
                      <Loader2 size={40} className="animate-spin text-idc-lightBlue mb-4"/>
                      <p className="text-idc-deepBlue font-bold animate-pulse">Analyzing speaking patterns & audience sentiment...</p>
                   </div>
                ) : speakerAnalysis ? (
                   <div className="flex-1 animate-fade-in-up space-y-6">
                      <div className="grid grid-cols-3 gap-4">
                         <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                            <div className="text-xs font-bold text-slate-400 uppercase mb-1">Authority</div>
                            <div className="text-3xl font-black text-slate-800">{speakerAnalysis.authorityScore}</div>
                         </div>
                         <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                            <div className="text-xs font-bold text-slate-400 uppercase mb-1">Charisma</div>
                            <div className="text-3xl font-black text-slate-800">{speakerAnalysis.charismaScore}</div>
                         </div>
                         <div className="bg-slate-50 p-4 rounded-xl text-center border border-slate-100">
                            <div className="text-xs font-bold text-slate-400 uppercase mb-1">Retention</div>
                            <div className="text-3xl font-black text-emerald-600">{speakerAnalysis.retentionPrediction}%</div>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                         <div>
                            <h4 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wide">Strengths</h4>
                            <ul className="space-y-2">
                               {speakerAnalysis.strengths.map((s: string, i: number) => (
                                  <li key={i} className="flex items-start text-sm text-gray-600">
                                     <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 mr-2 shrink-0"></div>
                                     {s}
                                  </li>
                               ))}
                            </ul>
                         </div>
                         <div>
                            <h4 className="font-bold text-sm text-gray-700 mb-3 uppercase tracking-wide">Areas to Improve</h4>
                            <ul className="space-y-2">
                               {speakerAnalysis.weaknesses.map((s: string, i: number) => (
                                  <li key={i} className="flex items-start text-sm text-gray-600">
                                     <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 mr-2 shrink-0"></div>
                                     {s}
                                  </li>
                               ))}
                            </ul>
                         </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-100">
                         <h4 className="font-bold text-sm text-gray-700 mb-2 uppercase tracking-wide">Recommended Tracks</h4>
                         <div className="flex flex-wrap gap-2">
                            {speakerAnalysis.recommendedTracks.map((t: string, i: number) => (
                               <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold border border-gray-200">{t}</span>
                            ))}
                         </div>
                      </div>
                   </div>
                ) : (
                   <div className="flex-1 flex items-center justify-center">
                      <button onClick={() => handleAnalyzeSpeaker(selectedSpeaker)} className="bg-idc-deepBlue text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all">
                         Generate AI Scorecard
                      </button>
                   </div>
                )}
             </div>
          )}
       </div>

       {/* Add Speaker Modal */}
       <Modal isOpen={isAddSpeakerOpen} onClose={() => setIsAddSpeakerOpen(false)} title="Add New Speaker">
         <form onSubmit={handleAddSpeaker} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Speaker Name</label>
              <input 
                required
                type="text" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                value={newSpeaker.name}
                onChange={e => setNewSpeaker({...newSpeaker, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Company</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                  value={newSpeaker.company}
                  onChange={e => setNewSpeaker({...newSpeaker, company: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                <input 
                  required
                  type="text" 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                  value={newSpeaker.role}
                  onChange={e => setNewSpeaker({...newSpeaker, role: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Bio</label>
              <textarea 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none h-24"
                value={newSpeaker.bio}
                onChange={e => setNewSpeaker({...newSpeaker, bio: e.target.value})}
              />
            </div>
            <div className="pt-4 flex justify-end space-x-3">
              <button 
                type="button" 
                onClick={() => setIsAddSpeakerOpen(false)}
                className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-6 py-2 bg-idc-deepBlue text-white text-sm font-bold rounded-lg hover:bg-blue-800"
              >
                Save Profile
              </button>
            </div>
         </form>
       </Modal>
    </div>
  );

  const renderContentOptimizer = () => (
    <div className="grid grid-cols-12 gap-6 h-full">
       <div className="col-span-4 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 bg-gray-50">
             <h3 className="font-bold text-idc-deepBlue flex items-center">
                <BookOpen size={18} className="mr-2"/> Session Catalog
             </h3>
          </div>
          <div className="overflow-y-auto p-2 space-y-2">
             {MOCK_SESSIONS.map((sess) => (
                <div 
                  key={sess.id}
                  onClick={() => handleOptimizeContent(sess)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all hover:shadow-md ${
                    selectedSession?.id === sess.id ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-gray-100 hover:bg-gray-50'
                  }`}
                >
                   <div className="text-xs font-bold text-blue-600 uppercase mb-1">{sess.track}</div>
                   <h4 className="font-bold text-gray-800 text-sm mb-2 leading-tight">{sess.title}</h4>
                   <div className="flex justify-between items-center text-xs text-gray-500">
                      <span>{new Date(sess.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className="font-bold text-gray-700 flex items-center">
                         <Users size={12} className="mr-1"/> {sess.predictedAttendance}
                      </span>
                   </div>
                </div>
             ))}
          </div>
       </div>

       <div className="col-span-8 bg-gray-50 rounded-2xl border border-gray-200 p-6 flex flex-col relative">
          {!selectedSession ? (
             <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <Edit3 size={48} className="mb-4 opacity-50"/>
                <p>Select a session to optimize title and abstract.</p>
             </div>
          ) : (
             <div className="h-full flex flex-col gap-6">
                {/* Comparison View */}
                <div className="grid grid-cols-2 gap-6 h-full">
                   {/* Original */}
                   <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col opacity-70">
                      <div className="text-xs font-bold text-gray-400 uppercase mb-4 flex items-center justify-between">
                         <span>Original Draft</span>
                         <span className="text-gray-300">v1.0</span>
                      </div>
                      <h3 className="font-bold text-gray-800 mb-3">{selectedSession.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">{selectedSession.abstract}</p>
                   </div>

                   {/* Optimized */}
                   <div className="bg-white rounded-xl shadow-md border-2 border-idc-lightBlue p-5 flex flex-col relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500"></div>
                      <div className="text-xs font-bold text-idc-deepBlue uppercase mb-4 flex items-center justify-between">
                         <span className="flex items-center"><Sparkles size={14} className="mr-1 text-purple-500"/> AI Optimized</span>
                         {optimizedContent && <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">+{optimizedContent.predictedUplift}% Uplift</span>}
                      </div>
                      
                      {loadingOptimization ? (
                         <div className="flex-1 flex flex-col items-center justify-center">
                            <Loader2 size={32} className="animate-spin text-idc-lightBlue mb-3"/>
                            <p className="text-xs font-bold text-gray-400">Rewriting for impact...</p>
                         </div>
                      ) : optimizedContent ? (
                         <div className="animate-fade-in-up">
                            <h3 className="font-bold text-gray-900 mb-3 text-lg">{optimizedContent.optimizedTitle}</h3>
                            <p className="text-sm text-gray-700 leading-relaxed mb-4">{optimizedContent.optimizedAbstract}</p>
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-xs text-blue-800 flex items-start">
                               <AlertCircle size={14} className="mr-2 mt-0.5 shrink-0"/>
                               {optimizedContent.improvementReason}
                            </div>
                         </div>
                      ) : (
                         <div className="flex-1 flex items-center justify-center">
                            <button onClick={() => handleOptimizeContent(selectedSession)} className="text-idc-deepBlue font-bold text-sm hover:underline">
                               Generate Optimization
                            </button>
                         </div>
                      )}
                   </div>
                </div>
             </div>
          )}
       </div>
    </div>
  );

  return (
    <div className="h-[calc(100vh-140px)] -m-8 p-8 flex flex-col gap-6">
      <div className="flex justify-between items-center">
         <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            <button
               onClick={() => setActiveTab('speakers')}
               className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-all ${
                  activeTab === 'speakers' ? 'bg-idc-deepBlue text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
               }`}
            >
               <Users size={16} className="mr-2"/> Speaker Leaderboard
            </button>
            <button
               onClick={() => setActiveTab('content')}
               className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-all ${
                  activeTab === 'content' ? 'bg-idc-deepBlue text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'
               }`}
            >
               <Edit3 size={16} className="mr-2"/> Content Optimizer
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-hidden">
         {activeTab === 'speakers' ? renderSpeakerLeaderboard() : renderContentOptimizer()}
      </div>
    </div>
  );
};
