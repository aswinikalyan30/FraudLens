import React, { useState } from 'react';
import { ZoomIn, ZoomOut, PlusCircle } from 'lucide-react';
// import { useTheme } from '../../contexts/ThemeContext';
import CollapsibleSection from './CollapsibleSection';

interface TimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  risk: number;
  rules: string[];
  color: string; // green | orange | red
  note?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  isDark: boolean;
}

const Timeline: React.FC<TimelineProps> = ({ events, isDark }) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'red' | 'orange' | 'green'>('all');
  const [zoom, setZoom] = useState(1);
  const [manualNotes, setManualNotes] = useState<Record<string, string[]>>({});
  const [addingNoteFor, setAddingNoteFor] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const filtered = filter === 'all' ? events : events.filter(e => e.color === filter);

  const handleAddNote = (id: string) => {
    if (!noteText.trim()) return;
    setManualNotes(prev => ({
      ...prev,
      [id]: [...(prev[id] || []), noteText.trim()]
    }));
    setNoteText('');
    setAddingNoteFor(null);
  };

  return (
    <CollapsibleSection
      title="Timeline"
      defaultOpen
      rightAdornment={
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value as 'all' | 'red' | 'orange' | 'green')}
            className={`text-xs rounded-md border px-2 py-1 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'}`}
            aria-label="Filter timeline"
          >
            <option value="all">All</option>
            <option value="red">High</option>
            <option value="orange">Medium</option>
            <option value="green">Low</option>
          </select>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
              className={`p-1 rounded border ${isDark ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'}`}
              aria-label="Zoom out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(2, z + 0.25))}
              className={`p-1 rounded border ${isDark ? 'bg-gray-700 border-gray-600 hover:bg-gray-600' : 'bg-gray-100 border-gray-300 hover:bg-gray-200'}`}
              aria-label="Zoom in"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
        </div>
      }
    >
      <div style={{ fontSize: `${zoom * 0.85}rem` }} className="space-y-4 relative">
        <div className={`absolute left-4 top-0 bottom-0 w-0.5 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`} />
        {filtered.map((e, idx) => (
          <div
            key={e.id}
            className={`relative flex items-start gap-4 transition-all duration-200`}
          >
            <div
              className={`relative z-10 w-8 h-8 rounded-full border-3 flex items-center justify-center cursor-pointer ${
                e.color === 'green'
                  ? 'bg-green-500 border-green-200'
                  : e.color === 'orange'
                  ? 'bg-orange-500 border-orange-200'
                  : 'bg-red-500 border-red-200'
              }`}
              onClick={() => setExpanded(expanded === e.id ? null : e.id)}
            >
              {e.color === 'red' && idx > 0 && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </div>
            <div className={`flex-1 p-3 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-sm`}>
              <div className="flex justify-between items-start mb-1">
                <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{e.title}</h4>
                <span className={`text-[11px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(e.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${
                  e.color === 'green'
                    ? isDark
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-green-100 text-green-700 border border-green-300'
                    : e.color === 'orange'
                    ? isDark
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'bg-orange-100 text-orange-700 border border-orange-300'
                    : isDark
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : 'bg-red-100 text-red-700 border border-red-300'
                }`}>Risk: {e.risk}</span>
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === e.id ? null : e.id)}
                  className={`text-[11px] underline ${isDark ? 'text-purple-300' : 'text-purple-600'}`}
                >
                  {expanded === e.id ? 'Hide details' : 'Details'}
                </button>
                <button
                  type="button"
                  onClick={() => setAddingNoteFor(e.id)}
                  className={`text-[11px] flex items-center gap-1 ${isDark ? 'text-blue-300' : 'text-blue-600'} hover:underline`}
                >
                  <PlusCircle className="w-3 h-3" /> Note
                </button>
              </div>
              {expanded === e.id && (
                <div className="space-y-2 mb-2">
                  {e.rules.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {e.rules.map((r, i) => (
                        <span key={i} className={`text-[11px] px-2 py-0.5 rounded ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>{r}</span>
                      ))}
                    </div>
                  )}
                  {e.note && (
                    <p className={`text-xs italic ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{e.note}</p>
                  )}
                  {manualNotes[e.id]?.length && (
                    <div className="space-y-1">
                      {manualNotes[e.id].map((n, i) => (
                        <p key={i} className={`text-[11px] ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>• {n}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {addingNoteFor === e.id && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={noteText}
                    onChange={e => setNoteText(e.target.value)}
                    className={`flex-1 text-xs rounded border px-2 py-1 ${isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-700'}`}
                    placeholder="Add note..."
                  />
                  <button
                    type="button"
                    onClick={() => handleAddNote(e.id)}
                    className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-purple-600 text-white hover:bg-purple-500' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </CollapsibleSection>
  );
};

export default Timeline;
