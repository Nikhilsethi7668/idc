import React, { useState } from 'react';
import { Sparkles, Loader2, AlertOctagon } from 'lucide-react';
import { EventData, EventStatus } from '../types';
import { generateEventAnalysis } from '../services/geminiService';
import { SimpleMarkdown } from './SimpleMarkdown';

interface AIAdvisorProps {
  event: EventData;
}

export const AIAdvisor: React.FC<AIAdvisorProps> = ({ event }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    const result = await generateEventAnalysis(event);
    setAnalysis(result);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-idc-deepBlue to-idc-lightBlue p-4 flex justify-between items-center text-white">
        <div className="flex items-center space-x-2">
          <Sparkles className="text-yellow-400" size={20} />
          <h3 className="font-bold text-lg">Gemini Intelligence Engine</h3>
        </div>
        {event.status === EventStatus.RED && (
          <div className="bg-red-500/20 border border-red-400/50 rounded px-2 py-1 text-xs font-bold text-white flex items-center">
            <AlertOctagon size={12} className="mr-1" />
            Active Red Alert Protocol
          </div>
        )}
      </div>

      <div className="p-6">
        {!analysis && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              Generate real-time remediation playbooks based on {event.integrations.length} connected data sources.
            </p>
            <button
              onClick={handleAnalyze}
              className="bg-idc-deepBlue hover:bg-idc-lightBlue text-white font-semibold py-2 px-6 rounded-lg transition-colors flex items-center mx-auto shadow-lg"
            >
              <Sparkles size={16} className="mr-2" />
              Analyze Event Performance
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 size={32} className="text-idc-lightBlue animate-spin mb-3" />
            <p className="text-sm text-gray-500 font-medium">Analyzing historical trends & playbook matching...</p>
          </div>
        )}

        {analysis && (
          <div className="animate-fade-in">
             <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
                <SimpleMarkdown>{analysis}</SimpleMarkdown>
             </div>

             <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end space-x-3">
                <button className="text-sm text-gray-500 hover:text-idc-deepBlue underline">Export PDF</button>
                <button 
                    onClick={() => setAnalysis(null)}
                    className="text-sm font-medium text-idc-deepBlue border border-gray-300 px-3 py-1 rounded hover:bg-gray-50"
                >
                    Clear Analysis
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
