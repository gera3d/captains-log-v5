import { useRef, useState } from "react";
import "./HomepageOutputs.css";

const outputs = [
  {
    id: "report",
    label: "Market report",
    title: "Look at the idea more closely.",
    description:
      "Who would use it? What do they do now? Use the report to work through the opportunity and the assumptions you still need to check.",
    document: "Market & idea report",
    sections: [
      [
        "Who it could help",
        "Neighbors who need a tool for an occasional job and don’t want to buy one just for that.",
      ],
      [
        "What they might use today",
        "Borrowing from someone they know, renting a tool, or buying it. Find out what works for them and what doesn’t.",
      ],
      [
        "What needs checking",
        "Would people lend their tools? How would they agree on pickup, returns and damage? Talk to a few neighbors before building around those assumptions.",
      ],
    ],
    takeaway:
      "Next step: ask a few neighbors what they last borrowed or bought for a one-off job.",
  },
  {
    id: "prd",
    label: "Product spec",
    title: "Decide what the first version needs.",
    description:
      "Create a product requirements document, or PRD, from the idea. Use it to define the problem, the important features and what can wait.",
    document: "Product spec (PRD)",
    sections: [
      [
        "The problem",
        "It’s hard to know which tools are available nearby and whether you can borrow them when you need them.",
      ],
      [
        "A first version",
        "List a tool with a photo and availability. Let a neighbor request it. Have the owner confirm the request and agree on a return date.",
      ],
      [
        "Leave for later",
        "Payments, deposits and delivery. First find out whether a small group can make borrowing and returning work.",
      ],
    ],
    takeaway:
      "A useful check: someone can find an available drill, request it and see whether the owner confirmed.",
  },
  {
    id: "build",
    label: "Coding context",
    title: "Give your coding assistant the context.",
    description:
      "Take the idea, product spec and build brief into your coding tool. Give the assistant the problem and scope before asking it to start building.",
    document: "Build brief",
    sections: [
      [
        "What we’re building",
        "A tool library for a small group of neighbors. Start with finding a tool and requesting to borrow it.",
      ],
      [
        "What the assistant needs to know",
        "A tool has an owner and availability. A request needs an owner’s confirmation and an agreed return date. Keep the original problem and first-version scope with the brief.",
      ],
      [
        "Where to start",
        "Build a tool list and a request flow with sample data. Check the borrowing steps before adding payments or delivery.",
      ],
    ],
    takeaway:
      "Bring the relevant context into your assistant when you start or continue the work.",
  },
];

export default function HomepageOutputs() {
  const [selected, setSelected] = useState(0);
  const tabs = useRef([]);
  const output = outputs[selected];
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
        <p>
          That rough note can become a report, a product spec and a starting
          point for the build. Here’s an example using the same neighborhood
          tool-library idea.
        </p>
      </div>
      <div className="home-output-workbench">
        <div className="home-output-navigation">
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
                <span aria-hidden="true">{index + 1}</span>
                {item.label}
              </button>
            ))}
          </div>
          <div className="home-output-explanation" aria-live="polite">
            <h3 className="font-display">{output.title}</h3>
            <p>{output.description}</p>
          </div>
        </div>
        {outputs.map((item, index) => (
          <div
            key={item.id}
            hidden={selected !== index}
            role="tabpanel"
            id={`output-panel-${item.id}`}
            aria-labelledby={`output-tab-${item.id}`}
            tabIndex={0}
            className="home-output-paper"
          >
            <div className="home-output-document-header">
              <span>{item.document}</span>
              <span className="home-example-label">Illustrative example</span>
            </div>
            <h3 className="font-display">
              A tool library for
              <br className="home-output-desktop-break" /> the neighborhood
            </h3>
            <dl>
              {item.sections.map(([title, text]) => (
                <div key={title}>
                  <dt>{title}</dt>
                  <dd>{text}</dd>
                </div>
              ))}
            </dl>
            <p className="home-output-takeaway">{item.takeaway}</p>
          </div>
        ))}
      </div>
      <div className="home-output-skill">
        <h3 className="font-display">Keep working in your coding tool.</h3>
        <div>
          <p>
            Copy the build brief into your coding assistant, along with the
            report or product spec you want it to use. You choose what context
            to bring into the work.
          </p>
          <p>
            You can also install the GoodIdea capture skill from your
            dashboard’s Integrations to save new thoughts back to GoodIdea while
            you work.
          </p>
        </div>
      </div>
      <p className="home-output-disclosure">
        Illustrative excerpts for the same neighborhood tool-library idea.
      </p>
    </section>
  );
}
