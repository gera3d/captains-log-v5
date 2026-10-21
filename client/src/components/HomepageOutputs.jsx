import { useRef, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import {
  MagnifyingGlassPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import "./HomepageOutputs.css";

const outputs = [
  {
    id: "report",
    label: "Market report",
    title: "Work through the idea.",
    caption: "See the risks, assumptions and an illustrative scorecard.",
  },
  {
    id: "prd",
    label: "Product spec",
    title: "Decide what the first version needs.",
    caption: "Keep the scope and the first useful check in view.",
  },
  {
    id: "build",
    label: "Build handoff",
    title: "Take it into your coding tool.",
    caption: "A page spec you can copy into your coding assistant.",
  },
];
const imagePath = (name) => `/images/outputs/${name}.png`;
function OutputImages({ type, enlarged = false }) {
  if (type === "report")
    return (
      <div className="home-gallery-report">
        <picture>
          <source
            media="(max-width:360px)"
            srcSet={imagePath("scorecard-small")}
          />
          <source
            media="(max-width:650px)"
            srcSet={imagePath("scorecard-mobile")}
          />
          <img
            src={imagePath("scorecard-desktop")}
            alt="Actual GoodIdea scorecard with illustrative scores, not measured market demand."
          />
        </picture>
        <div className="home-gallery-risk-details">
          <picture>
            <source
              media="(max-width:360px)"
              srcSet={imagePath("strengths-small")}
            />
            <source
              media="(max-width:650px)"
              srcSet={imagePath("strengths-mobile")}
            />
            <img
              src={imagePath("strengths-desktop")}
              alt="Actual report comparison showing local availability and a small starting group."
            />
          </picture>
          <picture>
            <source
              media="(max-width:360px)"
              srcSet={imagePath("risks-small")}
            />
            <source
              media="(max-width:650px)"
              srcSet={imagePath("risks-mobile")}
            />
            <img
              src={imagePath("risks-desktop")}
              alt="Actual report risks showing trust, damage and reliable returns."
            />
          </picture>
        </div>
      </div>
    );
  if (type === "prd")
    return (
      <div className="home-gallery-prd">
        <picture>
          <source
            media="(max-width:360px)"
            srcSet={imagePath(enlarged ? "prd-desktop" : "prd-small-excerpt")}
          />
          <source
            media="(max-width:650px)"
            srcSet={imagePath(enlarged ? "prd-desktop" : "prd-mobile-excerpt")}
          />
          <img
            src={imagePath("prd-desktop")}
            alt="Actual GoodIdea product spec. Mobile shows the complete scope and first-version check excerpt; desktop shows the full spec and borrowing table."
          />
        </picture>
      </div>
    );
  return (
    <div className="home-gallery-build">
      <picture>
        <source
          media="(max-width:360px)"
          srcSet={imagePath("blueprint-small")}
        />
        <source
          media="(max-width:650px)"
          srcSet={imagePath("blueprint-mobile")}
        />
        <img
          src={imagePath("blueprint-desktop")}
          alt="Actual copyable GoodIdea page-spec output with a headline, value description, call to action and useful features. This is a spec, not a built app."
        />
      </picture>
    </div>
  );
}
export default function HomepageOutputs() {
  const [enlarged, setEnlarged] = useState(null);
  const closeRef = useRef(null);
  const current = outputs.find((item) => item.id === enlarged);
  return (
    <>
      <section
        className="home-outputs home-container home-section"
        id="outputs"
        aria-labelledby="home-outputs-title"
      >
        <div id="how-it-works" className="home-output-anchor" />
        <div className="home-outputs-heading">
          <h2 id="home-outputs-title" className="font-display">
            See what your note
            <br />
            can become.
          </h2>
          <p>The same tool-library idea, in the actual app.</p>
        </div>
        <p
          className="home-output-flow"
          aria-label="From a note to a report, product spec and coding tool"
        >
          Your note <span aria-hidden="true">→</span> Report{" "}
          <span aria-hidden="true">→</span> PRD{" "}
          <span aria-hidden="true">→</span> Coding tool
        </p>
        <div className="home-output-story">
          {outputs.map((item) => (
            <figure
              key={item.id}
              data-output={item.id}
              className="home-output-scene"
            >
              <figcaption>
                <div>
                  <span className="home-output-kind">{item.label}</span>
                  <h3 className="font-display">{item.title}</h3>
                </div>
                <p>{item.caption}</p>
              </figcaption>
              <button
                type="button"
                className="home-output-preview"
                aria-label={`Enlarge ${item.label.toLowerCase()} example`}
                onClick={() => setEnlarged(item.id)}
              >
                <div className="home-gallery-label">
                  <span className="home-example-label">
                    {item.id === "report"
                      ? "Illustrative data and scores"
                      : item.id === "prd"
                        ? "Illustrative spec excerpt"
                        : "Illustrative page-spec output"}
                  </span>
                  <span>
                    <MagnifyingGlassPlusIcon aria-hidden="true" />
                    View larger
                  </span>
                </div>
                <OutputImages type={item.id} />
              </button>
            </figure>
          ))}
        </div>
        <p className="home-output-skill-note">
          Install the capture skill from Integrations to save new thoughts while
          you work.
        </p>
      </section>
      <Dialog
        open={current !== undefined}
        initialFocus={closeRef}
        onClose={() => setEnlarged(null)}
        className="home-output-dialog"
      >
        <div className="home-output-dialog-backdrop" aria-hidden="true" />
        <div className="home-output-dialog-viewport">
          <DialogPanel className="home-output-dialog-panel">
            <div className="home-output-dialog-header">
              <div>
                <DialogTitle className="font-display">
                  {current?.label} example
                </DialogTitle>
                <p>
                  Actual GoodIdea screens with illustrative data
                  {current?.id === "report" ? " and scores" : ""}.
                </p>
              </div>
              <button
                type="button"
                ref={closeRef}
                aria-label="Close enlarged example"
                onClick={() => setEnlarged(null)}
              >
                <XMarkIcon />
              </button>
            </div>
            <div
              className="home-output-zoom-content"
              tabIndex={0}
              role="region"
              aria-label="Enlarged product screens"
            >
              {current && <OutputImages type={current.id} enlarged />}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
