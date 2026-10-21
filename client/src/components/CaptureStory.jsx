import {
  AdjustmentsHorizontalIcon,
  ArrowRightIcon,
  CodeBracketSquareIcon,
  MicrophoneIcon,
} from "@heroicons/react/24/outline";
import "./CaptureStory.css";

export default function CaptureStory() {
  return (
    <section className="capture-story home-container" id="how-it-works" aria-labelledby="capture-story-title">
      <div className="capture-story-heading">
        <h2 id="capture-story-title" className="font-display">Start with a rough thought.</h2>
        <p>One example: a neighborhood tool library.</p>
      </div>
      <ol className="capture-story-track" role="list">
        <li className="capture-story-stage">
          <h3><MicrophoneIcon aria-hidden="true" />Capture</h3>
          <p>Say it or type it.</p>
          <div className="capture-story-note capture-story-artifact">
            <div className="capture-story-wave" aria-hidden="true">
              {[12, 22, 34, 18, 42, 28, 16, 36, 24, 40, 20, 12].map((height, index) => <span key={index} style={{ height }} />)}
            </div>
            <blockquote>“What if neighbors could borrow tools instead of buying them?”</blockquote>
            <span className="capture-story-note-label">A rough note. Your original stays.</span>
          </div>
          <a href="#workspace">See voice capture</a>
          <ArrowRightIcon className="capture-story-connector" aria-hidden="true" />
        </li>
        <li className="capture-story-stage">
          <h3><AdjustmentsHorizontalIcon aria-hidden="true" />Refine</h3>
          <p>Work out the first version.</p>
          <div className="capture-story-artifact capture-story-spec">
            <img src="/images/outputs/prd-mobile-excerpt.png" alt="Actual tool-library spec: available tools, requests, owner confirmation and an agreed return date." width="716" height="818" />
          </div>
          <a href="#output-prd">See the product spec</a>
          <ArrowRightIcon className="capture-story-connector" aria-hidden="true" />
        </li>
        <li className="capture-story-stage">
          <h3><CodeBracketSquareIcon aria-hidden="true" />Use in your tools</h3>
          <p>Copy the brief into your coding tool.</p>
          <div className="capture-story-artifact capture-story-brief">
            <img src="/images/outputs/blueprint-mobile.png" alt="Actual tool-library page brief: Borrow a tool from a neighbor, with a copyable landing-page spec." width="716" height="932" />
          </div>
          <a href="#output-build">See the build handoff</a>
        </li>
      </ol>
      <p className="capture-story-footnote">Actual spec and brief excerpts, with an example idea. You choose what to copy and build.</p>
    </section>
  );
}
