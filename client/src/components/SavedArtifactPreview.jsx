import ReactMarkdown from 'react-markdown';
import { BookOpenIcon, DocumentCheckIcon } from '@heroicons/react/16/solid';
import { savedText } from './NotePreview';

// A small view of saved output, never a generated placeholder or metadata summary.
export function artifactSections(value) {
  const text = savedText(value).trim();
  const headings = [...text.matchAll(/^#{1,6}\s+(.+)$/gm)];
  return headings.map((match, index) => ({
    level: match[0].match(/^#+/)[0].length,
    heading: match[1].replace(/[*_]/g, '').trim(),
    body: text.slice(match.index + match[0].length, headings[index + 1]?.index ?? text.length).trim(),
  })).filter(section => section.level > 1 && section.body && !/sources|limits|keywords|might search|summary|elevator pitch/i.test(section.heading));
}
function firstThought(body) {
  const blocks = body.split(/\n\s*\n/).filter(Boolean);
  const block = blocks.find(value => !/^\s*\|/m.test(value));
  if (!block) return '';
  return block.split(/\n(?=\s*[-*]\s)/)[0].trim();
}
export default function SavedArtifactPreview({ note, preferSpec = false, compact = false, omitText = '', action = null }) {
  const spec = preferSpec && Boolean(savedText(note.prd_content).trim());
  const value = savedText(spec ? note.prd_content : note.business_idea).trim();
  if (!value) return null;
  const comparable = text => text.replace(/[*_#>]/g, '').replace(/elevator pitch\s*:/ig, '').replace(/\s+/g, ' ').trim().toLowerCase();
  const sections = artifactSections(value);
  const usable = sections.filter(section => (firstThought(section.body) || /^\s*\|/m.test(section.body)) && comparable(firstThought(section.body)) !== comparable(omitText));
  const selected = usable.slice(0, compact || spec ? 1 : 2);
  const plain = value.split(/\n\s*\n/).find(block => block.trim() && !/^\s*#/m.test(block));
  if (!selected.length && (!plain || comparable(plain) === comparable(omitText))) return null;
  const Icon = spec ? DocumentCheckIcon : BookOpenIcon;
  return <div className={`saved-artifact ${spec ? 'is-spec' : 'is-report'}`}>
    <div className="saved-artifact-kind"><Icon aria-hidden="true" />{spec ? 'Product spec' : 'Saved report'}{action}</div>
    <div className="saved-artifact-sections">{selected.length ? selected.map(section => {
      const rows = section.body.split('\n').filter(line => /^\s*\|/.test(line)).map(line => line.trim().replace(/^\||\|$/g, '').split('|').map(cell => cell.trim())).filter(row => !row.every(cell => /^[-: ]+$/.test(cell)));
      return <section key={section.heading}><h4>{section.heading}</h4>{rows.length > 1 ? <div className="saved-artifact-steps">{rows.slice(1, 3).map((row, index) => <div key={index}><strong>{row[0]}</strong><p>{row.slice(1).join(' · ')}</p></div>)}</div> : <ReactMarkdown allowedElements={['p','strong','em','ul','ol','li','blockquote']} unwrapDisallowed>{firstThought(section.body)}</ReactMarkdown>}</section>;
    }) : <ReactMarkdown allowedElements={['p','strong','em','ul','ol','li','blockquote']} unwrapDisallowed>{plain}</ReactMarkdown>}</div>
  </div>;
}
