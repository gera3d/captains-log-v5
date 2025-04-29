import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import HubCreateModal from './HubCreateModal';
import { isFeatureHubsEnabled } from '../utils/featureFlags';

export default function CreateHubPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const baseIdea = searchParams.get('idea');
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!user) navigate('/');
  }, [user, navigate]);

  const handleClose = () => {
    setOpen(false);
    navigate(-1);
  };

  const handleCreated = (hub) => {
    setOpen(false);
    navigate(`/hub/${hub.id}`);
  };

  if (!user || !isFeatureHubsEnabled()) return null;

  return (
    <HubCreateModal
      isOpen={open}
      onClose={handleClose}
      onHubCreated={handleCreated}
      initialSelectedIdeas={baseIdea ? [baseIdea] : []}
    />
  );
}