
import React from 'react';
import { LayoutDashboard, CalendarDays, AlertTriangle, Settings, BarChart3, Swords, ShieldAlert, Sparkles, LogOut, BrainCircuit, Wallet, Megaphone, Mic2, Activity } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setView: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'events', label: 'Portfolios', icon: CalendarDays },
    { id: 'analytics', label: 'Market Intel', icon: BarChart3 },
    { id: 'revenue', label: 'Revenue Intel', icon: Wallet },
    { id: 'deep-marketing', label: 'Deep Marketing', icon: Megaphone },
    { id: 'monetization', label: 'Monetization', icon: Wallet },
    { id: 'speaker-intel', label: 'Speaker Intel', icon: Mic2 },
    { id: 'live-ops', label: 'Live Ops', icon: Activity },
    { id: 'predictive', label: 'Oracle AI', icon: BrainCircuit },
    { id: 'competitors', label: 'Competitors', icon: Swords },
    { id: 'content', label: 'AI Studio', icon: Sparkles },
    { id: 'alerts', label: 'Red Alerts', icon: AlertTriangle, alert: true },
    { id: 'fraud', label: 'Fraud Guard', icon: ShieldAlert },
  ];

  return (
    <div className="w-[280px] h-screen fixed left-0 top-0 p-4 z-50 flex flex-col font-sans">
      <div className="bg-idc-deepBlue/95 backdrop-blur-xl h-full rounded-2xl shadow-2xl flex flex-col text-white border border-white/10 relative overflow-hidden">
        
        {/* Decorative glow */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500/20 to-transparent pointer-events-none"></div>

        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-white text-idc-deepBlue font-black px-2.5 py-1 text-xl rounded shadow-lg transform -skew-x-12">IDC</div>
            <div className="flex flex-col">
              <span className="font-bold tracking-wide text-sm font-display">GLOBAL EVENTS</span>
              <span className="text-[10px] text-blue-300 uppercase tracking-widest font-semibold">Intelligence V2</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto custom-scrollbar">
          <div className="text-[10px] uppercase tracking-widest text-blue-300/50 font-bold mb-3 px-3">Main Modules</div>
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => setView(item.id)}
                    className={`group w-full flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 relative overflow-hidden ${
                      isActive
                        ? 'bg-blue-600 shadow-glow text-white font-semibold'
                        : 'text-blue-100/80 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-100 z-0"></div>
                    )}
                    <div className="relative z-10 flex items-center w-full">
                      <Icon size={18} className={`mr-3 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <span className="text-sm">{item.label}</span>
                      {item.alert && (
                        <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 text-[10px] uppercase tracking-widest text-blue-300/50 font-bold mb-3 px-3">System</div>
          <ul className="space-y-1">
            <li>
                <button 
                  onClick={() => setView('settings')}
                  className="w-full flex items-center px-4 py-3 rounded-xl text-blue-100/80 hover:bg-white/5 hover:text-white transition-all"
                >
                    <Settings size={18} className="mr-3" />
                    <span className="text-sm">Settings</span>
                </button>
            </li>
          </ul>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
          <div className="flex items-center justify-between group cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg border-2 border-white/10">
                JD
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white group-hover:text-blue-200 transition-colors">John Doe</span>
                <span className="text-[10px] text-blue-300">VP, Global Ops</span>
              </div>
            </div>
            <LogOut size={16} className="text-blue-300/50 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};
