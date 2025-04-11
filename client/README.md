## 🚦 Todo Tree Task Management

This project uses [Todo Tree](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.todo-tree) for organized, visually awesome task tracking in VSCode.

### 🏷️ Tag System
- `ROOT-TODO` — Top-level project tasks or structure
- `TODO` — General feature or improvement
- `FIXME` — Bugs or urgent fixes
- `ANALYZE` — Research, analysis, or investigation
- `REVIEW` — Code or feature review needed
- `DATA-FIXME` — Data-related bugs or fixes

#### Priorities
- `[HIGH]`, `[MEDIUM]`, `[LOW]` (e.g., `TODO[HIGH]:`)

#### Context
- Add context in multi-line comments: feature, bug, file, etc.

### 🌈 How to Use
- Open the Todo Tree panel in VSCode (look for the 🌳 icon)
- Tasks are grouped by tag and color-coded for clarity
- Click a task to jump to its location
- Use the search/filter to focus on a tag, priority, or feature

### 🛠️ Customization
See `.vscode/settings.json` for all the custom tag, group, and highlight settings.

---

**Example:**
```js
/*
  TODO[MEDIUM]: Dashboard Onboarding
  - FEATURE: Add user onboarding tips for first-time users.
  - UI: Consider a dismissible banner or modal for onboarding.
*/
```

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
