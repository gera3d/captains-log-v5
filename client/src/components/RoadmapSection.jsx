import React, { useState } from 'react';
import { StarIcon, ArrowPathIcon, Cog6ToothIcon, MagnifyingGlassCircleIcon, ChevronDownIcon, ArrowRightIcon } from '@heroicons/react/24/outline';

const roadmapItems = [
  {
    name: 'Star & Fork Ideas',
    description: 'Save favorite ideas and explore variations with our forking system. Perfect for teams brainstorming multiple directions from a single concept.',
    eta: 'Q2 2025',
    status: 'in-progress',
    icon: StarIcon,
    color: 'from-amber-400 to-amber-500',
    borderColor: 'border-amber-400/30',
    progressPercent: 65,
  },
  {
    name: 'Idea Ranking System',
    description: 'Objectively prioritize your business ideas with our AI-powered ranking algorithm. Compare potential, market fit, and execution complexity.',
    eta: 'Q3 2025',
    status: 'planned',
    icon: ArrowPathIcon,
    color: 'from-purple-400 to-purple-600',
    borderColor: 'border-purple-400/30',
    progressPercent: 30,
  },
  {
    name: 'Custom Workflow Automations',
    description: 'Connect GoodIdea to your existing tools with customizable automation workflows. Integrate with Notion, Slack, Trello and more.',
    eta: 'Q4 2025',
    status: 'researching',
    icon: Cog6ToothIcon,
    color: 'from-blue-400 to-blue-600',
    borderColor: 'border-blue-400/30',
    progressPercent: 15,
  },
  {
    name: 'Deep Research Integration',
    description: 'Take idea validation to the next level with AI-powered audience research and personalized insight generation tailored to your expertise.',
    eta: 'Q1 2026',
    status: 'planned',
    icon: MagnifyingGlassCircleIcon,
    color: 'from-emerald-400 to-emerald-600',
    borderColor: 'border-emerald-400/30',
    progressPercent: 5,
  },
];

const StatusBadge = ({ status }) => {
  const statusMap = {
    'in-progress': {
      label: 'In Progress',
      classes: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
      dot: 'bg-amber-400 animate-pulse',
    },
    'planned': {
      label: 'Planned',
      classes: 'bg-sky-400/10 text-sky-300 border-sky-400/20',
      dot: 'bg-sky-400',
    },
    'researching': {
      label: 'Researching',
      classes: 'bg-purple-400/10 text-purple-300 border-purple-400/20',
      dot: 'bg-purple-400',
    },
    'completed': {
      label: 'Completed',
      classes: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
      dot: 'bg-emerald-400',
    },
  };

  const { label, classes, dot } = statusMap[status] || statusMap.planned;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${classes}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {label}
    </span>
  );
};

export default function RoadmapSection() {
  const [expandedItems, setExpandedItems] = useState([0]); // First item expanded by default

  const toggleExpand = (index) => {
    setExpandedItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section id="roadmap" className="relative py-24 bg-gradient-to-b from-slate-950 via-[#131b38] to-slate-950 text-white overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold tracking-widest uppercase mb-4">
            Product Timeline
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display text-white tracking-tight mb-4">
            Our Product Roadmap
          </h2>
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Continuous engineering to make GoodIdea the ultimate thought-to-startup launchpad.
          </p>
        </div>

        <div className="relative">
          {/* Vertical central timeline line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-blue-500/40 via-purple-500/30 to-white/10 hidden md:block" />

          <div className="space-y-10">
            {roadmapItems.map((item, index) => {
              const isExpanded = expandedItems.includes(index);
              const isEven = index % 2 === 0;
              const Icon = item.icon;

              return (
                <div key={index} className="relative">
                  {/* Central Timeline Node (Desktop only) */}
                  <div className="hidden md:flex absolute top-6 left-1/2 transform -translate-x-1/2 items-center justify-center z-10">
                    <div className={`h-11 w-11 rounded-full bg-slate-900 border ${item.borderColor} shadow-lg shadow-black/50 flex items-center justify-center transition-transform hover:scale-110`}>
                      <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Feature Card with staggered layout */}
                  <div className={`md:w-5/12 ${isEven ? 'md:mr-auto' : 'md:ml-auto'} relative`}>
                    <div
                      className={`bg-slate-900/80 backdrop-blur-md rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300 hover:border-white/20 cursor-pointer ${
                        isExpanded ? 'ring-1 ring-blue-400/40 bg-slate-900/95' : ''
                      }`}
                      onClick={() => toggleExpand(index)}
                    >
                      {/* Top Accent Progress Bar */}
                      <div className="w-full h-1 bg-white/5">
                        <div
                          className={`h-full bg-gradient-to-r ${item.color}`}
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>

                      <div className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`sm:hidden h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} shadow-sm flex`}>
                              <Icon className="h-5 w-5 text-white" aria-hidden="true" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold font-display text-white group-hover:text-amber-300 transition-colors">
                                {item.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1.5">
                                <StatusBadge status={item.status} />
                                <span className="text-xs font-mono font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-md border border-white/10">
                                  {item.eta}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(index);
                            }}
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? 'Show less' : 'Show more'}
                          >
                            <ChevronDownIcon
                              className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-amber-400' : ''}`}
                            />
                          </button>
                        </div>

                        {/* Collapsible details */}
                        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-80 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <p className="text-slate-300 text-sm leading-relaxed mb-4">
                            {item.description}
                          </p>
                          <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-white/10">
                            <span>Development Progress</span>
                            <span className="font-mono font-bold text-white">{item.progressPercent}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Connector line to timeline on desktop */}
                    <div className={`absolute hidden md:block top-11 w-10 h-0.5 bg-white/20 ${isEven ? 'right-0 -mr-10' : 'left-0 -ml-10'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Request CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm text-sm font-medium text-slate-300 shadow-md">
            <span>Want a specific integration or feature?</span>
            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold cursor-pointer hover:underline">
              Request on Community Roadmap <ArrowRightIcon className="w-4 h-4" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
