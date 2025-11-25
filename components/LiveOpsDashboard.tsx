
import React, { useState } from 'react';
import { MOCK_LIVE_SESSIONS, MOCK_STAFF, MOCK_OPS_ALERTS } from '../constants';
import { generateOpsSolution, generateEmergencyProtocol } from '../services/geminiService';
import { LiveSession, StaffMember, OpsAlert, AlertSeverity } from '../types';
import { Activity, Users, AlertOctagon, Radio, MapPin, CheckCircle, Clock, Zap, Loader2, Volume2, ShieldAlert, BrainCircuit } from 'lucide-react';

export const LiveOpsDashboard: React.FC = () => {
  const [selectedAlert, setSelectedAlert] = useState<OpsAlert | null>(null);
  const [aiSolution, setAiSolution] = useState<any | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [emergencyMsg, setEmergencyMsg] = useState<any | null>(null);

  const handleResolveAlert = async (alert: OpsAlert) => {
    setSelectedAlert(alert);
    setAiSolution(null);
    setLoadingAi(true);
    const jsonStr = await generateOpsSolution(alert);
    try {
        setAiSolution(JSON.parse(jsonStr));
    } catch (e) { console.error(e); }
    setLoadingAi(false);
  };

  const triggerEmergency = async () => {
    if (!confirm("Confirm Level 1 Emergency Broadcast?")) return;
    setEmergencyActive(true);
    const jsonStr = await generateEmergencyProtocol("Fire Alarm Triggered");
    try {
        setEmergencyMsg(JSON.parse(jsonStr));
    } catch (e) { console.error(e); }
  };

  return (
    <div className="h-[calc(100vh-140px)] -m-8 p-8 flex flex-col gap-6 bg-slate-900 text-slate-100 overflow-hidden relative">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

      {/* Header Stat Bar */}
      <div className="grid grid-cols-4 gap-4 z-10">
         <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
            <div>
               <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Live Attendees</div>
               <div className="text-2xl font-mono font-bold text-white flex items-center">
                  2,145 <span className="text-green-400 text-xs ml-2 flex items-center"><Activity size={12} className="mr-1 animate-pulse"/> +12/min</span>
               </div>
            </div>
            <Users size={24} className="text-blue-500 opacity-50"/>
         </div>
         <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
            <div>
               <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Staff Active</div>
               <div className="text-2xl font-mono font-bold text-white">
                  48 <span className="text-slate-500 text-sm">/ 50</span>
               </div>
            </div>
            <Radio size={24} className="text-emerald-500 opacity-50"/>
         </div>
         <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl flex items-center justify-between">
            <div>
               <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">System Status</div>
               <div className="text-2xl font-mono font-bold text-emerald-400">OPTIMAL</div>
            </div>
            <CheckCircle size={24} className="text-emerald-500 opacity-50"/>
         </div>
         <div 
            onClick={triggerEmergency}
            className={`cursor-pointer border p-4 rounded-xl flex items-center justify-between transition-all ${
               emergencyActive ? 'bg-red-600 border-red-500 animate-pulse' : 'bg-red-900/20 border-red-900 hover:bg-red-900/40'
            }`}
         >
            <div>
               <div className="text-xs text-red-400 uppercase font-bold tracking-wider">Emergency Mode</div>
               <div className="text-lg font-bold text-red-100">{emergencyActive ? 'BROADCASTING' : 'STANDBY'}</div>
            </div>
            <ShieldAlert size={24} className="text-red-500"/>
         </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-6 overflow-hidden z-10">
         
         {/* LEFT: Room Heatmap */}
         <div className="bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
               <h3 className="font-bold flex items-center"><MapPin size={18} className="mr-2 text-blue-400"/> Room Capacity</h3>
               <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">Live Sensors</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {MOCK_LIVE_SESSIONS.map(s => {
                  const fillPct = Math.min((s.currentAttendance / s.capacity) * 100, 100);
                  const isCritical = fillPct > 90;
                  return (
                     <div key={s.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700">
                        <div className="flex justify-between items-start mb-2">
                           <div>
                              <div className="text-xs text-slate-400 font-bold uppercase">{s.roomName}</div>
                              <div className="font-bold text-sm">{s.name}</div>
                           </div>
                           {isCritical && <AlertOctagon size={16} className="text-red-500 animate-pulse"/>}
                        </div>
                        <div className="flex justify-between text-xs mb-1">
                           <span className="text-slate-400">{s.currentAttendance} / {s.capacity}</span>
                           <span className={isCritical ? 'text-red-400 font-bold' : 'text-green-400'}>{fillPct.toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                           <div 
                              className={`h-full rounded-full transition-all duration-500 ${isCritical ? 'bg-red-500' : 'bg-blue-500'}`}
                              style={{width: `${fillPct}%`}}
                           ></div>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>

         {/* CENTER: Staff Command */}
         <div className="bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
               <h3 className="font-bold flex items-center"><Users size={18} className="mr-2 text-purple-400"/> Staff Command</h3>
               <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">GPS Tracking</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
               {MOCK_STAFF.map(staff => (
                  <div key={staff.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors">
                     <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${staff.status === 'BUSY' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                        <div>
                           <div className="font-bold text-sm text-slate-200">{staff.name}</div>
                           <div className="text-xs text-slate-500">{staff.role} • {staff.location}</div>
                        </div>
                     </div>
                     <button className="text-xs bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded border border-slate-700">
                        Ping
                     </button>
                  </div>
               ))}
            </div>
         </div>

         {/* RIGHT: Alert & AI Ops */}
         <div className="bg-slate-800/50 border border-slate-700 rounded-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
               <h3 className="font-bold flex items-center"><Zap size={18} className="mr-2 text-yellow-400"/> Ops Feed</h3>
               <span className="text-xs text-red-400 font-bold animate-pulse">{MOCK_OPS_ALERTS.length} Active</span>
            </div>
            
            <div className="p-4 space-y-3 overflow-y-auto h-1/2 border-b border-slate-700">
               {MOCK_OPS_ALERTS.map(alert => (
                  <div 
                     key={alert.id} 
                     onClick={() => handleResolveAlert(alert)}
                     className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedAlert?.id === alert.id ? 'bg-slate-800 border-blue-500 ring-1 ring-blue-500' : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                     }`}
                  >
                     <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                           alert.severity === AlertSeverity.HIGH ? 'bg-red-900/50 text-red-200' : 'bg-orange-900/50 text-orange-200'
                        }`}>{alert.type}</span>
                        <span className="text-[10px] text-slate-500">{alert.timestamp}</span>
                     </div>
                     <div className="text-sm font-medium text-slate-200">{alert.message}</div>
                  </div>
               ))}
            </div>

            {/* AI Director Panel */}
            <div className="flex-1 bg-slate-900 p-4 relative overflow-hidden">
               {emergencyActive ? (
                  <div className="absolute inset-0 bg-red-900/90 z-20 flex flex-col items-center justify-center text-center p-6">
                     <Volume2 size={48} className="text-white animate-pulse mb-4"/>
                     <h3 className="text-2xl font-black text-white mb-2">EMERGENCY BROADCAST</h3>
                     <p className="text-red-200 mb-6">All screens displaying safety protocol.</p>
                     {emergencyMsg && (
                        <div className="bg-black/40 p-4 rounded-xl border border-red-500/50 text-left w-full">
                           <div className="text-xs font-bold text-red-400 uppercase mb-2">Broadcast Message</div>
                           <h4 className="font-bold text-lg mb-1">{emergencyMsg.title}</h4>
                           <p className="text-sm opacity-90">{emergencyMsg.body}</p>
                        </div>
                     )}
                     <button onClick={() => setEmergencyActive(false)} className="mt-6 bg-white text-red-900 font-bold px-6 py-2 rounded-full hover:bg-gray-200">
                        STAND DOWN
                     </button>
                  </div>
               ) : (
                  <>
                     {!selectedAlert ? (
                        <div className="h-full flex flex-col items-center justify-center text-slate-600">
                           <Zap size={32} className="mb-2 opacity-50"/>
                           <p className="text-sm">Select an alert to generate Ops solution.</p>
                        </div>
                     ) : (
                        <div className="h-full flex flex-col">
                           <h4 className="text-xs font-bold text-blue-400 uppercase mb-3 flex items-center">
                              <BrainCircuit size={12} className="mr-1"/> AI Director
                           </h4>
                           {loadingAi ? (
                              <div className="flex-1 flex flex-col items-center justify-center">
                                 <Loader2 size={24} className="animate-spin text-blue-500 mb-2"/>
                                 <p className="text-xs text-blue-300">Calculating logistics...</p>
                              </div>
                           ) : aiSolution ? (
                              <div className="space-y-3 animate-fade-in text-sm">
                                 <div className="bg-slate-800 p-3 rounded border border-slate-700">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Immediate Action</div>
                                    <div className="text-green-400 font-bold">{aiSolution.immediateAction}</div>
                                 </div>
                                 <div className="bg-slate-800 p-3 rounded border border-slate-700">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Staff Assign</div>
                                    <div className="text-purple-300">{aiSolution.staffAssignment}</div>
                                 </div>
                                 <div className="bg-slate-800 p-3 rounded border border-slate-700">
                                    <div className="text-xs text-slate-500 uppercase font-bold mb-1">Protocol</div>
                                    <div className="text-slate-300 text-xs">{aiSolution.communicationProtocol}</div>
                                 </div>
                                 <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-xs transition-colors">
                                    Deploy Solution
                                 </button>
                              </div>
                           ) : null}
                        </div>
                     )}
                  </>
               )}
            </div>
         </div>
      </div>
    </div>
  );
};
