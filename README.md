# Eric’s personal computer

A personal homepage built with React and Vite. Seven small desktop windows, original SVG pixel art, a toy shell, and exactly zero runtime services. The previous compiled site has been replaced by editable source.

## Local development

Requires Node 22.12+ (or another supported Vite 7 Node release).

```sh
npm ci
npm run dev
```

Create a production build with `npm run build`, then test it with `npm run preview`. Upload the contents of `dist/` to a static web host.

## Make yourself at home

- `src/content.js`: name, contact links, projects, favorite sites, PC hardware, version and last-updated date.
- `src/App.jsx`: homepage copy, windows, terminal commands, dialogs and interactions.
- `src/Art.jsx`: the original pixel icons, computer mascot and block landscape.
- `src/styles.css`: shared window chrome, palette, desktop arrangement and responsive layouts.
- `public/button.svg`: the original 88×31 site button; `public/favicon.svg`: the matching favicon.

The hardware shown was read from Eric’s computer on September 8, 2026. RAM is usable memory reported by Linux, not an assumed installed capacity. Storage totals the three SSDs (4 TB + 1 TB + 4 TB). No device identifiers, serial numbers or telemetry are collected or included.

The status text is manually edited. The visitor count and build system are explicitly decorative. Terminal commands run only the small built-in command handlers; there is no shell execution, server or data collection. All art is original; no external images, fonts or icon packages are loaded.

## Desktop controls

Click the title bar or content to focus a window. Drag its title bar on a desktop with a mouse. Minimize with `_`, then restore through the taskbar, shortcut or Start menu. “Tidy desktop” restores all windows and resets their positions. On narrow screens, windows remain in normal document flow and dragging is disabled.

Use `help` in the terminal for available commands. Arrow Up/Down recalls command history. `open minecraft`, `specs`, `fortune`, `wallpaper`, `cowsay`, `sudo` and `xyzzy` are worth trying. The Konami sequence is another secret. Escape closes the Start menu and dialogs. Animations respect reduced-motion settings. No audio plays.

## GitHub Pages

The included `.github/workflows/deploy.yml` builds on `main` and deploys `dist/` through GitHub Actions. In the repository’s Pages settings, choose **GitHub Actions** as the build source before enabling this workflow. Nothing needs to be built or copied into the repository root. Subproject links still point to Eric’s existing project sites.

No changes have been pushed to GitHub by the rebuild. The private Sites preview uses the same static production output; its project configuration is in `.openai/hosting.json`.
