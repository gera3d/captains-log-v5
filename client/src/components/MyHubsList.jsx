import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

export default function MyHubsList({ user }) {
  const [hubs, setHubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    const fetchHubs = async () => {
      setLoading(true);
      
      try {
        // Make sure we're using the authenticated client - fixed by adding await
        const { data, error } = await supabase
          .from('hubs')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching hubs:', error);
          // Handle permission/auth errors gracefully
          if (error.code === '42501' || error.message?.toLowerCase().includes('permission denied')) {
            setError('You do not have permission to view your hubs. Please check your account or contact support.');
          } else if (error.message?.toLowerCase().includes('jwt') || error.message?.toLowerCase().includes('auth')) {
            setError('Authentication error. Please sign in again.');
          } else {
            setError(error.message || 'An unknown error occurred.');
          }
          setHubs([]);
        } else {
          setHubs(data || []);
          setError(null);
        }
      } catch (catchError) {
        console.error('Exception when fetching hubs:', catchError);
        setError('A network error occurred. Please try again later.');
        setHubs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHubs();
  }, [user]);

  if (!user) return null;
  if (loading) return <div>Loading your hubs...</div>;
  if (error) return (
    <div className="bg-orange-50 border border-orange-200 text-orange-700 rounded p-3 flex items-center gap-3 mt-6">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
      <span>{error}</span>
      {error.toLowerCase().includes('network') || error.toLowerCase().includes('auth') ? (
        <button className="btn btn-xs btn-secondary ml-2" onClick={() => window.location.reload()}>Retry</button>
      ) : null}
    </div>
  );
  if (!hubs.length) return (
    <div className="flex flex-col items-center justify-center text-gray-600 mt-8">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
      <div className="font-semibold">You haven't created any hubs yet.</div>
      <div className="text-sm mb-2">Ready to start collaborating? Click <span className='font-bold'>Create New Hub</span> above to get started!</div>
    </div>
  );

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-2">My Hubs</h3>
      <ul className="space-y-2">
        {hubs.map(hub => (
          <li key={hub.id}>
            <Link to={`/hub/${hub.id}`} className="flex p-4 bg-base-200 rounded shadow items-center gap-4 hover:bg-base-300 transition">
              {hub.logo_url && <img src={hub.logo_url} alt={hub.title} className="h-10 w-10 rounded-full object-cover" />}
              <div>
                <div className="font-bold">{hub.title}</div>
                <div className="text-sm text-gray-500">{hub.summary}</div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
