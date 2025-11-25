import React, { useState } from 'react';
import { MOCK_FRAUD_CASES } from '../constants';
import { generateFraudAnalysis } from '../services/geminiService';
import { FraudCase, FraudStatus, RiskLevel } from '../types';
import { ShieldAlert, AlertOctagon, Fingerprint, Globe, Lock, Loader2, UserX, CheckCircle, Search, Bot } from 'lucide-react';
import { SimpleMarkdown } from './SimpleMarkdown';

export const FraudGuard: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<FraudCase | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cases, setCases] = useState(MOCK_FRAUD_CASES);

  const handleAnalyze = async (fraudCase: FraudCase) => {
    setSelectedCase(fraudCase);
    setAnalysis(null);
    setLoading(true);
    const result = await generateFraudAnalysis(fraudCase);
    setAnalysis(result);
    setLoading(false);
  };

  const updateStatus = (id: string, newStatus: FraudStatus) => {
    setCases(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
    if (selectedCase?.id === id) {
      setSelectedCase(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] -m-8">
      {/* Security Status Ribbon */}
      <div className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex items-center text-red-400 animate-pulse">
            <ShieldAlert size={20} className="mr-2" />
            <span className="font-bold text-lg tracking-wide">THREAT LEVEL: ELEVATED</span>
          </div>
          <div className="h-6 w-px bg-slate-700"></div>
          <div className="flex space-x-6 text-sm text-slate-400">
            <span className="flex items-center"><Bot size={14} className="mr-1"/> Bots Blocked: <strong className="text-white ml-1">1,240</strong></span>
            <span className="flex items-center"><UserX size={14} className="mr-1"/> Fake IDs: <strong className="text-white ml-1">45</strong></span>
            <span className="flex items-center"><Globe size={14} className="mr-1"/> Suspicious IPs: <strong className="text-white ml-1">128</strong></span>
          </div>
        </div>
        <div className="text-xs font-mono text-slate-500">
          IDC_SEC_OPS_V9.2 // <span className="text-green-500">MONITORING ACTIVE</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Threat Feed */}
        <div className="w-1/3 bg-slate-50 border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
             <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Threat Feed</h3>
                <Search size={14} className="text-slate-400" />
             </div>
             
             <div className="space-y-3">
               {cases.map(c => (
                 <div 
                   key={c.id}
                   onClick={() => handleAnalyze(c)}
                   className={`
                     cursor-pointer rounded-lg p-4 border transition-all duration-200 relative overflow-hidden group
                     ${selectedCase?.id === c.id 
                       ? 'bg-white border-slate-800 shadow-md' 
                       : 'bg-white border-gray-200 hover:border-slate-400 hover:shadow-sm'}
                   `}
                 >
                   {/* Risk Score Indicator */}
                   <div className={`absolute right-0 top-0 bottom-0 w-1.5 ${
                      c.riskLevel === RiskLevel.CRITICAL ? 'bg-red-600' :
                      c.riskLevel === RiskLevel.HIGH ? 'bg-orange-500' : 'bg-yellow-400'
                   }`}></div>

                   <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-slate-400">{new Date(c.timestamp).toLocaleTimeString()}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        c.status === FraudStatus.BLOCKED ? 'bg-slate-800 text-white' : 
                        c.status === FraudStatus.DETECTED ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {c.status}
                      </span>
                   </div>

                   <h4 className="font-bold text-slate-800 text-sm mb-1">{c.registrationName}</h4>
                   <div className="text-xs text-slate-500 truncate mb-2">{c.email}</div>

                   <div className="flex flex-wrap gap-1">
                      {c.flags.slice(0, 2).map((flag, i) => (
                         <span key={i} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded border border-red-100">
                           {flag}
                         </span>
                      ))}
                      {c.flags.length > 2 && <span className="text-[10px] text-gray-400 px-1">+{c.flags.length - 2} more</span>}
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Right: Forensics Lab */}
        <div className="w-2/3 bg-slate-100 flex flex-col">
          {selectedCase ? (
            <>
              {/* Case Header */}
              <div className="bg-white border-b border-gray-200 p-6">
                 <div className="flex justify-between items-start">
                    <div>
                       <div className="flex items-center space-x-3 mb-2">
                          <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                            <Lock className="mr-2 text-red-600" size={24}/> {selectedCase.email}
                          </h2>
                       </div>
                       <p className="text-sm text-slate-500 font-mono">
                          ID: {selectedCase.id} • IP: {selectedCase.ipAddress} • LOC: {selectedCase.location}
                       </p>
                    </div>
                    <div className="text-right">
                       <div className={`text-4xl font-black ${
                          selectedCase.riskScore > 90 ? 'text-red-600' : 'text-orange-500'
                       }`}>
                          {selectedCase.riskScore}
                       </div>
                       <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Risk Score</div>
                    </div>
                 </div>

                 <div className="flex space-x-3 mt-6">
                    <button 
                       onClick={() => updateStatus(selectedCase.id, FraudStatus.BLOCKED)}
                       className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-bold shadow-sm flex items-center"
                    >
                       <UserX size={16} className="mr-2"/> Block Identity
                    </button>
                    <button 
                       onClick={() => updateStatus(selectedCase.id, FraudStatus.CLEARED)}
                       className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded text-sm font-bold shadow-sm flex items-center"
                    >
                       <CheckCircle size={16} className="mr-2 text-green-500"/> Mark Safe
                    </button>
                 </div>
              </div>

              {/* Forensics Content */}
              <div className="flex-1 overflow-y-auto p-8">
                 <div className="grid grid-cols-2 gap-6 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                       <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center"><Fingerprint size={14} className="mr-1"/> Device Fingerprint</h3>
                       <code className="text-xs text-slate-700 bg-slate-50 p-2 rounded block break-all">
                          {selectedCase.deviceFingerprint}
                       </code>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                       <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center"><AlertOctagon size={14} className="mr-1"/> Triggered Flags</h3>
                       <div className="flex flex-wrap gap-2">
                          {selectedCase.flags.map((f, i) => (
                             <span key={i} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded border border-red-100 font-medium">
                                {f}
                             </span>
                          ))}
                       </div>
                    </div>
                 </div>

                 {/* AI Analysis Section */}
                 <div className="bg-slate-800 rounded-xl shadow-lg text-slate-200 overflow-hidden">
                    <div className="bg-slate-900 px-6 py-4 flex justify-between items-center border-b border-slate-700">
                       <h3 className="font-bold text-white flex items-center">
                          <Bot className="mr-2 text-green-400" size={20}/> AI Forensic Analyst
                       </h3>
                       {analysis && !loading && (
                          <button 
                            onClick={() => handleAnalyze(selectedCase)}
                            className="text-xs text-slate-400 hover:text-white underline"
                          >
                            Re-run Scan
                          </button>
                       )}
                    </div>

                    <div className="p-6">
                       {loading && (
                          <div className="flex flex-col items-center justify-center py-8">
                             <Loader2 size={32} className="animate-spin text-green-500 mb-3"/>
                             <p className="text-sm font-mono text-green-400">Running Deep Trace on IP & Email Patterns...</p>
                          </div>
                       )}
                       
                       {analysis && !loading && (
                          <div className="text-slate-200 text-sm">
                             <SimpleMarkdown>{analysis}</SimpleMarkdown>
                          </div>
                       )}
                       
                       {!analysis && !loading && (
                          <div className="text-center py-8 text-slate-500">
                             <p>Run AI diagnostics to uncover botnet signatures and identity spoofing.</p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
               <ShieldAlert size={64} className="mb-4 text-slate-300" />
               <h3 className="text-xl font-bold text-slate-600 mb-2">Select a Threat Case</h3>
               <p className="max-w-md text-center">
                 Review suspicious registration attempts to protect event integrity and revenue.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
