import { DocumentTextIcon, MicrophoneIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon } from '@heroicons/react/24/solid';
import './IdeaIdentity.css';

// Content stage and personal interest are independent, presentation-only signals.
export default function IdeaIdentity({ developed, pinned, voice = false }) {
  const Icon = developed ? LightBulbIcon : voice ? MicrophoneIcon : DocumentTextIcon;
  return <div className="idea-identity-row">
    <span className={`idea-stage ${developed ? 'is-developed' : 'is-capture'}`}><span className="idea-stage-icon"><Icon aria-hidden="true" /></span>{developed ? 'Developed idea' : 'Capture'}</span>
    {pinned && <span className="idea-pin"><BookmarkIcon aria-hidden="true" />Pinned</span>}
  </div>;
}
