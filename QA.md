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

## IE6, MS-DOS Prompt, full-width desktop and YouTube watch page (v2.3)

- `npm run build` passed: 74.7 KB gzipped app JavaScript and 10.7 KB CSS. The vendored player loads only when IE is opened. No runtime package was added.
- Full desktop uses the monitor width at 1920×1080 and 2560×1440. No page/taskbar overflow at 2560×1440, 1920×1080, 1366×768, 1024×768, 540×900, 390×900, 320×700 and 844×390. All eight desktop program shortcuts remain available. IE chrome and its embedded page fit every tested size.
- IE opens from Quick Launch and its permanent desktop shortcut, displays literal `http://youtube.com`, and contains the local player/watch page. Real pointer playback inside the iframe advances; minimizing pauses media; maximizing fills the available desktop; restoring works; closing destroys the iframe; reopening starts paused.
- The 2007 page uses the August 24 archive's native 450×370 player box, 19×20 star assets, tab graphics, comment icons and layout metrics. All images loaded at 320, 390, 540, 768 and 1000 CSS pixels. Inspected full desktop and mobile page screenshots and the page embedded in IE.
- Player checks: local video starts paused, advances after Play, and pauses on click. External-video checks: selecting two real YouTube URLs creates the YouTube iframe, fetches the correct Chocolate Rain title, and switches fictional comment pools. This is evidence of integration/metadata loading, not a blanket guarantee of playback for every YouTube video.
- Community checks: five-star click and keyboard arrows; one saved rating; upvote score changes; literal rendering of entered markup; reply placement; rating/vote/reply persistence after reload; comment-score filtering; pagination; invalid-link feedback; independent unrated state and different general comment mixes for two external video IDs. The Numa-specific comments return for the bundled video. QA comments/storage were cleared afterward.
- MS-DOS Prompt uses the original toolbar crops and converted native bitmap fonts. Both rendered 6×8 and 8×12 text were compared against source bitmap glyph rasters in Chromium at DPR 1: zero pixel differences for the test line. Cowsay retains fixed character cells, commands work, and clear resets the command/caret. Inspected the maximized console. Arbitrary browser zoom/GDI parity is not claimed.
- The 88×31 badge remains exactly 88×31 at every tested width. Browser screenshots at 1× and 2× compare exactly under nearest-neighbor scaling, with six solid RGB colors and no intermediate antialias colors. Text and borders fit inside the bitmap bounds.
- Browser exception logs were empty. `git diff --check` passed. No changes were made to Eric's separate YouTube-player repository.

## Full-screen splash and comment copy (v2.3.1)

- Production build passed. The startup image/picture occupies the complete viewport at 1920×1080, 2560×1440, 1280×800, 1024×768 and 390×900; each selects and loads the intended source. Widescreen screenshots show edge-to-edge cloud artwork and the complete logo. The portrait variant preserves the image within a matching full-screen blue surface. No horizontal overflow.
- Verified Skip at every size, the complete normal boot phase sequence, and reduced-motion entry. Startup audio code and reveal timing are unchanged.
- Rewrote the 28 general and eight Numa-specific fictional comments and screen names into varied short reactions, questions and casual posts. Verified the revised Numa comments, general comments for another video, and different selections for different IDs. Existing vote/reply storage remains intact.
- Browser exception log empty. Desktop and portrait startup screenshots visually inspected.

## IE5, compact links and clean startup (v2.3.2)

- Production build passed: 74.96 KB gzipped app JavaScript and 10.93 KB CSS. No app dependency was added.
- links.exe now measures 706px on wide desktops, ending 18px after the last 88×31 button. All seven buttons wrap inside the window at 2560, 1920, 1366, 1024, 768, 540, 390 and 320 CSS pixels. Fixed a tablet grid-minimum overflow found during verification. Maximize, minimize, shortcut restore and restore-down passed on desktop and phone.
- After Power on, startup contains no buttons or visible status overlay at any reveal stage. Checked full-viewport desktop/phone posters, the normal phase sequence, automatic completion, restored keyboard focus and scrolling, session remembrance, initial silent Skip, and reduced motion. The initial welcome dialog keeps both choices. Audio playback and reveal timing are unchanged.
- Replaced the IE6/XP asset set with native IE5 resources and reference crops. Eight rendered toolbar icons compare pixel-for-pixel equal to their extracted originals in Chromium at DPR 1. Six also match the archived IE5 screenshot exactly. Original color hover states appear on hover; all browser images load at their native dimensions. Menu/toolbar/address band heights are 24/42/26px.
- IE5 chrome, status bar and embedded watch page have no horizontal overflow at 2560×1440, 1920×1080, 1366×768, 1024×768, 768×1024, 740×900, 540×900, 390×900, 320×700 and 844×390. Inspected desktop, phone and phone overflow-menu screenshots.
- Verified toolbar overflow commands, Search focusing the embedded page's search field, Escape focus restoration, About naming IE5, literal simulated address, playback, pause on minimize, maximize/restore, refresh starting paused, invalid-address handling and iframe destruction on close. The local YouTube comments remain present.
- Browser exception log empty. `git diff --check` passed. The pixel checks concern native icon bitmaps at DPR 1, not a claim of identical browser/GDI text rendering at arbitrary zoom.

## Native window motion, scrollbars and sounds (v2.4.0)

- `npm run build` passes: 77.90 KB gzipped app JavaScript and 11.67 KB CSS; no runtime dependency added. `git diff --check` passes.
- Captured actual Windows 98 Notepad minimize/maximize/restore/close transitions in v86, then tested every one of the eight website windows. Caption-only flights use integer positions/sizes for 250ms (observed completion at 251–268ms in the browser's frame loop), preserve the original window until completion, omit flying controls and close immediately. Maximize places the title at (0,0), across the viewport, above the taskbar. Taskbar restore, rapid queued actions, reset cancellation, resize during flight, retained drag offsets and reduced motion passed.
- Shared scrollbars operate the real window/iframe scroll surface. Verified arrow steps, held-arrow repeat/release, thumb dragging, keyboard Home/End, both axes, proportional ARIA values, iframe reload reattachment and dynamic content growth/shrink. The iframe retains its disabled vertical bar when content fits. Rendered normal/pressed/disabled arrow sprites and original window controls/grip match the source pixels at DPR 1; the disabled Up button matches the native IE5 screenshot directly.
- Desktop/IE page/chrome fit without horizontal overflow at 2560×1440, 1920×1080, 1366×768, 1024×768, 768×1024, 540×900, 390×844, 320×700 and 844×390. Fixed the 320px YouTube account-link wrap exposed by the authentic-width scrollbar. Inspected final desktop, IE desktop, maximized phone and 320px screenshots.
- Actual browser playback passed for CHORD on errors/dialogs, DING on user-started build completion and START on IE navigation. Mute stops playing effects, prevents new playback and persists over reload; Start → Settings exposes it on mobile. Rejected audio promises do not interrupt commands, generate unhandled rejections or replay on the next command. No audio resources are fetched or played before interaction.
- Startup still fills the screen with no post-choice buttons, reveals shell → icons → windows → ready, and runs the original recording once with a running AudioContext and measured nonzero samples. The shared mute also controls the playing startup recording; reload remains silent. This is browser audio-path evidence, not a physical-speaker listening test.
- IE's bundled video plays after actual pointer input; animated minimize still pauses it, and refresh reconnects the custom scrollbar. `arch` returns exactly `btw`. Browser exception log empty in the final production-preview session.
- Message dialogs now use the plain three-pixel native frame and a 75px OK button; modal focus deactivates underlying captions without a modern tinted backdrop. Checked dialog entry, OK dismissal and caption focus restoration.
- Source citations, extraction details, sound hashes and native animation observations are in `docs/window-asset-provenance.md`. Browser text rasterization, device pixel ratios and the enlarged mobile controls remain documented adaptations.
