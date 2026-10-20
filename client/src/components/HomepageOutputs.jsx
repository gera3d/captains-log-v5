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
    caption: "See the analysis, risks and an example scorecard.",
  },
  {
    id: "prd",
    label: "Product spec",
    caption: "Turn the idea into a first version you can build.",
  },
  {
    id: "build",
    label: "Build handoff",
    caption: "Bring the build brief into your coding assistant.",
  },
];
const imagePath = (name) => `/images/outputs/${name}.png`;

function OutputImages({ type, enlarged = false }) {
  if (type === "report")
    return (
      <div className={`home-gallery-report ${enlarged ? "is-enlarged" : ""}`}>
        <picture>
          <source
            media="(max-width: 650px)"
            srcSet={imagePath("scorecard-mobile")}
          />
          <img
            src={imagePath("scorecard-desktop")}
            alt="Actual GoodIdea report scorecard with illustrative example scores, not market evidence."
          />
        </picture>
        <div className="home-gallery-risk-details">
          <picture>
            <source
              media="(max-width: 650px)"
              srcSet={imagePath("strengths-mobile")}
            />
            <img
              src={imagePath("strengths-desktop")}
              alt="Actual report comparison showing local availability and starting with a small group."
            />
          </picture>
          <picture>
            <source
              media="(max-width: 650px)"
              srcSet={imagePath("risks-mobile")}
            />
            <img
              src={imagePath("risks-desktop")}
              alt="Actual report risks showing trust, damage and reliable returns for the tool-library example."
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
            media="(max-width: 650px)"
            srcSet={imagePath(enlarged ? "prd-desktop" : "prd-mobile")}
          />
          <img
            src={imagePath("prd-desktop")}
            alt="Actual GoodIdea product spec with borrowing steps, a features table, scope checklist and acceptance check. Synthetic example."
          />
        </picture>
      </div>
    );
  return (
    <div className="home-gallery-build">
      <picture>
        <source
          media="(max-width: 650px)"
          srcSet={imagePath("handoff-mobile")}
        />
        <img
          src={imagePath("handoff-desktop")}
          alt="Actual GoodIdea build kit with the tool-library target and Copy Configured V1 Prompt control. Illustrative example."
        />
      </picture>
      <picture>
        <source media="(max-width: 650px)" srcSet={imagePath("build-mobile")} />
        <img
          src={imagePath("build-desktop")}
          alt="Actual build-kit configuration controls for coding tool, framework, data strategy and build scope. No prompts or keys shown."
        />
      </picture>
    </div>
  );
}

export default function HomepageOutputs() {
  const [selected, setSelected] = useState(0);
  const [enlarged, setEnlarged] = useState(false);
  const tabs = useRef([]);
  const closeRef = useRef(null);
  const current = outputs[selected];
  const onTabKeyDown = (event, index) => {
    let next;
    if (["ArrowRight", "ArrowDown"].includes(event.key))
      next = (index + 1) % outputs.length;
    else if (["ArrowLeft", "ArrowUp"].includes(event.key))
      next = (index + outputs.length - 1) % outputs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = outputs.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  };
  return (
    <>
      <section
        className="home-outputs home-container home-section"
        id="outputs"
        aria-labelledby="home-outputs-title"
      >
        <div className="home-outputs-heading">
          <h2 id="home-outputs-title" className="font-display">
            Figure out what
            <br />
            to build next.
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
        <div
          className="home-output-tabs"
          role="tablist"
          aria-label="Example idea outputs"
        >
          {outputs.map((item, index) => (
            <button
              type="button"
              role="tab"
              id={`output-tab-${item.id}`}
              aria-controls={`output-panel-${item.id}`}
              aria-selected={selected === index}
              tabIndex={selected === index ? 0 : -1}
              ref={(element) => {
                tabs.current[index] = element;
              }}
              onClick={() => setSelected(index)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              key={item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
        {outputs.map((item, index) => (
          <div
            key={item.id}
            hidden={selected !== index}
            role="tabpanel"
            id={`output-panel-${item.id}`}
            aria-labelledby={`output-tab-${item.id}`}
            className="home-output-panel"
          >
            <figure>
              <button
                type="button"
                className="home-output-preview"
                aria-label={`Enlarge ${item.label.toLowerCase()} example`}
                onClick={() => setEnlarged(true)}
              >
                <div className="home-gallery-label">
                  <span className="home-example-label">
                    Illustrative data{item.id === "report" ? " and scores" : ""}
                  </span>
                  <span>
                    <MagnifyingGlassPlusIcon aria-hidden="true" />
                    View larger
                  </span>
                </div>
                <OutputImages type={item.id} />
              </button>
              <figcaption>{item.caption}</figcaption>
            </figure>
          </div>
        ))}
        <p className="home-output-skill-note">
          Install the capture skill from Integrations to save new thoughts while
          you work.
        </p>
      </section>
      <Dialog
        initialFocus={closeRef}
        open={enlarged}
        onClose={() => setEnlarged(false)}
        className="home-output-dialog"
      >
        <div className="home-output-dialog-backdrop" aria-hidden="true" />
        <div className="home-output-dialog-viewport">
          <DialogPanel className="home-output-dialog-panel">
            <div className="home-output-dialog-header">
              <div>
                <DialogTitle className="font-display">
                  {current.label} example
                </DialogTitle>
                <p>
                  Actual GoodIdea screens with illustrative data
                  {current.id === "report" ? " and scores" : ""}.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close enlarged example"
                onClick={() => setEnlarged(false)}
                ref={closeRef}
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
              <OutputImages type={current.id} enlarged />
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  );
}
