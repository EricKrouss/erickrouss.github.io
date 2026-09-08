# Windows 98 title-bar provenance

Source images:

- https://guidebookgallery.org/pics/gui/applications/office/notepad/win98.png (480×321)
- https://guidebookgallery.org/pics/gui/desktop/full/win98se.png (640×480)

Unmodified RGB crop boxes (left, top, right exclusive, bottom exclusive):

| Local PNG      | Source  | Crop             |
| -------------- | ------- | ---------------- |
| minimize       | Notepad | 424, 6, 440, 20  |
| maximize       | Notepad | 440, 6, 456, 20  |
| close          | Notepad | 458, 6, 474, 20  |
| title-active   | Notepad | 4, 4, 476, 5     |
| title-inactive | Desktop | 253, 12, 630, 13 |

The archive documents these as captures of actual Windows 98 and Windows 98 SE. The desktop caption is 18 pixels tall, with 16×14 controls. A four-pixel window frame places the title at x=4, y=4. Close has a two-pixel gap. On phones, the button artwork scales to 32×28 with nearest-neighbor rendering.

Restore comes from the original Microsoft Marlett 1.00 font extracted with `cabextract -F marlett.ttf` from the archived `WIN98_49.CAB` at https://www.okpb.cz/REG/WIN98/. Microsoft identifies version 1.00 as the Windows 98 font at https://learn.microsoft.com/en-us/typography/font-list/marlett. Neither the cabinet nor font is bundled in the site.

Rasterization: Pillow `ImageFont.truetype(path, 10, encoding="symb")` into a monochrome image. Characters `0`, `1`, and `r`, cropped to their ink bounds, exactly match the native minimize (6×2), maximize (9×9) and close (8×7) glyph pixels in the captured buttons. Character `2` provides the 8×9 Restore glyph, placed at (4, 2) in the same native button frame. Pressed states preserve the glyph pixels and shift them one pixel down and right inside the flat inset frame.

The caption strips are scaled horizontally to each live window. React supplies editable window titles and working controls. This is a browser interface, not Microsoft’s native window-manager code. The stock inactive title color is intentionally preserved, including its lower contrast.

Source hashes:

- Notepad screenshot: `a54e9ad2fe3f2d82a17ce25c59fbabd9101434e859fc8d02921c0dbf60ae8aac`
- Desktop screenshot: `08f4b3ecdacce5224eb48e2cdc8a95c9275be0f14b9d71c0cec1a092bdd15046`
- WIN98_49.CAB: `dec9214185c2ff9056ebecf85c0fec2edcf3fe74eb5bfa9b7ccfbedd350c09ed`
- Marlett 1.00: `07e5034ca18edc294135feebcfbe4913a57caa2806be951b117788f4aaf4f7a6`

## Startup and typography revision (v2.2)

The boot bitmap is the unchanged `win98-1-1.png` from GUIdebook’s `pics/gui/startupshutdown/splash/` collection (640×400), displayed at the original monitor aspect ratio, 4:3. Startup sound is the unchanged `audio/The Microsoft Sound.wav` from `https://github.com/1j01/98`; PCM, stereo, 16-bit, 22,050 Hz, 173,280 frames (7.8585 seconds). Quick Launch desktop/Internet Explorer and speaker bitmaps are the corresponding native 16px icons from that same repository.

The taskbar’s reference is the Windows 98 SE desktop capture above: 28px overall, a two-row light upper bevel, 22px buttons, 16px icons, toolbar grippers, inset clock tray, and a dithered active-task face. CSS supplies the resizing layout; it is not a screenshot stretched over interactive controls. Narrow layouts increase button height for touch.

MS W98 UI regular/bold WOFF2 files come from `https://github.com/MARTYR-X-LTD/ms-w98-ui/tree/main/Web-TT`. They convert the original MS Sans Serif typeface for browsers, with work credited to Microsoft, Lev Leontev, and martyr. The publisher README is included beside the fonts. Microsoft documents Windows 98’s default MS Sans Serif font at https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-emf/f5148c7c-30c5-4d95-bf1b-b449c1f8f53d. This replaces the earlier 98.css conversion and applies to all app text. It is not a claim of byte-identical FON files or identical GDI rasterization at every browser size.

Asset hashes:

- `win98/boot-splash.png`: `a46b6ee4014df3bb3439784a6eb667f4eeadeb38d7e0ecceaa024b9795e604f7`
- `win98/startup.wav`: `fc18b965c256f40645d903c1d66dd0e39eb9d1be4136c56bec0b0672f8ce55fb`
- `fonts/MSW98UI-Regular.woff2`: `efd1813bb6d7206127741d65355adcf7dc70bb1b2b4457f54755c5d3226c8742`
- `fonts/MSW98UI-Bold.woff2`: `5a07b7e8a9a86eca722d7283ee0d320412fe169135db6b0202d577426819b24b`

## MS-DOS Prompt and 88×31 revision (v2.3)

Reference: https://guidebookgallery.org/pics/gui/system/utilities/commandprompt/win98.png (491×308), SHA-256 `c2ff5894dcf8266b419860ce1478e796a518b866a041c274b841f22b6a640f76`.

The 16px MS-DOS icon is cropped at `(5,5,21,21)`. Seven 22×22 toolbar images come from y=27 through y=49, with x starts 104 (mark), 127 (copy), 149 (paste), 181 (full screen), 212 (properties), 235 (background), and 266 (font). These are original pixels, not generated redraws. The native control row, gray text on black, font selector and underscore caret replace the earlier green terminal panel. Linux syntax and jokes are retained by request.

The web console fonts are converted from the 6×8 and 8×12 bitmap resources in Windows 98 `DOSAPP.FON`, extracted from `WIN98_45.CAB` in the same OKPB Windows archive. DOSAPP.FON hash: `7ba4ef07b8244b46932240dc7be5b0205855d063f2e42745f78ba7bfa4b16a93`. Each set bit becomes a one-pixel square outline (100 font units per pixel), advance widths preserve native character cells, and CP437 maps the glyphs to Unicode. A few typographic punctuation characters alias their ASCII counterparts. The native font file/cabinet is not bundled; only the converted WOFF2 glyphs are served. Original glyph artwork belongs to Microsoft.

- 6×8 WOFF2: `6052822bf948beb5953dd37f814e249c83f945698f024ba1b02bc5b6ab2719cf`
- 8×12 WOFF2: `beb918554e363e91bdb9cafbb2d3f78e5689541776d89dcf900bfb296426e8a6`

Auto selects 6×8 for compact desktop windows and 8×12 for wider windows or phones. Microsoft describes DOS Auto sizing at https://devblogs.microsoft.com/oldnewthing/20241022-00/?p=110401 . Font conversion does not imply identical GDI rendering at arbitrary browser zoom/device-pixel ratios.

The site's 88×31 SVG button now contains integer-aligned pixel paths, including bitmap-letter paths for `eric.exe` and `PERSONAL PC`, with no browser-dependent SVG text. Its one-pixel border is filled geometry rather than a half-pixel stroke. CSS fixes the image at exactly 88×31 and disables flex shrinking. The desktop's former 1350px content cap has been removed.

## Full-screen startup revision (v2.3.1)

Removed the 640px splash-image cap and the reserved black margins. A viewport-sized `picture` selects `boot-splash-wide.jpg` at aspect ratios of 3:2 or wider; the original capture remains the fallback. The widescreen image covers landscape viewports without stretching. Portrait screens keep the complete original logo visible against matching blue, and startup/skip timing is unchanged.

The new file is MalekMasoud's published **Windows 98 boot screen - 16:9 widescreen** adaptation: https://www.deviantart.com/malekmasoud/art/Windows-98-boot-screen-16-9-widescreen-887340891 . Retrieved from the page's public `og:image` preview on September 8, 2026, unmodified JPEG, 1192×670. This is a credited fan adaptation, not a native Microsoft widescreen asset. SHA-256: `d454f4b1a08c9d017de73fc368959760a104a5ed3214c0885bfaece7eee8b9be`.

## Native scrollbars, caption motion and system sounds (v2.4)

Scrollbar reference: the native Windows 98 SE IE5 capture at https://guidebookgallery.org/pics/gui/applications/internet/browser/win98se.png (480×320, SHA-256 `b0fd92258f9953609fb742549c684bc6fbecbf171260f3c4cb85ffe39c0ff1d1`). The 16×16 arrow-button frame is cropped at `(458,120,474,136)`. Marlett 1.00 characters `3`, `4`, `5`, `6`, rasterized in monochrome at 12px with symbol encoding, supply left/right/up/down. Horizontal glyphs are placed at `(6,4)`, vertical glyphs at `(4,6)`. Disabled glyphs use gray with a one-pixel white shadow. The resulting disabled Up button compares exactly equal to the reference crop. Pressed glyphs shift one pixel inside a flat gray inset frame. `size-grip.png` is the unchanged `(460,302,476,318)` crop of that same screenshot.

The live scrollbar is 17px including the white client edge, with 16px arrow buttons, a two-pixel beveled proportional thumb and a two-by-two white/gray checkerboard track. A shared React component controls the real DOM/iframe scrolling surface, so wheel, touch, keyboard, track paging, hold-to-repeat arrows and thumb dragging move actual content. Native browser scrollbar furniture is hidden only on those controlled surfaces. The nested YouTube video iframe remains the video provider's own UI.

Animation evidence: ran **Windows 98 itself** in the v86 emulator at https://copy.sh/v86/?profile=windows98 and captured the 640×480 guest canvas on each animation frame. Tested Notepad's Alt+Space → Maximize, Restore and Minimize; Alt+Tab restoration; and Alt+F4 closing. The native window stays painted at its old size/position while only a caption strip moves linearly for approximately 250ms. The flying strip includes the icon and title, without the three controls or sizing frame. On completion, the window changes to its new state. Restore from the taskbar paints the full window at the end. Close is immediate, with no exit animation. This behavior agrees with Microsoft's description of `DrawAnimatedRects` / `IDANI_CAPTION`: https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-drawanimatedrects .

All eight web windows now use the same 250ms caption flight, rounded to whole CSS pixels on every frame. Maximize moves the four-pixel sizing border outside the work area: the title starts at (0,0), spans the screen and leaves the taskbar visible. Restore retains the user's drag offset. Rapid commands are serialized; desktop reset cancels pending flights; viewport/reduced-motion changes finish them immediately. `prefers-reduced-motion: reduce` skips flights. There is deliberately no fade, scaling of window contents, or added close animation. Frame scheduling, font rasterization and mobile touch sizing remain browser adaptations; this is not the native USER/GDI binary running on the page.

Sound files are unchanged Microsoft recordings from https://github.com/1j01/98/tree/master/audio . Native default mappings were checked in `mmopt.inf`, extracted from the archived Win98 SE `PRECOPY1.CAB` at https://www.okpb.cz/REG/WIN98/: SystemHand, SystemQuestion, SystemExclamation and SystemAsterisk all map to `chord.wav`; the default beep maps to `ding.wav`. The website plays CHORD for dialogs and invalid terminal commands, DING when its toy build completes, and START for IE navigation. No minimize/maximize/close sound is added to the default scheme. These are website event assignments using native recordings, not a complete Windows sound control panel.

| File                     | Duration | SHA-256                                                            |
| ------------------------ | -------- | ------------------------------------------------------------------ |
| `win98/sounds/chord.wav` | 1.099s   | `ee94302491c85b010d55c48058142420ec356467b88ec43131fc0d0b0600c259` |
| `win98/sounds/ding.wav`  | 0.916s   | `47a423798ff67d9c00f1607f470573d80653b7581475fa850a557c46b06a104a` |
| `win98/sounds/start.wav` | 0.046s   | `67969e02c5c3a8127cbafde8d205edd3067fcf35def03e2effaa00740e2ee996` |

Sounds start only in response to interaction or completion of a user-started build. Effects share the startup sound preference, stored as `eric-system-sound-v1`, and mute stops an active effect immediately. Start → Settings exposes the same toggle on phones. Failed or blocked media playback never queues sounds for later replay or interrupts the page.
