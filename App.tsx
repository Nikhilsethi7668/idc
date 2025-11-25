

import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { EventCard } from './components/EventCard';
import { AIAdvisor } from './components/AIAdvisor';
import { GlobalMap } from './components/GlobalMap';
import { AlertDashboard } from './components/AlertDashboard';
import { RegionalIntelligence } from './components/RegionalIntelligence';
import { CompetitorIntelligence } from './components/CompetitorIntelligence';
import { FraudGuard } from './components/FraudGuard';
import { ContentEngine } from './components/ContentEngine';
import { PredictiveAnalytics } from './components/PredictiveAnalytics';
import { RevenueDashboard } from './components/RevenueDashboard'; 
import { DeepMarketingEngine } from './components/DeepMarketingEngine'; 
import { SponsorshipEngine } from './components/SponsorshipEngine'; 
import { SpeakerIntelligence } from './components/SpeakerIntelligence'; 
import { LiveOpsDashboard } from './components/LiveOpsDashboard'; 
import { Modal } from './components/Modal';
import { EventDetailModal } from './components/EventDetailModal';
import { MOCK_EVENTS } from './constants';
import { EventData, EventStatus, KPIMetrics, Region } from './types';
import { Calendar, AlertTriangle, TrendingUp, DollarSign, Search, Bell, Mic, MapPin, Building, Loader2, Plus, Database, Link as LinkIcon, Check, File as FileIcon } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { getVenueRecommendations } from './services/geminiService';
import { SimpleMarkdown } from './components/SimpleMarkdown';

function App() {
  const [currentView, setView] = useState('dashboard');
  const [events, setEvents] = useState<EventData[]>(MOCK_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Modals
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isDataSourceOpen, setIsDataSourceOpen] = useState(false);
  const [isEventDetailModalOpen, setIsEventDetailModalOpen] = useState(false);


  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    name: '',
    region: Region.NA,
    category: 'Conference',
    date: '',
    target: 0,
    owner: ''
  });

  // Venue Intel State
  const [venueIntel, setVenueIntel] = useState<string | null>(null);
  const [loadingVenue, setLoadingVenue] = useState(false);

  const selectedEvent = useMemo(() => events.find(e => e.id === selectedEventId), [events, selectedEventId]);

  // Computed Metrics
  const metrics: KPIMetrics = useMemo(() => {
    return {
      totalEvents: events.length,
      redAlertCount: events.filter(e => e.status === EventStatus.RED).length,
      totalRevenue: events.reduce((acc, curr) => acc + curr.revenue, 0),
      globalRegistrations: events.reduce((acc, curr) => acc + curr.currentRegistrations, 0),
    };
  }, [events]);

  const handleEventClick = (id: string) => {
    setSelectedEventId(id);
    setVenueIntel(null); // Reset intel
    setIsEventDetailModalOpen(true);
  };

  const handleViewFullProfile = () => {
    setIsEventDetailModalOpen(false);
    setView('details');
  };

  const handleVenueSearch = async (event: EventData) => {
    setLoadingVenue(true);
    const result = await getVenueRecommendations(
      event.coordinates[0], 
      event.coordinates[1], 
      "Business hotels and executive dining"
    );
    setVenueIntel(result);
    setLoadingVenue(false);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const event: EventData = {
      id: `evt-${Date.now()}`,
      name: newEvent.name,
      region: newEvent.region,
      category: newEvent.category,
      date: newEvent.date || new Date().toISOString(),
      targetRegistrations: Number(newEvent.target),
      currentRegistrations: 0,
      revenue: 0,
      status: EventStatus.GREEN,
      owner: newEvent.owner || 'Admin',
      dailyRegistrations: [],
      integrations: [],
      coordinates: [40.7128, -74.0060] // Default NYC
    };
    setEvents([...events, event]);
    setIsAddEventOpen(false);
    // Reset form
    setNewEvent({ name: '', region: Region.NA, category: 'Conference', date: '', target: 0, owner: '' });
  };

  const renderDashboard = () => (
    <div className="space-y-8 animate-fade-in-up">
      {/* KPI Glass Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Live Events', value: metrics.totalEvents, icon: Calendar, color: 'text-blue-600', sub: '2 starting this week' },
          { label: 'Red Alerts', value: metrics.redAlertCount, icon: AlertTriangle, color: 'text-red-500', sub: 'Action required' },
          { label: 'Global Regs', value: metrics.globalRegistrations.toLocaleString(), icon: TrendingUp, color: 'text-emerald-500', sub: '+12% vs Target' },
          { label: 'Pipeline Revenue', value: `$${(metrics.totalRevenue / 1000).toFixed(0)}k`, icon: DollarSign, color: 'text-purple-500', sub: 'YTD Performance' }
        ].map((stat, i) => (
          <div key={i} className="glass-card rounded-2xl p-6 relative overflow-hidden group hover:shadow-glow transition-all duration-300">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                <stat.icon size={64} className={stat.color} />
             </div>
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
                   <stat.icon size={18} className={stat.color} />
                </div>
                <div className="text-3xl font-display font-bold text-slate-800 mb-1">{stat.value}</div>
                <div className="text-xs font-medium text-slate-500">{stat.sub}</div>
             </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Events List (Left) */}
        <div className="lg:col-span-4 space-y-6 order-2 lg:order-1 h-full flex flex-col">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-display font-bold text-slate-800">Active Portfolios</h2>
            <button 
              onClick={() => setIsAddEventOpen(true)} 
              className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 uppercase tracking-wide flex items-center"
            >
              <Plus size={12} className="mr-1" /> Add Event
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[600px] custom-scrollbar pb-4">
            {events.map(event => (
              <EventCard key={event.id} event={event} onClick={() => handleEventClick(event.id)} />
            ))}
          </div>
        </div>

        {/* Global Map Visualization (Right) */}
        <div className="lg:col-span-8 order-1 lg:order-2">
          <div className="glass-card rounded-2xl p-1 h-[600px] shadow-premium relative overflow-hidden group">
            <div className="absolute top-4 left-6 z-10">
               <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest bg-white/80 backdrop-blur px-3 py-1 rounded-full shadow-sm">Global Intelligence Map</h3>
            </div>
            <div className="w-full h-full rounded-xl overflow-hidden">
               <GlobalMap events={events} onEventClick={handleEventClick} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEventDetails = () => {
    const event = events.find(e => e.id === selectedEventId);
    if (!event) return <div>Event not found</div>;

    return (
      <div className="space-y-8 animate-fade-in-up pb-12">
        <button 
          onClick={() => setView('dashboard')}
          className="text-sm text-slate-500 hover:text-idc-deepBlue flex items-center mb-2 font-semibold transition-colors"
        >
          ← Return to Command Center
        </button>

        {/* Hero Header */}
        <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-full bg-gradient-to-l from-blue-100/50 to-transparent pointer-events-none"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <span className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">{event.category}</span>
                <span className="px-3 py-1 bg-blue-50 border border-blue-100 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">{event.region}</span>
              </div>
              <h1 className="text-4xl font-display font-bold text-slate-900 mb-2">{event.name}</h1>
              <p className="text-slate-500 text-sm flex items-center font-medium">
                <Calendar size={16} className="mr-2 text-idc-lightBlue"/> {new Date(event.date).toLocaleDateString(undefined, {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'})}
              </p>
            </div>
            <div className="text-right bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-sm">
              <div className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Projected Revenue</div>
              <div className="text-3xl font-display font-bold text-idc-deepBlue">${event.revenue.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Charts */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-8 rounded-3xl shadow-sm">
               <h3 className="text-lg font-display font-bold text-slate-800 mb-6">Registration Velocity</h3>
               <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={event.dailyRegistrations.length > 0 ? event.dailyRegistrations : [{date: 'No Data', count: 0}]}>
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#005CB9" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#005CB9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tickFormatter={(d) => d.substring(5)} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} 
                    />
                    <Area type="monotone" dataKey="count" stroke="#005CB9" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
               </div>
            </div>

            {/* Maps Grounding Section */}
            <div className="glass-card p-8 rounded-3xl shadow-sm border border-blue-100 bg-blue-50/30">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-display font-bold text-slate-800 flex items-center">
                   <MapPin className="mr-2 text-idc-deepBlue" size={20} /> Venue & Location Intelligence
                 </h3>
                 <button 
                   onClick={() => handleVenueSearch(event)}
                   disabled={loadingVenue}
                   className="bg-white border border-gray-200 text-slate-700 hover:text-idc-deepBlue px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center transition-all hover:shadow-md"
                 >
                   {loadingVenue ? <Loader2 size={16} className="animate-spin mr-2"/> : <Building size={16} className="mr-2"/>}
                   Find Nearby Amenities
                 </button>
               </div>

               {!venueIntel && !loadingVenue && (
                  <div className="text-center py-8 text-slate-400">
                     <p>Use Gemini Maps Grounding to find strategic hotels and dining for VIPs.</p>
                  </div>
               )}
               
               {venueIntel && (
                  <div className="text-slate-700 bg-white p-6 rounded-xl border border-gray-100 shadow-inner">
                     <SimpleMarkdown>{venueIntel}</SimpleMarkdown>
                  </div>
               )}
            </div>
          </div>

          {/* AI Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <AIAdvisor event={event} />
            
            <div className="glass-card p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Data Integrations</h4>
                  <button onClick={() => setIsDataSourceOpen(true)} className="text-blue-600 text-xs font-bold hover:underline">+ Connect</button>
                </div>
                <div className="space-y-3">
                    {event.integrations.length > 0 ? event.integrations.map((int, i) => (
                        <div key={i} className="flex items-center justify-between text-sm p-3 bg-white/50 rounded-xl border border-white/60">
                            <span className="font-semibold text-slate-700">{int}</span>
                            <div className="flex items-center">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
                                <span className="text-emerald-600 text-[10px] font-bold">LIVE</span>
                            </div>
                        </div>
                    )) : (
                      <div className="text-xs text-gray-400 text-center py-4">No sources connected</div>
                    )}
                </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen">
      {/* Floating Sidebar */}
      <Sidebar currentView={currentView} setView={(v) => {
        setView(v);
        if (v !== 'details') setSelectedEventId(null);
      }} />
      
      {/* Main Content Area */}
      <main className="flex-1 ml-[280px] p-8 lg:p-12 relative z-0">
        
        {/* Top Command Bar */}
        <header className="flex justify-between items-center mb-10 sticky top-4 z-40 bg-white/70 backdrop-blur-xl p-4 rounded-2xl border border-white/40 shadow-sm">
          <div className="flex items-center space-x-4 w-1/3">
             <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-idc-lightBlue transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Ask Gemini: 'Show me APAC events trending down...'" 
                  className="w-full pl-12 pr-12 py-3 bg-slate-100/50 border-none rounded-xl text-sm font-medium text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none"
                />
                <Mic className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-idc-deepBlue cursor-pointer transition-colors" size={18} />
             </div>
          </div>
          
          <div className="flex items-center space-x-4">
             <button 
                onClick={() => setIsAddEventOpen(true)}
                className="bg-idc-deepBlue text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-glow hover:shadow-lg transition-all flex items-center"
             >
                <Plus size={16} className="mr-2" /> Add Event
             </button>
             
             <button 
                onClick={() => setIsDataSourceOpen(true)}
                className="bg-white border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center shadow-sm"
             >
                <Database size={16} className="mr-2" /> Connect Source
             </button>

             <div className="h-8 w-px bg-slate-200 mx-2"></div>

             <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
             </button>
             
             <div className="flex items-center space-x-3 cursor-pointer group ml-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-idc-deepBlue to-idc-lightBlue p-[2px] shadow-md group-hover:shadow-glow transition-all">
                   <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                      <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" className="w-8 h-8 rounded-full" />
                   </div>
                </div>
             </div>
          </div>
        </header>

        {/* Dynamic View Content */}
        <div className="min-h-[600px] relative">
           {currentView === 'dashboard' && renderDashboard()}
           {currentView === 'details' && renderEventDetails()}
           {currentView === 'events' && renderDashboard()}
           {currentView === 'alerts' && <AlertDashboard events={events} />}
           {currentView === 'analytics' && <RegionalIntelligence />}
           {currentView === 'competitors' && <CompetitorIntelligence />}
           {currentView === 'fraud' && <FraudGuard />}
           {currentView === 'content' && <ContentEngine />}
           {currentView === 'predictive' && <PredictiveAnalytics />}
           {currentView === 'revenue' && <RevenueDashboard />}
           {currentView === 'deep-marketing' && <DeepMarketingEngine />}
           {currentView === 'monetization' && <SponsorshipEngine />}
           {currentView === 'speaker-intel' && <SpeakerIntelligence />}
           {currentView === 'live-ops' && <LiveOpsDashboard />}
        </div>
      </main>

      {/* --- MODALS --- */}
      
      {selectedEvent && (
        <EventDetailModal 
          isOpen={isEventDetailModalOpen}
          onClose={() => setIsEventDetailModalOpen(false)}
          event={selectedEvent}
          onViewProfile={handleViewFullProfile}
        />
      )}

      {/* Add Event Modal */}
      <Modal isOpen={isAddEventOpen} onClose={() => setIsAddEventOpen(false)} title="Create New Portfolio Event">
        <form onSubmit={handleAddEvent} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Event Name</label>
            <input 
              required
              type="text" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. IDC Future of AI Summit"
              value={newEvent.name}
              onChange={e => setNewEvent({...newEvent, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Region</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                value={newEvent.region}
                onChange={e => setNewEvent({...newEvent, region: e.target.value as Region})}
              >
                {Object.values(Region).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Category</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                value={newEvent.category}
                onChange={e => setNewEvent({...newEvent, category: e.target.value})}
              >
                <option value="Conference">Conference</option>
                <option value="Summit">Summit</option>
                <option value="Webinar">Webinar</option>
                <option value="Forum">Forum</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Date</label>
              <input 
                required
                type="date" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                value={newEvent.date}
                onChange={e => setNewEvent({...newEvent, date: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Reg Target</label>
              <input 
                required
                type="number" 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                placeholder="1000"
                value={newEvent.target}
                onChange={e => setNewEvent({...newEvent, target: Number(e.target.value)})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Event Owner</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
              placeholder="Manager Name"
              value={newEvent.owner}
              onChange={e => setNewEvent({...newEvent, owner: e.target.value})}
            />
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={() => setIsAddEventOpen(false)}
              className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-idc-deepBlue text-white text-sm font-bold rounded-lg hover:bg-blue-800"
            >
              Create Event
            </button>
          </div>
        </form>
      </Modal>

      {/* Connect Data Source Modal */}
      <Modal isOpen={isDataSourceOpen} onClose={() => setIsDataSourceOpen(false)} title="Connect External Data Source">
        <div className="space-y-4">
          <p className="text-sm text-slate-500">Select a provider to sync events, registrations, and speaker data.</p>
          {[
            { name: 'Salesforce CRM', icon: Database, color: 'bg-blue-500' },
            { name: 'Cvent', icon: Calendar, color: 'bg-blue-600' },
            { name: 'HubSpot', icon: LinkIcon, color: 'bg-orange-500' },
            { name: 'Google Sheets', icon: FileIcon, color: 'bg-green-600' }
          ].map((source, i) => (
            <div key={i} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all group">
               <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white ${source.color}`}>
                     <source.icon size={20} />
                  </div>
                  <span className="font-bold text-slate-700">{source.name}</span>
               </div>
               <button className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-full font-bold text-slate-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  Connect
               </button>
            </div>
          ))}
          <div className="pt-4 text-center">
             <button onClick={() => setIsDataSourceOpen(false)} className="text-sm text-slate-400 hover:text-slate-600">Close</button>
          </div>
        </div>
      </Modal>

    </div>
  );
}

export default App;