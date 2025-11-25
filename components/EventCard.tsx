
import React from 'react';
import { EventData, EventStatus } from '../types';
import { AlertCircle, ArrowUpRight, Calendar, Users, Target, Activity } from 'lucide-react';

interface EventCardProps {
  event: EventData;
  onClick: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const daysRemaining = Math.ceil((new Date(event.date).getTime() - Date.now()) / (1000 * 3600 * 24));
  const progress = Math.min((event.currentRegistrations / event.targetRegistrations) * 100, 100);

  const statusConfig = {
    [EventStatus.GREEN]: { color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    [EventStatus.AMBER]: { color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
    [EventStatus.RED]: { color: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' },
  };

  const status = statusConfig[event.status];

  return (
    <div 
      onClick={onClick}
      className="group relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-premium transition-all duration-300 border border-slate-100 cursor-pointer overflow-hidden transform hover:-translate-y-1"
    >
      {/* Status Line */}
      <div className={`absolute top-0 left-0 w-1.5 h-full ${status.color} opacity-80`}></div>

      {/* Header */}
      <div className="flex justify-between items-start mb-5 pl-3">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{event.region}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{event.category}</span>
          </div>
          <h3 className="text-lg font-display font-bold text-slate-900 leading-tight group-hover:text-idc-lightBlue transition-colors">{event.name}</h3>
        </div>
        
        {event.status === EventStatus.RED && (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 animate-pulse">
            <AlertCircle size={16} />
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-5 pl-3">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 group-hover:border-blue-100 transition-colors">
          <div className="text-[10px] text-slate-500 mb-1 flex items-center font-medium uppercase tracking-wide">
             <Users size={10} className="mr-1.5 text-slate-400"/> Current
          </div>
          <div className="text-xl font-bold text-slate-800 font-display">
            {event.currentRegistrations.toLocaleString()}
          </div>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 group-hover:border-blue-100 transition-colors">
          <div className="text-[10px] text-slate-500 mb-1 flex items-center font-medium uppercase tracking-wide">
             <Calendar size={10} className="mr-1.5 text-slate-400"/> Countdown
          </div>
          <div className={`text-xl font-bold font-display ${daysRemaining <= 10 ? 'text-red-600' : 'text-slate-800'}`}>
            {daysRemaining} <span className="text-xs font-medium text-slate-400">days</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="pl-3 mb-2">
        <div className="flex justify-between items-end mb-2">
           <span className="text-xs font-semibold text-slate-600">{Math.round(progress)}% of Target</span>
           <span className="text-[10px] text-slate-400 font-medium">Goal: {event.targetRegistrations.toLocaleString()}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div 
            className={`h-full rounded-full ${status.color} transition-all duration-1000 ease-out`} 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Footer / CTA */}
      <div className="pl-3 mt-4 pt-4 border-t border-slate-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <span className="text-xs text-slate-400 font-medium">Last updated 2h ago</span>
          <div className="flex items-center text-idc-lightBlue text-xs font-bold uppercase tracking-wide">
            Details <ArrowUpRight size={14} className="ml-1" />
          </div>
      </div>
    </div>
  );
};
