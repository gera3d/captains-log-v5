import { useState } from 'react';
import { BookOpenIcon, ChartBarIcon, MagnifyingGlassIcon, MicrophoneIcon } from '@heroicons/react/16/solid';
import { parseIdeaReportSummary } from '../utils/parseIdeaReport';

export function savedText(value) {
  if (typeof value !== 'string') return '';
  let text = value;
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed === 'string') text = parsed;
    else if (parsed && typeof parsed === 'object') text = [parsed.idea, parsed.data, parsed.text, parsed.transcript, parsed.business_idea].find(item => typeof item === 'string') || value;
  } catch { /* Saved plain text needs no conversion. */ }
  return text.replace(/\\n/g, '\n');
}

export function formatDuration(value) {
  if (!Number.isFinite(value) || value <= 0) return null;
  const seconds = Math.round(value);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

export function ReportBadges({ text }) {
  // Only these counts are derived from saved report content. Do not render the
  // parser's legacy scorecard, market-position or community fallback values.
  const report = parseIdeaReportSummary(text);
  if (!report) return null;
  const items = [
    { icon: BookOpenIcon, value: report.sourceCount, label: 'sources' },
    { icon: ChartBarIcon, value: report.metrics.length, label: 'metrics' },
    { icon: MagnifyingGlassIcon, value: report.keywordCount, label: 'keywords' },
  ].filter(item => Number.isInteger(item.value) && item.value > 0);
  return items.length ? <div className="original-report-badges" aria-label="Saved report contents">{items.map(item => <span key={item.label}><item.icon aria-hidden="true" />{item.value} {item.label}</span>)}</div> : null;
}

export function RecordingPlayer({ note, title }) {
  const [failed, setFailed] = useState(false);
  if (!note.audio_url) return null;
  return <div className="original-audio"><div><MicrophoneIcon aria-hidden="true" /><span>Original recording</span>{formatDuration(note.duration) && <span>{formatDuration(note.duration)}</span>}</div>
    <audio controls preload="none" src={note.audio_url} aria-label={`Original recording of ${title}`} onError={() => setFailed(true)} />
    {failed && <p role="alert">This recording couldn’t be loaded. The saved note is still available in its full view.</p>}
  </div>;
}
