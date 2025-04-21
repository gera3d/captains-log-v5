import React, { useState } from 'react';
import { StarIcon, ArrowPathIcon, Cog6ToothIcon, MagnifyingGlassCircleIcon } from '@heroicons/react/24/outline';

const roadmapItems = [
  {
    name: 'Star & Fork Ideas',
    description: 'Save favorite ideas and explore variations with our forking system. Perfect for teams brainstorming multiple directions from a single concept.',
    eta: 'Q2 2025', // Changed from Q1 2024 to Q2 2025 (April-June 2025)
    status: 'in-progress',
    icon: StarIcon,
    color: 'from-amber-400 to-amber-500',
    borderColor: 'border-amber-300',
    progressPercent: 65,
    isExpanded: true,
  },
  {
    name: 'Idea Ranking System',
    description: 'Objectively prioritize your business ideas with our AI-powered ranking algorithm. Compare potential, market fit, and execution complexity.',
    eta: 'Q3 2025', // Changed from Q2 2024 to Q3 2025 (July-September 2025)
    status: 'planned',
    icon: ArrowPathIcon,
    color: 'from-purple-400 to-purple-600',
    borderColor: 'border-purple-300',
    progressPercent: 30,
  },
  {
    name: 'n8n Custom Workflows',
    description: 'Connect GoodIdea to your existing tools with customizable automation workflows. Integrate with Notion, Slack, Trello and more.',
    eta: 'Q4 2025', // Changed from Q3 2024 to Q4 2025 (October-December 2025)
    status: 'researching',
    icon: Cog6ToothIcon,
    color: 'from-blue-400 to-blue-600',
    borderColor: 'border-blue-300',
    progressPercent: 15,
  },
  {
    name: 'Deep Research Integration',
    description: 'Take idea validation to the next level with AI-powered audience research and personalized insight generation tailored to your expertise.',
    eta: 'Q1 2026', // Changed from Q4 2024 to Q1 2026 (January-March 2026)
    status: 'planned',
    icon: MagnifyingGlassCircleIcon,
    color: 'from-emerald-400 to-emerald-600',
    borderColor: 'border-emerald-300',
    progressPercent: 5,
  },
];

const StatusBadge = ({ status }) => {
  const statusMap = {
    'in-progress': {
      label: 'In Progress',
      classes: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    'planned': {
      label: 'Planned',
      classes: 'bg-sky-100 text-sky-800 border-sky-200'
    },
    'researching': {
      label: 'Researching',
      classes: 'bg-purple-100 text-purple-800 border-purple-200'
    },
    'completed': {
      label: 'Completed',
      classes: 'bg-green-100 text-green-800 border-green-200'
    }
  };

  const { label, classes } = statusMap[status] || statusMap.planned;

  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${classes}`}>
      {label}
    </span>
  );
};

function RoadmapSection() {
  const [expandedItems, setExpandedItems] = useState([0]); // First item expanded by default

  const toggleExpand = (index) => {
    setExpandedItems(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <section id="roadmap" className="relative py-20 bg-gradient-primary text-primary-text">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-base font-semibold text-white/80 tracking-wide uppercase">What's Next</h2>
          <h3 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
            Our Product Roadmap
          </h3>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-white/70">
            Exciting new features coming to enhance your ideation journey
          </p>
        </div>

        <div className="relative">
          {/* Vertical line for timeline - lighter color for better visibility */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-white/20 hidden md:block"></div>
          
          <div className="space-y-12">
            {roadmapItems.map((item, index) => {
              const isExpanded = expandedItems.includes(index);
              const isEven = index % 2 === 0;
              
              return (
                <div key={index} className="relative">
                  {/* Time indicator (only on desktop) */}
                  <div className="hidden md:flex absolute top-0 left-1/2 transform -translate-x-1/2 items-center justify-center">
                    <div className={`z-10 h-10 w-10 rounded-full bg-white shadow-md border ${item.borderColor} flex items-center justify-center`}>
                      <item.icon className="h-5 w-5 text-gray-700" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Feature card with staggered layout */}
                  <div className={`md:w-5/12 ${isEven ? 'md:mr-auto' : 'md:ml-auto'} relative`}>
                    <div 
                      className={`bg-white rounded-xl overflow-hidden shadow-lg border border-white/20 backdrop-blur-sm transform transition duration-300 hover:shadow-xl ${isExpanded ? 'ring-2 ring-white/30' : ''}`}
                      onClick={() => toggleExpand(index)}
                    >
                      {/* Progress bar */}
                      <div className="w-full h-1 bg-gray-100">
                        <div 
                          className={`h-full bg-gradient-to-r ${item.color}`}
                          style={{ width: `${item.progressPercent}%` }}
                        ></div>
                      </div>
                      
                      <div className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${item.color} shadow-sm`}>
                              <item.icon className="h-5 w-5 text-white" aria-hidden="true" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <StatusBadge status={item.status} />
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {item.eta}
                                </span>
                              </div>
                            </div>
                          </div>
                          <button 
                            className="flex-shrink-0 ml-4 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpand(index);
                            }}
                            aria-expanded={isExpanded}
                            aria-label={isExpanded ? "Show less" : "Show more"}
                          >
                            <svg 
                              className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </div>
                        
                        <div className={`mt-3 overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-80' : 'max-h-0'}`}>
                          <p className="text-gray-600 mb-4">{item.description}</p>
                          <div className="flex items-center">
                            <div className="flex items-center gap-1">
                              <span className="text-xs font-medium text-gray-500">Progress:</span>
                              <span className="text-xs font-bold text-gray-700">{item.progressPercent}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Connector line to timeline - lighter color for better visibility */}
                    <div className={`absolute hidden md:block top-5 w-10 h-0.5 bg-white/20 ${isEven ? 'right-0 -mr-10' : 'left-0 -ml-10'}`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <button 
            disabled
            className="inline-flex items-center px-5 py-3 border border-white/20 text-base font-medium rounded-md text-primary-text/70 bg-secondary/70 relative cursor-not-allowed"
          >
            Request a Feature
            <svg className="ml-2 -mr-1 h-5 w-5 opacity-70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <span className="absolute -top-2 -right-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">Coming soon</span>
          </button>
        </div>
      </div>
    </section>
  );
}

export default RoadmapSection;
