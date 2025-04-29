import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export default function HubCreateModal({ isOpen, onClose, onHubCreated }) {
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [rolesNeeded, setRolesNeeded] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedIdeas, setSavedIdeas] = useState([]);
  const [selectedIdeas, setSelectedIdeas] = useState(initialSelectedIdeas);
  const { user } = useAuth();

  // Fetch user's saved ideas for base selection
  useEffect(() => {
    if (!user) return;
    supabase
      .from('saved_ideas')
      .select('id,title')
      .eq('user_id', user.id)
      .then(({ data }) => setSavedIdeas(data || []));
  }, [user]);

  // Reset selected ideas to initial whenever modal opens
  useEffect(() => {
    if (isOpen) setSelectedIdeas(initialSelectedIdeas);
  }, [isOpen, initialSelectedIdeas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user) {
      setError('You must be signed in to create a hub.');
      setLoading(false);
      return;
    }
    if (!selectedIdeas.length) {
      setError('Please select at least one base idea.');
      setLoading(false);
      return;
    }

    try {
      // create hub
      const hubData = { title, summary, description, creator_id: user.id };
      if (logoUrl.trim()) hubData.logo_url = logoUrl.trim();
      const { data: hub, error: hubError } = await supabase
        .from('hubs')
        .insert([hubData])
        .select()
        .single();
      if (hubError) throw hubError;

      // link selected ideas
      const linkRows = selectedIdeas.map(ideaId => ({ hub_id: hub.id, idea_id: ideaId }));
      await supabase.from('hub_ideas').insert(linkRows);

      // create owner role and membership as before
      const { data: roleData } = await supabase
        .from('hub_roles')
        .insert([{ hub_id: hub.id, title: 'owner', description: 'Hub owner with full permissions' }])
        .select()
        .single();
      await supabase.from('hub_members').insert([{ hub_id: hub.id, user_id: user.id, role_id: roleData.id, status: 'approved' }]);

      if (onHubCreated) onHubCreated(hub);
      // reset
      setTitle(''); setSummary(''); setDescription(''); setLogoUrl(''); setRolesNeeded(''); setSelectedIdeas([]);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create hub');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative border border-blue-100">
        <button
          aria-label="Close"
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold rounded-full w-9 h-9 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition"
          onClick={onClose}
        >&times;</button>
        <div className="flex flex-col items-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 21a2 2 0 01-2.828 0L3.05 13.05a7 7 0 119.9-9.9 7 7 0 019.9 9.9L13.828 21z" /></svg>
          <h2 className="text-2xl font-bold text-gray-800">Create a New Hub</h2>
          <p className="text-sm text-gray-500 mt-1">Share your idea and invite collaborators.</p>
        </div>
        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="hub-title">Title <span className="text-red-500">*</span></label>
            <input id="hub-title" type="text" className="input input-bordered w-full" value={title} onChange={e => setTitle(e.target.value)} required aria-required="true" maxLength={80} placeholder="e.g. AI for Good" />
            <div className="text-xs text-gray-400 mt-1">Give your hub a short, memorable name.</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="hub-summary">Summary <span className="text-gray-400">(optional)</span></label>
            <input id="hub-summary" type="text" className="input input-bordered w-full" value={summary} onChange={e => setSummary(e.target.value)} maxLength={120} placeholder="A one-line summary of your idea" />
            <div className="text-xs text-gray-400 mt-1">Briefly describe your hub's purpose.</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="hub-description">Description <span className="text-gray-400">(optional)</span></label>
            <textarea id="hub-description" className="textarea textarea-bordered w-full" value={description} onChange={e => setDescription(e.target.value)} rows={3} maxLength={500} placeholder="Explain your idea in more detail..." />
            <div className="text-xs text-gray-400 mt-1">Add details to help others understand your vision.</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="hub-logo">Logo URL <span className="text-gray-400">(optional)</span></label>
            <input id="hub-logo" type="text" className="input input-bordered w-full" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="Paste an image URL (optional)" />
            <div className="text-xs text-gray-400 mt-1">Add a logo or image to personalize your hub.</div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Base Idea(s) <span className="text-red-500">*</span></label>
            <select
              multiple
              className="select select-bordered w-full"
              value={selectedIdeas}
              onChange={e => setSelectedIdeas(Array.from(e.target.selectedOptions, o => o.value))}
              required
            >
              {savedIdeas.map(idea => (
                <option key={idea.id} value={idea.id}>{idea.title || 'Untitled Idea'}</option>
              ))}
            </select>
            <div className="text-xs text-gray-400 mt-1">Select one or more base ideas for this hub.</div>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded p-2 text-sm text-center">{error}</div>}
          <button type="submit" className="btn btn-primary w-full" disabled={loading} aria-busy={loading}>
            {loading ? 'Creating…' : 'Create Hub'}
          </button>
        </form>
      </div>
    </div>
  );
}
