# Homepage validation — September 8, 2026

Validated the completed React site in Chromium against both Vite development and the actual production output (`npm run preview`).

- Production build: passed. Approximately 71 KB gzipped JavaScript and 7 KB gzipped CSS.
- Browser interaction checks: 34 assertions passed. Covered minimizing/restoring all seven windows, focus restoration, terminal help/history/specs/unknown input, literal rendering of entered markup, opening a minimized program from the terminal, wallpaper changes, build completion, dialogs and Escape, Start menu, both secret triggers, mouse dragging, desktop reset, reduced motion, mobile navigation, mobile terminal use and copying the site button.
- Layout checks: no horizontal overflow at widths 320, 360, 390, 540, 541, 640, 768, 1024, 1050, 1280, 1440 and 1920 CSS pixels. All images loaded.
- Visual inspection: full desktop and phone layouts, including the lower windows, link buttons and footer.
- Browser exceptions: none recorded.
- Axe automated accessibility scan: zero reported violations, 49 passing rules. One category requires manual review because patterned backgrounds and decorative SVG content prevent automatic contrast calculation. This is not a claim of complete WCAG conformance.
- `git diff --check`: passed.

Hardware values were read from the current machine and use no serial numbers or device identifiers. The production site makes no hardware queries.

GitHub Pages deployment has not been run. The workflow is supplied for the repository owner to enable, while the private Sites preview serves the validated static output.
