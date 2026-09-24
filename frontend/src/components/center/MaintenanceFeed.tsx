// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Filter, ArrowUpDown, ShieldAlert, Wrench } from 'lucide-react';

interface IncidentReport {
  id: string;
  timestamp: string;
  equipment_id: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  root_cause: string;
  oem_part: string;
  confidence_score: number;
}

export default function MaintenanceFeed() {
  const [incidents, setIncidents] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'confidence'>('newest');

  useEffect(() => {
    fetch('http://localhost:8000/api/incidents')
      .then((res) => res.json())
      .then((data) => {
        setIncidents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching incidents:', err);
        setLoading(false);
      });
  }, []);

  // Filter & Sort Logic
  const filteredIncidents = incidents
    .filter((item) => filterSeverity === 'ALL' || item.severity === filterSeverity)
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      }
      if (sortBy === 'confidence') {
        return b.confidence_score - a.confidence_score;
      }
      return 0;
    });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-900/60 text-red-400 border-red-700 animate-pulse';
      case 'HIGH':
        return 'bg-orange-900/60 text-orange-400 border-orange-700';
      case 'MEDIUM':
        return 'bg-yellow-900/60 text-yellow-400 border-yellow-700';
      case 'LOW':
        return 'bg-blue-900/60 text-blue-400 border-blue-700';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-600';
    }
  };

  return (
    <div className="bg-industrial-panel border border-industrial-border p-4 rounded-xl shadow-lg mt-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-3 mb-4 pb-3 border-b border-industrial-border">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="text-industrial-yellow shrink-0" size={18} />
            Agentic Maintenance Feed
          </h2>
          <p className="text-[11px] text-gray-400">DeepSeek Anomaly Detection & Incident Pipeline</p>
        </div>

        {/* Filter & Sort Bar */}
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-industrial-bg border border-industrial-border px-2 py-1 rounded-lg flex-1 min-w-[110px]">
            <Filter size={12} className="text-industrial-cyan shrink-0" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-transparent text-gray-200 text-[11px] outline-none cursor-pointer w-full"
            >
              <option value="ALL" className="bg-industrial-panel">All Severities</option>
              <option value="CRITICAL" className="bg-industrial-panel">CRITICAL</option>
              <option value="HIGH" className="bg-industrial-panel">HIGH</option>
              <option value="MEDIUM" className="bg-industrial-panel">MEDIUM</option>
              <option value="LOW" className="bg-industrial-panel">LOW</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1 bg-industrial-bg border border-industrial-border px-2 py-1 rounded-lg flex-1 min-w-[110px]">
            <ArrowUpDown size={12} className="text-industrial-yellow shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-gray-200 text-[11px] outline-none cursor-pointer w-full"
            >
              <option value="newest" className="bg-industrial-panel">Newest First</option>
              <option value="oldest" className="bg-industrial-panel">Oldest First</option>
              <option value="confidence" className="bg-industrial-panel">Highest Confidence</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incident List */}
      {loading ? (
        <div className="py-8 text-center text-gray-400 text-sm animate-pulse">
          Loading incident feed from pipeline...
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div className="py-8 text-center text-gray-500 text-sm">
          No incidents found matching the selected filter.
        </div>
      ) : (
        /* Ditambahkan scrollbar internal + pembatas tinggi */
        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
          {filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              className="bg-industrial-bg/60 border border-industrial-border hover:border-industrial-cyan/50 p-3 rounded-xl transition-all duration-200 shadow-sm flex flex-col gap-2"
            >
              {/* Header internal Card: Badge, Equipment, ID, & Date */}
              <div className="flex flex-col gap-1 pb-2 border-b border-industrial-border/30">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded border font-mono ${getSeverityBadge(
                        incident.severity
                      )}`}
                    >
                      {incident.severity}
                    </span>
                    <span className="font-mono text-xs text-industrial-cyan font-semibold">
                      {incident.equipment_id}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono bg-industrial-panel px-1.5 py-0.5 rounded border border-industrial-border/40 shrink-0">
                    {incident.id}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  {new Date(incident.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xs font-semibold text-white leading-snug">{incident.title}</h3>

              {/* Detail Key-Value Stacked (Rapih di Sidebar Sempit) */}
              <div className="flex flex-col gap-1.5 bg-industrial-panel/50 p-2.5 rounded-lg border border-industrial-border/40 text-[11px]">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-gray-400 text-[10px] shrink-0">ROOT CAUSE</span>
                  <span className="text-gray-200 font-medium text-right truncate">{incident.root_cause}</span>
                </div>
                <div className="flex justify-between items-center gap-2 border-t border-industrial-border/20 pt-1">
                  <span className="text-gray-400 text-[10px] shrink-0">OEM PART</span>
                  <span className="text-industrial-yellow font-mono text-[10px] flex items-center gap-1 truncate">
                    <Wrench size={10} className="shrink-0" />
                    {incident.oem_part}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2 border-t border-industrial-border/20 pt-1">
                  <span className="text-gray-400 text-[10px] shrink-0">CONFIDENCE</span>
                  <span className="text-industrial-green font-mono font-bold text-[10px]">
                    {(incident.confidence_score * 100).toFixed(0)}% Match
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}