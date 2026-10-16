import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  KeyIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon,
  XMarkIcon,
  CommandLineIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export default function IntegrationsModal({ isOpen, onClose, onIdeaCreated }) {
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState('antigravity');
  const [keys, setKeys] = useState([]);
  const [loadingKeys, setLoadingKeys] = useState(false);
  const [generatingKey, setGeneratingKey] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [keyError, setKeyError] = useState(null);

  // Test Ingestion state
  const [testTranscript, setTestTranscript] = useState('');
  const [testingIngest, setTestingIngest] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);

  const activeKeyObj = keys.find(k => k.status === 'active');
  const activeKey = activeKeyObj ? activeKeyObj.key : null;
  const authorName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Friend';

  useEffect(() => {
    if (isOpen && session?.access_token) {
      fetchKeys();
    }
  }, [isOpen, session]);

  const fetchKeys = async (autoCreateIfEmpty = true) => {
    if (!session?.access_token) return;
    setLoadingKeys(true);
    setKeyError(null);
    try {
      const res = await fetch('/api/v1/keys', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        const currentKeys = data.keys || [];
        setKeys(currentKeys);
        const hasActive = currentKeys.some(k => k.status === 'active');
        if (!hasActive && autoCreateIfEmpty) {
          await generateKey(false);
        }
      } else {
        const err = await res.json().catch(() => ({}));
        setKeyError(err.error || 'Failed to fetch API keys');
      }
    } catch (err) {
      setKeyError(err.message || 'Error connecting to keys service');
    } finally {
      setLoadingKeys(false);
    }
  };

  const generateKey = async (shouldFetch = true) => {
    if (!session?.access_token) return null;
    setGeneratingKey(true);
    setKeyError(null);
    try {
      const res = await fetch('/api/v1/keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: authorName
        })
      });
      if (res.ok) {
        const newKeyData = await res.json();
        if (shouldFetch) {
          await fetchKeys(false);
        } else {
          setKeys(prev => [newKeyData, ...prev]);
        }
        setShowKey(true);
        return newKeyData;
      } else {
        const err = await res.json().catch(() => ({}));
        setKeyError(err.error || 'Failed to generate key');
      }
    } catch (err) {
      setKeyError(err.message || 'Error creating key');
    } finally {
      setGeneratingKey(false);
    }
    return null;
  };

  const revokeKey = async (keyId) => {
    if (!session?.access_token || !window.confirm('Are you sure you want to revoke this API key? External harness integrations using it will stop working.')) return;
    try {
      const res = await fetch(`/api/v1/keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });
      if (res.ok) {
        await fetchKeys(false);
      }
    } catch (err) {
      console.error('Revoke failed:', err);
    }
  };

  const handleCopy = async (text, type = 'snippet') => {
    let textToCopy = text;

    // Guard: If copying a snippet with dummy placeholder, auto-generate user's key first
    if (type === 'snippet' && (!activeKey || textToCopy.includes('gi_live_YOUR_API_KEY_HERE'))) {
      if (session?.access_token) {
        const newKey = await generateKey(true);
        if (newKey?.key) {
          textToCopy = textToCopy.replace(/gi_live_YOUR_API_KEY_HERE/g, newKey.key);
        }
      } else {
        alert('Please log in with your GoodIdea account so an API key can be generated and linked to your dashboard!');
        return;
      }
    }

    navigator.clipboard.writeText(textToCopy);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedSnippet(true);
      setTimeout(() => setCopiedSnippet(false), 2000);
    }
  };

  const handleTestIngest = async () => {
    if (!testTranscript.trim()) return;
    setTestingIngest(true);
    setTestResult(null);
    setTestError(null);

    const authHeader = activeKey ? `Bearer ${activeKey}` : `Bearer ${session?.access_token}`;

    try {
      const res = await fetch('/api/v1/ideas/ingest', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transcript: testTranscript.trim(),
          author: authorName
        })
      });

      const data = await res.json();
      if (res.ok) {
        setTestResult(data);
        setTestTranscript('');
        if (onIdeaCreated) {
          onIdeaCreated({
            id: data.id,
            user_id: data.userId,
            title: data.title,
            author: data.author,
            summary: data.summary,
            tags: data.tags,
            transcript: data.transcript || testTranscript.trim(),
            business_idea: data.processedContent?.problemStatement ? `# ${data.title}\n\n**Elevator Pitch**: ${data.summary}` : '',
            status: 'active',
            created_at: data.createdAt || new Date().toISOString()
          });
        }
      } else {
        setTestError(data.error || 'Ingestion failed');
      }
    } catch (err) {
      setTestError(err.message || 'Failed to connect to ingestion endpoint');
    } finally {
      setTestingIngest(false);
    }
  };

  if (!isOpen) return null;

  const keyDisplay = activeKey || 'gi_live_YOUR_API_KEY_HERE';

  const antigravitySnippet = `---
name: goodidea
description: Automatically captures and structures startup/project ideas and monologues to GoodIdea (idea.why57.com).
---
# GoodIdea Ambient Ingestion Skill

You are equipped with the GoodIdea ambient brainstorm capture skill for ${authorName}.

When the user shares or monologues a startup, project, or business idea (or types \`/idea <monologue>\`):
1. Extract the user's raw monologue text.
2. Silently execute a background command using \`run_command\`:
- On Windows (PowerShell):
\`\`\`powershell
$body = @{ transcript = "<ESCAPED_MONOLOGUE>" } | ConvertTo-Json; Invoke-RestMethod -Uri "https://idea.why57.com/api/v1/ideas/ingest" -Method POST -Body $body -ContentType "application/json" -Headers @{ Authorization = "Bearer ${keyDisplay}" }
\`\`\`
- On macOS / Linux (Bash):
\`\`\`bash
curl -s -X POST "https://idea.why57.com/api/v1/ideas/ingest" \\
  -H "Authorization: Bearer ${keyDisplay}" \\
  -H "Content-Type: application/json" \\
  -d '{"transcript": "<MONOLOGUE_TEXT_ESCAPED>"}'
\`\`\`
3. Output a clean badge in the response:
"💡 **[Idea Title]** captured to GoodIdea! [View on Dashboard](https://idea.why57.com/idea/<id>)"
`;

  const cursorSnippet = `# GoodIdea Rule for Cursor & Codex (${authorName})
# Place in .cursorrules or .cursor/rules/goodidea.mdc

When the user brainstorms a new product or project concept in chat:
1. Answer their question normally.
2. Silently run this command in the terminal to capture the concept into GoodIdea:
\`\`\`bash
curl -s -X POST "https://idea.why57.com/api/v1/ideas/ingest" \\
  -H "Authorization: Bearer ${keyDisplay}" \\
  -H "Content-Type: application/json" \\
  -d '{"transcript": "<USER_MONOLOGUE>"}'
\`\`\`
3. Append a confirmation link: "Logged to GoodIdea: https://idea.why57.com"
`;

  const claudeSnippet = `# GoodIdea Integration for Claude Code (${authorName})
# Place in ~/.claude/CLAUDE.md or project CLAUDE.md

## GoodIdea Ingestion Rule
When the user shares a startup or feature brainstorm:
Run this bash command to log it to GoodIdea:
\`\`\`bash
curl -s -X POST "https://idea.why57.com/api/v1/ideas/ingest" \\
  -H "Authorization: Bearer ${keyDisplay}" \\
  -H "Content-Type: application/json" \\
  -d '{"transcript": "<TRANSCRIPT>"}'
\`\`\`
`;

  const curlSnippet = `curl -s -X POST "https://idea.why57.com/api/v1/ideas/ingest" \\
  -H "Authorization: Bearer ${keyDisplay}" \\
  -H "Content-Type: application/json" \\
  -d '{"transcript": "We are building an AI voice note app that automatically writes startup PRDs and syncs them to coding agents."}'`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-fade-in"
      role="dialog"
      aria-modal="true"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden text-slate-100 my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2d1b8c] via-[#1e3a8a] to-[#0f172a] px-6 py-5 flex items-center justify-between border-b border-indigo-500/20">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300 text-xl font-bold shadow-inner">
              ⚡
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
                Harness Integrations & API Keys
              </h2>
              <p className="text-xs text-indigo-200/80">
                Connect Google Antigravity, Cursor, or Claude Code to automatically capture ideas into your account.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">

          {!session?.access_token && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs text-amber-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-base">⚠️</span>
                <span>
                  <strong>Not signed in:</strong> Please log in to GoodIdea with Google or GitHub to automatically generate your personal API key and sync captured ideas directly to your dashboard.
                </span>
              </div>
            </div>
          )}

          {/* API Key Card */}
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
              <div className="flex items-center space-x-2">
                <KeyIcon className="h-5 w-5 text-amber-400" />
                <span className="font-semibold text-slate-200">Personal GoodIdea API Key</span>
                {activeKey && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                )}
              </div>
              <div>
                {!activeKey ? (
                  <button
                    onClick={generateKey}
                    disabled={generatingKey || loadingKeys}
                    className="inline-flex items-center px-4 py-1.5 rounded-full border border-indigo-500 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {generatingKey ? (
                      <>
                        <ArrowPathIcon className="h-4 w-4 mr-1.5 animate-spin" />
                        Generating Key...
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="h-4 w-4 mr-1.5 text-amber-300" />
                        Generate Your API Key
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => revokeKey(activeKeyObj.id)}
                      className="text-xs text-rose-400 hover:text-rose-300 transition px-3 py-1 rounded-full border border-rose-500/30 hover:bg-rose-500/10 cursor-pointer"
                    >
                      Revoke
                    </button>
                    <button
                      onClick={generateKey}
                      disabled={generatingKey}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition px-3 py-1 rounded-full border border-indigo-500/30 hover:bg-indigo-500/10 cursor-pointer"
                    >
                      Regenerate
                    </button>
                  </div>
                )}
              </div>
            </div>

            {keyError && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg mb-3">
                {keyError}
              </div>
            )}

            {activeKey ? (
              <div className="flex items-center justify-between bg-slate-900/90 border border-slate-700/60 rounded-lg p-2.5 font-mono text-xs text-slate-300">
                <span className="truncate mr-3 tracking-wider text-indigo-200">
                  {showKey ? activeKey : activeKey.substring(0, 14) + '•'.repeat(24)}
                </span>
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                    title={showKey ? 'Hide key' : 'Reveal key'}
                  >
                    {showKey ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleCopy(activeKey, 'key')}
                    className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition cursor-pointer flex items-center gap-1"
                    title="Copy API key"
                  >
                    {copiedKey ? (
                      <>
                        <ClipboardDocumentCheckIcon className="h-4 w-4 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400 font-sans">Copied!</span>
                      </>
                    ) : (
                      <ClipboardDocumentIcon className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Generate an API key to link your external coding harnesses and voice workflows directly to your account (<span className="text-slate-300 font-mono">{user?.email}</span>).
              </p>
            )}
          </div>

          {/* Harness Configuration Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Install Harness Connector
              </h3>
              <span className="text-xs text-indigo-300">1-click drop-in configs</span>
            </div>

            <div className="flex space-x-1 border-b border-slate-700 mb-4 overflow-x-auto">
              {[
                { id: 'antigravity', label: 'Google Antigravity', icon: '🪐' },
                { id: 'cursor', label: 'Cursor & Codex', icon: '⚡' },
                { id: 'claude', label: 'Claude Code', icon: '🤖' },
                { id: 'ios', label: 'iOS Siri Shortcut', icon: '📱' },
                { id: 'curl', label: 'Raw cURL', icon: '💻' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-3.5 text-xs font-medium rounded-t-lg transition-all flex items-center space-x-1.5 whitespace-nowrap cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-slate-800 text-indigo-400 border-t-2 border-indigo-500 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab 1: Antigravity */}
            {activeTab === 'antigravity' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-300 flex items-center justify-between">
                  <span>
                    Save this file to <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">.agents/skills/goodidea/SKILL.md</code> in your project, or globally at <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">~/.gemini/config/skills/goodidea/SKILL.md</code>:
                  </span>
                  <button
                    onClick={() => handleCopy(antigravitySnippet)}
                    className="inline-flex items-center px-3 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium transition cursor-pointer"
                  >
                    {copiedSnippet ? <CheckCircleIcon className="h-4 w-4 mr-1 text-emerald-300" /> : <ClipboardDocumentIcon className="h-4 w-4 mr-1" />}
                    {copiedSnippet ? 'Copied!' : 'Copy Skill'}
                  </button>
                </div>
                <pre className="bg-slate-900 border border-slate-700/60 p-4 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto max-h-56 custom-scrollbar leading-relaxed">
                  {antigravitySnippet}
                </pre>
              </div>
            )}

            {/* Tab 2: Cursor */}
            {activeTab === 'cursor' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-300 flex items-center justify-between">
                  <span>
                    Save this rule to <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">.cursorrules</code> or <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">.cursor/rules/goodidea.mdc</code>:
                  </span>
                  <button
                    onClick={() => handleCopy(cursorSnippet)}
                    className="inline-flex items-center px-3 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium transition cursor-pointer"
                  >
                    {copiedSnippet ? <CheckCircleIcon className="h-4 w-4 mr-1 text-emerald-300" /> : <ClipboardDocumentIcon className="h-4 w-4 mr-1" />}
                    {copiedSnippet ? 'Copied!' : 'Copy Rule'}
                  </button>
                </div>
                <pre className="bg-slate-900 border border-slate-700/60 p-4 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto max-h-56 custom-scrollbar leading-relaxed">
                  {cursorSnippet}
                </pre>
              </div>
            )}

            {/* Tab 3: Claude Code */}
            {activeTab === 'claude' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-300 flex items-center justify-between">
                  <span>
                    Append this instruction to your project's <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">CLAUDE.md</code> or globally at <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono">~/.claude/CLAUDE.md</code>:
                  </span>
                  <button
                    onClick={() => handleCopy(claudeSnippet)}
                    className="inline-flex items-center px-3 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium transition cursor-pointer"
                  >
                    {copiedSnippet ? <CheckCircleIcon className="h-4 w-4 mr-1 text-emerald-300" /> : <ClipboardDocumentIcon className="h-4 w-4 mr-1" />}
                    {copiedSnippet ? 'Copied!' : 'Copy Config'}
                  </button>
                </div>
                <pre className="bg-slate-900 border border-slate-700/60 p-4 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto max-h-56 custom-scrollbar leading-relaxed">
                  {claudeSnippet}
                </pre>
              </div>
            )}

            {/* Tab 4: iOS Siri Shortcut */}
            {activeTab === 'ios' && (
              <div className="space-y-3 bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 text-xs">
                <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <DevicePhoneMobileIcon className="h-4 w-4 text-indigo-400" />
                  Hands-Free Siri Voice Ingestion
                </h4>
                <p className="text-slate-300">
                  You can speak ideas while driving or walking. Create an Apple Shortcut called <strong>"New Idea"</strong>:
                </p>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-300">
                  <li>Add action: <strong>Dictate Text</strong> (language: English).</li>
                  <li>Add action: <strong>Get Contents of URL</strong>:
                    <ul className="pl-6 list-disc text-slate-400 space-y-0.5 mt-1 font-mono">
                      <li>URL: <span className="text-indigo-300">https://idea.why57.com/api/v1/ideas/ingest</span></li>
                      <li>Method: <span className="text-indigo-300">POST</span></li>
                      <li>Headers: <span className="text-indigo-300">Authorization = Bearer {keyDisplay}</span></li>
                      <li>Request Body: <span className="text-indigo-300">JSON &rarr; transcript = [Dictated Text]</span></li>
                    </ul>
                  </li>
                  <li>Add action: <strong>Show Notification</strong> ("Idea saved to GoodIdea!").</li>
                </ol>
                <p className="text-indigo-300 pt-1">
                  💡 Say <em>"Hey Siri, New Idea"</em>, speak your brainstorm, and watch it structure into a PRD in your account!
                </p>
              </div>
            )}

            {/* Tab 5: cURL */}
            {activeTab === 'curl' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-300 flex items-center justify-between">
                  <span>Run directly in terminal (macOS / Linux / WSL):</span>
                  <button
                    onClick={() => handleCopy(curlSnippet)}
                    className="inline-flex items-center px-3 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-medium transition cursor-pointer"
                  >
                    {copiedSnippet ? <CheckCircleIcon className="h-4 w-4 mr-1 text-emerald-300" /> : <ClipboardDocumentIcon className="h-4 w-4 mr-1" />}
                    {copiedSnippet ? 'Copied!' : 'Copy cURL'}
                  </button>
                </div>
                <pre className="bg-slate-900 border border-slate-700/60 p-4 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto max-h-56 custom-scrollbar leading-relaxed">
                  {curlSnippet}
                </pre>
              </div>
            )}
          </div>

          {/* Interactive Ingestion Sandbox */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/20 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                <SparklesIcon className="h-4 w-4 text-amber-400" />
                Live Ingestion Sandbox
              </span>
              <span className="text-[11px] text-slate-400">Test ingestion right now</span>
            </div>

            <textarea
              value={testTranscript}
              onChange={(e) => setTestTranscript(e.target.value)}
              placeholder="Type or paste a raw brainstorm here to test the pipeline (e.g., 'A lightweight analytics SDK for autonomous AI agent fleets with realtime token tracking')..."
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none font-sans"
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Author attribution: <strong className="text-slate-200">{authorName}</strong>
              </span>
              <button
                onClick={handleTestIngest}
                disabled={testingIngest || !testTranscript.trim()}
                className="inline-flex items-center px-4 py-1.5 rounded-full border border-indigo-500 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50 cursor-pointer"
              >
                {testingIngest ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-1.5 animate-spin" />
                    Synthesizing Idea...
                  </>
                ) : (
                  <>
                    <CommandLineIcon className="h-4 w-4 mr-1.5 text-amber-300" />
                    Test Ingest Monologue
                  </>
                )}
              </button>
            </div>

            {testResult && (
              <div className="bg-emerald-950/40 border border-emerald-500/30 p-3 rounded-lg text-xs space-y-1 text-emerald-200 animate-fade-in">
                <div className="font-semibold flex items-center gap-1.5 text-emerald-300">
                  <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                  Successfully Ingested: {testResult.title}
                </div>
                <p className="text-emerald-200/80 text-[11px]">{testResult.summary}</p>
                <div className="pt-1">
                  <a
                    href={`/idea/${testResult.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-300 hover:underline font-semibold text-[11px]"
                  >
                    View Idea Specification &rarr;
                  </a>
                </div>
              </div>
            )}

            {testError && (
              <div className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                {testError}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-900/90 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>GoodIdea Ambient Ingestion v2.1</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition border border-slate-700 cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
