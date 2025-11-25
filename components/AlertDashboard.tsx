import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, Bell, CheckCircle, Clock, Mail, MessageSquare, 
  Smartphone, XOctagon, Loader2, ShieldAlert, ArrowRight, 
  FileText, Activity, Users 
} from 'lucide-react';
import { Alert, AlertSeverity, AlertStatus, EventData } from '../types';
import { generateAlertCommunications, generateRemediationPlan } from '../services/geminiService';
import { SimpleMarkdown } from './SimpleMarkdown';

interface AlertDashboardProps {
  events: EventData[];
}

// IDC Rule Engine Configuration
const getThresholdForCategory = (category: string): number => {
  const c = category.toLowerCase();
  if (c.includes('webinar') || c.includes('virtual')) return 0.80; // 80% for Virtual
  if (c.includes('summit')) return 0.70; // 70% for Summits
  if (c.includes('expo') || c.includes('conference')) return 0.60; // 60% for Large Expos
  return 0.60; // Default
};

export const AlertDashboard: React.FC<AlertDashboardProps> = ({ events }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [activeTab, setActiveTab] = useState<'intelligence' | 'comms'>('intelligence');
  
  // AI States
  const [commsDraft, setCommsDraft] = useState<any | null>(null);
  const [loadingComms, setLoadingComms] = useState(false);
  const [playbook, setPlaybook] = useState<string | null>(null);
  const [loadingPlaybook, setLoadingPlaybook] = useState(false);

  // --- Rule Engine: Detect Alerts ---
  useEffect(() => {
    const detectedAlerts: Alert[] = [];

    events.forEach((e, index) => {
      const daysRemaining = Math.ceil((new Date(e.date).getTime() - Date.now()) / (1000 * 3600 * 24));
      const thresholdPct = getThresholdForCategory(e.category);
      const requiredRegs = Math.ceil(e.targetRegistrations * thresholdPct);
      
      // The 10-Day Rule Logic (Trigger on <= 10 days to ensure visibility)
      if (daysRemaining <= 10 && daysRemaining >= 0 && e.currentRegistrations < requiredRegs) {
        detectedAlerts.push({
          id: `alert-${e.id}`,
          eventId: e.id,
          eventName: e.name,
          severity: AlertSeverity.CRITICAL,
          status: AlertStatus.NEW,
          triggeredAt: new Date().toISOString(),
          condition: `T-${daysRemaining} Days: < ${(thresholdPct * 100).toFixed(0)}% Regs`,
          metrics: {
            daysRemaining,
            currentReg: e.currentRegistrations,
            targetReg: e.targetRegistrations,
            gap: requiredRegs - e.currentRegistrations
          },
          assignee: e.owner
        });
      }
    });

    setAlerts(detectedAlerts);
  }, [events]);

  const handleSelectAlert = (alert: Alert) => {
    setSelectedAlert(alert);
    setCommsDraft(null);
    setPlaybook(null);
    setActiveTab('intelligence');
  };

  const handleGenerateComms = async () => {
    if (!selectedAlert) return;
    setLoadingComms(true);
    const result = await generateAlertCommunications(selectedAlert);
    setCommsDraft(result);
    setLoadingComms(false);
  };

  const handleGeneratePlaybook = async () => {
    if (!selectedAlert) return;
    setLoadingPlaybook(true);
    const result = await generateRemediationPlan(selectedAlert);
    setPlaybook(result);
    setLoadingPlaybook(false);
  };

  const updateStatus = (id: string, newStatus: AlertStatus) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    if (selectedAlert?.id === id) {
      setSelectedAlert(prev => prev ? { ...prev, status: newStatus } : null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] -m-8">
      {/* Top Stats Bar */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center space-x-6">
          <div className="flex items-center text-red-600">
            <ShieldAlert size={20} className="mr-2" />
            <span className="font-bold text-lg">{alerts.length} Active Red Alerts</span>
          </div>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex space-x-4 text-sm text-gray-500">
            <span>Summit Threshold: <strong>70%</strong></span>
            <span>Virtual Threshold: <strong>80%</strong></span>
            <span>Standard: <strong>60%</strong></span>
          </div>
        </div>
        <div className="text-sm text-gray-400 font-mono">
          Global_Rule_Engine_v2.4.1_ACTIVE
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANE: Alert List */}
        <div className="w-1/3 bg-gray-50 border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 px-2">
              Critical Queue ({alerts.length})
            </h3>
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <div className="p-8 text-center text-gray-400 bg-white rounded-lg border border-dashed border-gray-300">
                  <CheckCircle size={32} className="mx-auto mb-2 text-green-500 opacity-50" />
                  <p>System Healthy. No 10-Day Rule violations detected.</p>
                </div>
              ) : (
                alerts.map(alert => (
                  <div 
                    key={alert.id}
                    onClick={() => handleSelectAlert(alert)}
                    className={`
                      cursor-pointer rounded-lg p-4 border transition-all duration-200 shadow-sm
                      ${selectedAlert?.id === alert.id 
                        ? 'bg-white border-idc-deepBlue ring-1 ring-idc-deepBlue shadow-md' 
                        : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow'}
                      ${alert.status === AlertStatus.NEW ? 'border-l-[4px] border-l-red-500' : 'border-l-[4px] border-l-gray-400'}
                    `}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                         <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                           alert.severity === AlertSeverity.CRITICAL ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                         }`}>
                           {alert.severity}
                         </span>
                         <span className="text-xs text-gray-400">{new Date(alert.triggeredAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      {alert.status === AlertStatus.NEW && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                    </div>
                    
                    <h4 className="font-bold text-idc-deepBlue mb-1 truncate">{alert.eventName}</h4>
                    
                    <div className="text-xs space-y-1 mb-3">
                      <div className="flex justify-between">
                         <span className="text-gray-500">Condition</span>
                         <span className="font-mono font-medium text-red-600">{alert.condition}</span>
                      </div>
                      <div className="flex justify-between">
                         <span className="text-gray-500">Gap</span>
                         <span className="font-bold text-gray-800">-{alert.metrics.gap} Regs</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                       <span className="text-xs text-gray-500 flex items-center">
                         <Users size={12} className="mr-1"/> Owner: {alert.assignee.split(' ')[0]}
                       </span>
                       <ArrowRight size={14} className={`text-gray-300 ${selectedAlert?.id === alert.id ? 'text-idc-deepBlue' : ''}`}/>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANE: War Room Detail */}
        <div className="w-2/3 bg-white flex flex-col">
          {selectedAlert ? (
            <>
              {/* Alert Header */}
              <div className="p-6 border-b border-gray-200 bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedAlert.eventName}</h2>
                      {selectedAlert.status === AlertStatus.NEW && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); updateStatus(selectedAlert.id, AlertStatus.ACKNOWLEDGED); }}
                          className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full hover:bg-red-700 shadow-sm flex items-center"
                        >
                          <Bell size={12} className="mr-1" /> Acknowledge Alert
                        </button>
                      )}
                      {selectedAlert.status === AlertStatus.ACKNOWLEDGED && (
                         <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full flex items-center">
                            <CheckCircle size={12} className="mr-1 text-green-500" /> Acknowledged
                         </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center">
                       Triggered by IDC Policy 4.2 (10-Day Rule) • Priority Level 1
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-red-600">{selectedAlert.metrics.daysRemaining}</div>
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">Days Left</div>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                   <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-xs text-gray-500 uppercase">Current</div>
                      <div className="text-xl font-bold text-gray-800">{selectedAlert.metrics.currentReg}</div>
                   </div>
                   <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <div className="text-xs text-gray-500 uppercase">Target</div>
                      <div className="text-xl font-bold text-gray-800">{selectedAlert.metrics.targetReg}</div>
                   </div>
                   <div className="bg-red-50 p-3 rounded border border-red-200">
                      <div className="text-xs text-red-600 uppercase font-bold">Shortfall</div>
                      <div className="text-xl font-bold text-red-700">-{selectedAlert.metrics.gap}</div>
                   </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 px-6">
                 <button 
                   onClick={() => setActiveTab('intelligence')}
                   className={`mr-6 py-4 text-sm font-bold border-b-2 flex items-center ${activeTab === 'intelligence' ? 'border-idc-deepBlue text-idc-deepBlue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                 >
                   <Activity size={16} className="mr-2" /> War Room Intelligence
                 </button>
                 <button 
                   onClick={() => setActiveTab('comms')}
                   className={`mr-6 py-4 text-sm font-bold border-b-2 flex items-center ${activeTab === 'comms' ? 'border-idc-deepBlue text-idc-deepBlue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                 >
                   <MessageSquare size={16} className="mr-2" /> Communications Center
                 </button>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                {activeTab === 'intelligence' && (
                   <div className="space-y-6">
                      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg text-gray-800 flex items-center">
                               <FileText size={20} className="mr-2 text-idc-lightBlue" /> Remediation Playbook
                            </h3>
                            <button 
                              onClick={handleGeneratePlaybook}
                              disabled={loadingPlaybook}
                              className="bg-idc-deepBlue text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-800 disabled:opacity-50 flex items-center"
                            >
                               {loadingPlaybook ? <Loader2 size={14} className="animate-spin mr-2"/> : null}
                               {playbook ? 'Regenerate Plan' : 'Generate AI Plan'}
                            </button>
                         </div>
                         
                         {loadingPlaybook && (
                             <div className="py-12 text-center text-gray-400">
                                <Loader2 size={32} className="animate-spin mx-auto mb-2 text-idc-lightBlue"/>
                                <p>Analyzing historical data and best practices...</p>
                             </div>
                         )}

                         {!playbook && !loadingPlaybook && (
                            <div className="py-8 text-center text-gray-400 bg-gray-50 rounded border border-dashed border-gray-300">
                               <p>No active playbook. Generate one to see Root Cause Analysis and Recovery Steps.</p>
                            </div>
                         )}

                         {playbook && (
                            <div className="text-gray-700 animate-fade-in">
                               <SimpleMarkdown>{playbook}</SimpleMarkdown>
                            </div>
                         )}
                      </div>
                   </div>
                )}

                {activeTab === 'comms' && (
                  <div className="space-y-6">
                     <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                           <h3 className="font-bold text-lg text-gray-800 flex items-center">
                              <Mail size={20} className="mr-2 text-idc-lightBlue" /> Communication Drafts
                           </h3>
                           <button 
                             onClick={handleGenerateComms}
                             disabled={loadingComms}
                             className="bg-idc-deepBlue text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-800 disabled:opacity-50 flex items-center"
                           >
                              {loadingComms ? <Loader2 size={14} className="animate-spin mr-2"/> : null}
                              {commsDraft ? 'Regenerate Drafts' : 'Draft Notifications'}
                           </button>
                        </div>

                        {loadingComms && (
                             <div className="py-12 text-center text-gray-400">
                                <Loader2 size={32} className="animate-spin mx-auto mb-2 text-idc-lightBlue"/>
                                <p>Drafting executive and operational communications...</p>
                             </div>
                         )}

                        {!commsDraft && !loadingComms && (
                           <div className="py-8 text-center text-gray-400 bg-gray-50 rounded border border-dashed border-gray-300">
                              <p>No drafts generated. Create multi-channel notifications for Email, Slack, and SMS.</p>
                           </div>
                        )}

                        {commsDraft && (
                           <div className="space-y-6 animate-fade-in">
                              <div className="border border-gray-200 rounded-lg overflow-hidden">
                                 <div className="bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600 uppercase border-b border-gray-200 flex items-center">
                                    <Mail size={12} className="mr-2"/> Email (Executive)
                                 </div>
                                 <div className="p-4 bg-white text-sm font-sans text-gray-700">
                                    <div className="mb-2 font-bold border-b pb-2">Subject: {commsDraft.email?.subject}</div>
                                    <div dangerouslySetInnerHTML={{__html: commsDraft.email?.body || ''}} />
                                 </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600 uppercase border-b border-gray-200 flex items-center">
                                       <MessageSquare size={12} className="mr-2"/> Slack (Ops Channel)
                                    </div>
                                    <div className="p-4 bg-white text-sm whitespace-pre-wrap font-sans text-gray-700">
                                       {commsDraft.slack}
                                    </div>
                                 </div>
                                 <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="bg-gray-100 px-4 py-2 text-xs font-bold text-gray-600 uppercase border-b border-gray-200 flex items-center">
                                       <Smartphone size={12} className="mr-2"/> SMS (Event Owner)
                                    </div>
                                    <div className="p-4 bg-white text-sm whitespace-pre-wrap font-sans text-gray-700">
                                       {commsDraft.sms}
                                    </div>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8">
               <XOctagon size={64} className="mb-4 text-gray-200" />
               <h3 className="text-xl font-bold text-gray-600 mb-2">Select a Critical Alert</h3>
               <p className="max-w-md text-center">
                 Choose a red alert from the queue to enter the War Room, analyze root causes, and activate remediation protocols.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
