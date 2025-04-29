import { isFeatureHubsEnabled } from '../utils/featureFlags';
import MyHubsList from './MyHubsList';
import { useAuth } from '../contexts/AuthContext';

export default function HubsDashboardSection() {
  const { user } = useAuth();

  if (!isFeatureHubsEnabled() || !user) return null;

  return (
    <section className="mb-8">
      <MyHubsList user={user} />
    </section>
  );
}
