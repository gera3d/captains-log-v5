import "./CodingTools.css";

const tools = [
  {
    name: "Google Antigravity",
    icon: "antigravity.svg",
    use: "Capture ideas · build briefs",
  },
  { name: "Cursor", icon: "cursor-icon.svg", use: "Capture ideas · build briefs" },
  { name: "Codex", icon: "openai.png", use: "Bring your build brief" },
  { name: "Claude Code", icon: "claude.png", use: "Capture ideas · build briefs" },
  { name: "Google AI Studio", icon: "ai-studio.png", use: "Export prompts" },
];
export default function CodingTools() {
  return (
    <section
      className="home-tool-strip home-container"
      aria-labelledby="coding-tools-title"
    >
      <h2 id="coding-tools-title">
        Use Good Idea alongside your coding tools.
      </h2>
      <ul>
        {tools.map((tool) => (
          <li key={tool.name}>
            <img src={`/brands/${tool.icon}`} alt="" width="28" height="28" />
            <span>
              <strong>{tool.name}</strong>
              <small>{tool.use}</small>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
