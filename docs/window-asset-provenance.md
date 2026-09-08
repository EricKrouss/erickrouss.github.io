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
