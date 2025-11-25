import React, { useState } from 'react';
import { MOCK_EVENTS, MOCK_COMPETITOR_EVENTS } from '../constants';
import { generateConflictStrategy } from '../services/geminiService';
import { CompetitorEvent, EventData } from '../types';
import { Swords, Calendar, AlertOctagon, TrendingDown, Shield, Loader2 } from 'lucide-react';
import { SimpleMarkdown } from './SimpleMarkdown';

export const CompetitorIntelligence: React.FC = () => {
  const [selectedMatchup, setSelectedMatchup] = useState<{idc: EventData, comp: CompetitorEvent} | null>(null);
  const [strategy, setStrategy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async (idc: EventData, comp: CompetitorEvent) => {
    setSelectedMatchup({ idc, comp });
    setStrategy(null);
    setLoading(true);
    const result = await generateConflictStrategy(idc, comp);
    setStrategy(result);
    setLoading(false);
  };

  // Sort events by date for the timeline
  const timelineEvents = [
    ...MOCK_EVENTS.map(e => ({ ...e, type: 'IDC', dateObj: new Date(e.date) })),
    ...MOCK_COMPETITOR_EVENTS.map(e => ({ ...e, type: 'COMP', dateObj: new Date(e.date) }))
  ].sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 -m-2">
      {/* Left: Interactive Conflict Timeline */}
      <div className="w-3/5 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
           <h3 className="font-bold text-lg text-idc-deepBlue flex items-center">
             <Calendar className="mr-2" size={20}/> Global Event Timeline & Conflict Matrix
           </h3>
           <p className="text-sm text-gray-500 mt-1">
             Monitoring {MOCK_COMPETITOR_EVENTS.length} competitor signals against {MOCK_EVENTS.length} active IDC portfolios.
           </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
           {timelineEvents.map((evt: any) => {
             const isIDC = evt.type === 'IDC';
             // Find conflicts if IDC event
             const conflict = isIDC 
                ? MOCK_COMPETITOR_EVENTS.find(c => 
                    c.region === evt.region && 
                    Math.abs(new Date(c.date).getTime() - evt.dateObj.getTime()) < 86400000 * 14 // 2 weeks proximity
                  )
                : null;
             
             return (
               <div key={evt.id} className="relative flex items-center">
                 {/* Timeline Line */}
                 <div className="absolute left-24 top-0 bottom-0 w-px bg-gray-200"></div>
                 
                 {/* Date Label */}
                 <div className="w-24 flex-shrink-0 text-right pr-4 text-xs font-bold text-gray-500">
                    {evt.dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                 </div>

                 {/* Event Card */}
                 <div className={`relative flex-1 p-4 rounded-lg border shadow-sm transition-all
                   ${isIDC 
                     ? 'bg-white border-l-4 border-l-idc-deepBlue border-gray-200 ml-4' 
                     : 'bg-gray-50 border-dashed border-gray-300 ml-12 opacity-80'}
                 `}>
                    {/* Connector Dot */}
                    <div className={`absolute top-1/2 -left-4 w-3 h-3 rounded-full border-2 border-white 
                      ${isIDC ? 'bg-idc-deepBlue' : 'bg-gray-400'}
                    `}></div>

                    <div className="flex justify-between items-start">
                       <div>
                          <div className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center">
                             {isIDC ? <span className="text-idc-deepBlue">IDC EVENT</span> : <span className="text-gray-500">{evt.organizer || 'Competitor'}</span>}
                             <span className="mx-2 text-gray-300">•</span>
                             {evt.region}
                          </div>
                          <h4 className={`font-bold ${isIDC ? 'text-gray-900' : 'text-gray-600'}`}>{evt.name}</h4>
                       </div>
                       
                       {/* Conflict Action Button */}
                       {conflict && isIDC && (
                         <button 
                           onClick={() => handleAnalyze(evt, conflict)}
                           className="bg-red-50 text-red-600 px-3 py-1 rounded text-xs font-bold border border-red-200 hover:bg-red-100 flex items-center animate-pulse"
                         >
                           <Swords size={12} className="mr-1"/> 
                           {conflict.clashLevel} Clash Detected
                         </button>
                       )}
                    </div>
                 </div>
               </div>
             );
           })}
        </div>
      </div>

      {/* Right: Strategy Engine */}
      <div className="w-2/5 flex flex-col gap-6">
        
        {/* Risk Meter Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h3 className="text-sm font-bold text-gray-500 uppercase mb-4">Market Saturation Index</h3>
           <div className="flex items-center justify-center py-4">
              <div className="relative w-40 h-20 overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-full bg-gray-200 rounded-t-full"></div>
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-t-full" style={{transformOrigin: 'bottom center', transform: 'rotate(45deg)'}}></div>
                 <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-16 bg-white rounded-t-full flex items-end justify-center pb-2">
                    <span className="text-2xl font-black text-gray-800">High</span>
                 </div>
              </div>
           </div>
           <p className="text-center text-xs text-gray-500 mt-2">
             <AlertOctagon size={12} className="inline mr-1 text-red-500"/>
             Gartner & AWS events creating high audience fragmentation in APAC & EMEA.
           </p>
        </div>

        {/* AI Strategy Panel */}
        <div className="flex-1 bg-gradient-to-b from-gray-900 to-idc-deepBlue rounded-xl shadow-lg p-6 text-white flex flex-col">
           <div className="flex items-center space-x-3 mb-6 border-b border-gray-700 pb-4">
              <Shield className="text-emerald-400" size={24} />
              <div>
                 <h3 className="font-bold text-lg">Competitive Strategy AI</h3>
                 <p className="text-xs text-gray-400">Defensive Maneuvers & Positioning</p>
              </div>
           </div>

           {!strategy && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-4">
                 <Swords size={48} className="mb-4 opacity-50" />
                 <p className="text-sm">
                   Select a "Clash Detected" button on the timeline to generate a defensive strategy report.
                 </p>
              </div>
           )}

           {loading && (
              <div className="flex-1 flex flex-col items-center justify-center">
                 <Loader2 size={40} className="animate-spin text-emerald-400 mb-4" />
                 <p className="text-sm font-medium">Analyzing audience overlaps and pricing models...</p>
              </div>
           )}

           {strategy && (
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="bg-white/10 p-3 rounded mb-4 text-xs font-mono">
                     Matchup: {selectedMatchup?.idc.name} vs {selectedMatchup?.comp.name}
                  </div>
                  <div className="text-gray-200 text-sm">
                     <SimpleMarkdown>{strategy}</SimpleMarkdown>
                  </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
