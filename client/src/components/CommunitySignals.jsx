import React from 'react';
import {
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  MegaphoneIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

export default function CommunitySignals({ communitySignals }) {
  if (!communitySignals) return null;

  const subreddits = Array.isArray(communitySignals.subreddits) ? communitySignals.subreddits : [];
  const youtubeThemes = Array.isArray(communitySignals.youtubeThemes) ? communitySignals.youtubeThemes : [];
  const organicWedges = Array.isArray(communitySignals.organicWedges) ? communitySignals.organicWedges : [];

  if (subreddits.length === 0 && youtubeThemes.length === 0 && organicWedges.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
              🌐 Community Signals
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
            Digital Watering Holes & Distribution Wedges
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Where target customers congregate, vent about broken workflows, and search for workarounds
          </p>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Saved distribution notes
        </span>
      </div>

      {/* 1. Target Subreddits */}
      {subreddits.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            <ChatBubbleLeftRightIcon className="w-4 h-4 text-orange-500" />
            <span>Target Subreddits (Where They Vent)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subreddits.map((sub, idx) => {
              const name = typeof sub === 'string' ? sub : (sub.name || '');
              const cleanName = name.replace(/^r\//i, '');
              const members = sub.members || null;
              const reason = sub.reason || null;
              const redditUrl = `https://www.reddit.com/r/${cleanName}/`;

              return (
                <a
                  key={idx}
                  href={redditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-50 hover:bg-orange-50/50 border border-slate-200 hover:border-orange-200 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between group cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-500 font-black text-sm">r/</span>
                      <span className="font-bold text-slate-900 text-sm group-hover:text-orange-600 transition-colors">
                        {cleanName}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {members && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                          {members}
                        </span>
                      )}
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                  </div>

                  {reason && (
                    <p className="text-xs text-slate-600 mt-2.5 leading-relaxed m-0">
                      {reason}
                    </p>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. YouTube Search Demand */}
      {youtubeThemes.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            <VideoCameraIcon className="w-4 h-4 text-rose-500" />
            <span>High-Intent Video & Creator Search Queries</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {youtubeThemes.map((item, idx) => {
              const query = typeof item === 'string' ? item : item.query;
              const intent = item.intent || null;
              const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

              return (
                <a
                  key={idx}
                  href={youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-50 hover:bg-rose-50/40 border border-slate-200 hover:border-rose-200 rounded-xl p-3 flex items-center justify-between gap-3 group transition cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-rose-500 text-xs">▶</span>
                    <span className="text-xs font-medium text-slate-800 truncate group-hover:text-rose-600 transition-colors">
                      "{query}"
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {intent && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600">
                        {intent}
                      </span>
                    )}
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 transition-colors" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Zero-CAC Organic Distribution Wedges */}
      {organicWedges.length > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
            <MegaphoneIcon className="w-4 h-4 text-emerald-600" />
            <span>Zero-CAC Organic Distribution Wedges</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {organicWedges.map((wedge, idx) => (
              <div
                key={idx}
                className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-emerald-950 font-medium"
              >
                <span className="text-emerald-600 font-bold mt-0.5">⚡</span>
                <span className="leading-relaxed">{wedge}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
