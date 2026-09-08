# Homepage validation — September 8, 2026

Initial v2.0 validation: validated the completed React site in Chromium against both Vite development and the actual production output (`npm run preview`).

- Production build: passed. Approximately 71 KB gzipped JavaScript and 7 KB gzipped CSS.
- Browser interaction checks: 34 assertions passed. Covered minimizing/restoring all seven windows, focus restoration, terminal help/history/specs/unknown input, literal rendering of entered markup, opening a minimized program from the terminal, wallpaper changes, build completion, dialogs and Escape, Start menu, both secret triggers, mouse dragging, desktop reset, reduced motion, mobile navigation, mobile terminal use and copying the site button.
- Layout checks: no horizontal overflow at widths 320, 360, 390, 540, 541, 640, 768, 1024, 1050, 1280, 1440 and 1920 CSS pixels. All images loaded.
- Visual inspection: full desktop and phone layouts, including the lower windows, link buttons and footer.
- Browser exceptions: none recorded.
- Axe automated accessibility scan: zero reported violations, 49 passing rules. One category requires manual review because patterned backgrounds and decorative SVG content prevent automatic contrast calculation. This is not a claim of complete WCAG conformance.
- `git diff --check`: passed.

Hardware values were read from the current machine and use no serial numbers or device identifiers. The production site makes no hardware queries.

GitHub Pages deployment has not been run. The workflow is supplied for the repository owner to enable, while the private Sites preview serves the validated static output.

## Windows 98 asset and window-control revision (v2.1)

The revision uses archived Windows 98 icons and Start-menu bitmaps, locally hosted MS Sans Serif fonts and original Windows 98 bitmap controls. The classic Minecraft launcher bitmap is unchanged from the preserved mclaunch resource; its SHA-256 is `edd1c81a475fab92cdc188b9c6af2be7b5598171546ee01932dfc5ddaec32a1e`, identical to Minecraft Oldschool Edition’s favicon. Sources and license notices are in `public/asset-credits.html`.

- Production build passed (`npm run build`): 70.3 KB gzipped JavaScript, 8.2 KB gzipped CSS.
- Tested the production build in Chromium at 1440 and 390 CSS pixels. All seven windows passed three-control presence, maximize bounds, minimizing a maximized window, taskbar restoration with maximized state intact, restoring down, closing, and reopening from the permanent desktop shortcut. All seven shortcuts remained present and all images loaded; no browser exceptions were recorded.
- Fixed a reproduced mobile interaction race: smooth scrolling could move the title-bar control during a click. Program switching now scrolls immediately, matching the classic desktop behavior. The full desktop/mobile window-control checks pass after the fix.
- The default desktop background is exactly `rgb(0, 128, 128)` (`#008080`).

This revision is available in the local preview. It has not been pushed to GitHub or deployed over the earlier private Sites build.

### Native title-bar pixels and final project edit

- Replaced the recreated SVG controls with original screenshot crops. At a 480-pixel window width, the rendered minimize, maximize, close, caption-gradient strip and outer-frame rows compare pixel-for-pixel equal to the original Windows 98 Notepad capture.
- Extracted original Microsoft Marlett version 1.00 from `WIN98_49.CAB`. Monochrome rasterization at 10 pixels with the symbol encoding matches the three captured control glyphs exactly; Restore uses the same font and settings.
- Desktop caption height is exactly 18 pixels. Controls are 16×14 on desktop and enlarged to 32×28 on phones with nearest-neighbor rendering.
- Final production-browser checks passed at 1440×1000, 390×900, 320×700 and 844×390: all 21 controls present, maximize bounds, minimize/restore/close, reopening from Start, both remaining projects, correct YouTube asset, no broken images, no horizontal overflow and no browser exceptions.
- YouTube uses its original 2005–2009 favicon. Removed Bluesky Flex and Shield; projects.exe now contains two projects and derives its item count from the content data.
- The exact Windows 98 inactive-caption colors are preserved. Their original low contrast does not meet modern WCAG contrast thresholds; the earlier zero-violation result applies to the initial v2.0 styling, not this original palette.

Extraction coordinates, sources and hashes are recorded in `docs/window-asset-provenance.md`.

## Startup, taskbar, typography and content revision (v2.2)

- Production build passed: 72.2 KB gzipped JavaScript and 9.2 KB gzipped CSS. React and Vite remain the only packages needed by the app.
- Verified actual Web Audio playback in production Chromium: the original 7.8585-second WAV decodes, starts once with a running AudioContext, and produces a nonzero audio signal. No startup audio is fetched or played before the Power on gesture. This verifies the browser audio path, not a human listening test on physical speakers.
- Recorded the complete boot transition order: splash → taskbar → shortcuts → windows → ready. Checked silent skip, interruption during the splash, sound-checkbox opt-out, speaker mute/unmute, reload without replay, and Start → Settings → Replay startup.
- At 1440×1000, 390×900, 320×700, and 844×390: taskbar click-to-minimize/restore, Show Desktop and restoration, maximize/restore, close/reopen from persistent shortcuts, Ko-fi URL, electronic-mail wording, MCOSE description, and Linux terminal jokes all passed. No page or taskbar overflow. All app text computes to the MS W98 UI font family.
- The app’s MS Sans Serif web conversion replaces the shell-only 98.css fonts. Browser rasterization and scaled text are not claimed identical to Windows GDI. Original title-bar control bitmaps are unchanged.
- Inspected desktop, full phone layout and original startup-screen screenshots. The public Sites build and GitHub Pages have not been updated; these changes are in the local development/production previews.

- Edge cases passed: reduced motion goes directly from the short splash to the complete desktop; blocked session storage still permits entry; a failed audio fetch is explained and cannot block the desktop. Keyboard entry/exit of the Settings submenu and Escape focus restoration passed at 320px.
- No horizontal overflow and no broken images across 320, 360, 390, 540, 541, 768, 1024, 1050, 1280, 1440 and 1920 CSS pixels.
- Final checks preserve the cow easter egg’s character grid with the same Windows UI font, native 18px captions/16×14 buttons, and the 28px desktop taskbar/22px Start button. Browser exception log was empty. `git diff --check` passed.
