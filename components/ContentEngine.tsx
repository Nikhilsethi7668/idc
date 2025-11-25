import React, { useState } from 'react';
import { MOCK_EVENTS, MOCK_AUDIENCES } from '../constants';
import { generateMarketingContent } from '../services/geminiService';
import { ContentChannel, MarketingParams } from '../types';
import { Sparkles, Send, Copy, Monitor, Smartphone, Mail, Globe, Loader2, ArrowRight, Zap } from 'lucide-react';
import { SimpleMarkdown } from './SimpleMarkdown';

export const ContentEngine: React.FC = () => {
  const [selectedEventId, setSelectedEventId] = useState(MOCK_EVENTS[0].id);
  const [channel, setChannel] = useState<ContentChannel>(ContentChannel.EMAIL);
  const [audience, setAudience] = useState(MOCK_AUDIENCES[0]);
  const [tone, setTone] = useState("Professional & Urgent");
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    const event = MOCK_EVENTS.find(e => e.id === selectedEventId);
    if (event) {
      const params: MarketingParams = {
        eventId: selectedEventId,
        channel,
        audience,
        tone
      };
      const result = await generateMarketingContent(params, event.name);
      setGeneratedContent(result);
    }
    setLoading(false);
  };

  const getChannelIcon = (c: ContentChannel) => {
    switch (c) {
      case ContentChannel.EMAIL: return <Mail size={16}/>;
      case ContentChannel.GOOGLE_AD: return <Globe size={16}/>;
      case ContentChannel.LINKEDIN_AD: return <Monitor size={16}/>;
      default: return <Smartphone size={16}/>;
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] -m-8 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-blue-50/50 -z-10"></div>

      {/* Left: Configuration Panel */}
      <div className="w-[350px] bg-white/80 backdrop-blur-md border-r border-white/20 flex flex-col z-10 shadow-xl">
        <div className="p-6 border-b border-gray-100">
           <div className="flex items-center space-x-2 text-idc-deepBlue mb-1">
              <Sparkles size={20} className="text-purple-500 animate-pulse-slow" />
              <h2 className="text-lg font-display font-bold">AI Studio</h2>
           </div>
           <p className="text-xs text-gray-500">Generate high-conversion assets in seconds.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Event Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign Event</label>
            <select 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm transition-all"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
            >
              {MOCK_EVENTS.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>

          {/* Channel Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Channel</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(ContentChannel).map((c) => (
                <button
                  key={c}
                  onClick={() => setChannel(c)}
                  className={`flex items-center justify-center space-x-2 px-3 py-3 rounded-xl text-xs font-bold border transition-all ${
                    channel === c 
                      ? 'bg-idc-deepBlue text-white border-idc-deepBlue shadow-lg transform scale-[1.02]' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {getChannelIcon(c)}
                  <span>{c.replace('_', ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Audience Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Target Audience</label>
            <select 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            >
              {MOCK_AUDIENCES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          {/* Tone Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Brand Tone</label>
            <input 
              type="text" 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
              value={tone}
              onChange={(e) => setTone(e.target.value)}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-gradient-to-r from-idc-deepBlue to-idc-lightBlue text-white font-bold py-4 rounded-xl shadow-glow hover:shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <span className="flex items-center">Generate Assets <Send size={16} className="ml-2"/></span>}
          </button>
        </div>
      </div>

      {/* Right: Preview Canvas */}
      <div className="flex-1 p-8 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-6">
           <div>
             <h3 className="text-2xl font-display font-bold text-idc-deepBlue">Live Canvas</h3>
             <p className="text-sm text-gray-500">AI-generated drafts ready for deployment.</p>
           </div>
           {generatedContent && (
             <div className="flex space-x-3">
               <button className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                 <Copy size={16} className="mr-2"/> Copy Code
               </button>
               <button className="flex items-center px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-md">
                 Approve & Send <ArrowRight size={16} className="ml-2"/>
               </button>
             </div>
           )}
        </div>

        <div className="flex-1 bg-white rounded-2xl shadow-premium border border-gray-200 overflow-hidden relative">
           {!generatedContent && !loading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50/50">
                <Sparkles size={48} className="mb-4 text-purple-200" />
                <p className="font-medium">Configure campaign parameters to start creating.</p>
             </div>
           )}

           {loading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur z-20">
                <div className="w-16 h-16 border-4 border-blue-100 border-t-idc-lightBlue rounded-full animate-spin mb-4"></div>
                <p className="text-idc-deepBlue font-bold animate-pulse">Designing creatives...</p>
             </div>
           )}

           {generatedContent && (
             <div className="h-full overflow-y-auto p-8 custom-scrollbar">
                <div className="text-gray-800">
                   <SimpleMarkdown>{generatedContent}</SimpleMarkdown>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
