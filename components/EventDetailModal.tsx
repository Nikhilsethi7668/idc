
import React from 'react';
import { Modal } from './Modal';
import { EventData } from '../types';
import { Calendar, Users, Target, DollarSign, ArrowRight } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { AIAdvisor } from './AIAdvisor';

interface EventDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: EventData;
  onViewProfile: () => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({ isOpen, onClose, event, onViewProfile }) => {
  const daysRemaining = Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 3600 * 24));
  const progress = Math.min((event.currentRegistrations / event.targetRegistrations) * 100, 100);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Event Snapshot">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-xs font-bold">{event.region}</span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-bold">{event.category}</span>
          </div>
          <h2 className="text-2xl font-display font-bold text-slate-800">{event.name}</h2>
          <p className="text-sm text-slate-500 mt-1">{new Date(event.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-bold text-slate-700">{progress.toFixed(0)}% to Target</span>
            <span className="text-slate-400">{event.currentRegistrations.toLocaleString()} / {event.targetRegistrations.toLocaleString()}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className="bg-idc-lightBlue h-2 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
        
        {/* KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard icon={Users} label="Registrations" value={event.currentRegistrations.toLocaleString()} />
          <KpiCard icon={Target} label="Target" value={event.targetRegistrations.toLocaleString()} />
          <KpiCard icon={Calendar} label="Days Left" value={daysRemaining.toString()} />
          <KpiCard icon={DollarSign} label="Revenue" value={`$${(event.revenue / 1000).toFixed(0)}k`} />
        </div>

        {/* Registration Velocity Chart */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 h-64">
          <h4 className="text-sm font-bold text-slate-600 mb-2">Registration Velocity</h4>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={event.dailyRegistrations} margin={{ top: 5, right: 20, left: -20, bottom: 20 }}>
              <defs>
                <linearGradient id="modalChartFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#005CB9" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#005CB9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tickFormatter={(d) => d.substring(5)} tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
              <Tooltip contentStyle={{ borderRadius: '8px' }}/>
              <Area type="monotone" dataKey="count" stroke="#005CB9" strokeWidth={2} fill="url(#modalChartFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Advisor */}
        <AIAdvisor event={event} />

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-100 flex justify-end">
          <button 
            onClick={onViewProfile}
            className="bg-idc-deepBlue text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-800 transition-colors flex items-center shadow-lg"
          >
            View Full Event Profile <ArrowRight size={16} className="ml-2" />
          </button>
        </div>
      </div>
    </Modal>
  );
};

const KpiCard = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
    <div className="flex items-center text-slate-500 mb-1">
      <Icon size={12} className="mr-1.5" />
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </div>
    <div className="text-2xl font-display font-bold text-slate-800">{value}</div>
  </div>
);
