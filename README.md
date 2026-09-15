# Eric’s personal computer

A personal homepage built with React and Vite. Eight desktop programs, archived Windows 98 bitmaps, a toy shell, and exactly zero runtime services. The previous compiled site has been replaced by editable source. The public site is hosted at [erickrouss.github.io](https://erickrouss.github.io/). The separate private Sites preview is managed independently.

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
- `src/InternetExplorer.jsx` / `src/ie5.css`: IE5 browser shell, address bar, original Windows 98 SE toolbar graphics and local iframe. Narrow screens put the remaining toolbar commands in the chevron menu.
- `src/dos.css`: original Windows 98 terminal bitmap fonts, console geometry and toolbar.
- `public/2007-youtube/watch-community.js`: fictional comment pools, ratings, replies and per-video browser storage.
- `public/2007-youtube/watch.html` / `watch-2007.css`: watch page based on the August 24, 2007 archive; player code is adapted from Eric’s original project.
- `src/Art.jsx`: mappings for archived Windows 98 icons and sourced artwork.
- `src/StartMenu.jsx`: the Windows 98 menu and keyboard navigation.
- `src/Startup.jsx`: click-to-power-on startup, original WAV playback, staged desktop reveal and silent skip.
- `src/windows98.css`: shell colors, original bitmap controls, taskbar metrics and the locally hosted MS Sans Serif conversion.
- `public/asset-credits.html`: sources, ownership notices and asset sources, extraction details and font publisher credits.
- `src/styles.css`: shared window chrome, palette, desktop arrangement and responsive layouts.
- `public/button.svg`: the original 88×31 site button; `public/favicon.svg`: the matching favicon.

The hardware shown was read from Eric’s computer on September 8, 2026. RAM is usable memory reported by Linux, not an assumed installed capacity. Storage totals the three SSDs (4 TB + 1 TB + 4 TB). No device identifiers, serial numbers or telemetry are collected or included.

The status text is manually edited. The visitor count and build system are explicitly decorative. Terminal commands run only the small built-in command handlers; there is no shell execution, server or data collection. Windows icons, the Start flag and sidebar, and two 88×31 buttons are sourced from archives; Minecraft uses the original grass-block launcher bitmap preserved by mclaunch; Eric’s original photo and Minecraft Oldschool Edition artwork replace the generated illustrations. The desktop uses no icon package. The optional YouTube window loads video thumbnails and, after a video is selected, YouTube’s iframe API; its bundled Numa Numa demo and interface assets are local. See the asset credits page for sources and ownership notices.

Minecraft Oldschool Edition’s description is based on its [official site](https://minecraftoldschool.com/) and [published 1.8 release](https://github.com/MinecraftOldschoolEdition/downloads/releases/tag/1.8). It describes a Beta 1.7.3 overhaul, its classic world generators and expanded Sky Dimension, optional Vulkan/FSR rendering, controls/accessibility, proximity voice, and matching client/server distribution. Personal links include Eric’s supplied Ko-fi account, `https://ko-fi.com/ericwaffles`.

The desktop uses MS W98 UI, a web conversion of the original Windows 98 MS Sans Serif typeface. The legacy Windows FON file is not directly browser-compatible, and browser scaling/rasterization can differ from native Windows rendering. Font sources and contributors are documented in the asset credits.

## Desktop controls

Click the title bar or content to focus a window. Drag its title bar on a desktop with a mouse. Each title bar has working minimize, maximize/restore, and close buttons using original Windows 98 bitmap controls. The 16×14 button pixels and caption-gradient strips were extracted from archived Windows 98 screenshots; Restore uses the original Marlett 1.00 system font. Desktop title bars use the native 18-pixel height, while phone controls scale by exactly 2×. Double-click a title bar to maximize or restore. Clicking the active taskbar button minimizes its window; other task buttons focus or restore their windows. Quick Launch includes Show Desktop (toggle all current windows) and Internet Explorer (opens the local 2007 YouTube watch page). The speaker button mutes or enables startup audio. Minimized programs return through the taskbar; closed programs can be reopened through their permanent desktop shortcut or Start menu. All nine program shortcuts remain visible on desktop and mobile. The desktop uses original Windows 98 teal (`#008080`). “Tidy desktop” restores the seven homepage windows, closes IE and Blog Express, and resets window positions. On narrow screens, windows remain in normal document flow and dragging is disabled.

Use `help` in the terminal for available commands. Arrow Up/Down recalls command history. `open minecraft`, `specs`, `fortune`, `ver`, `pacman`, `cowsay`, `sudo` and `xyzzy` are worth trying. `wallpaper` reports the current desktop color. The Konami sequence is another secret. Escape closes the Start menu and dialogs. Animations respect reduced-motion settings. The original Windows 98 startup recording plays only after clicking Power on with sound checked; Skip startup in the welcome dialog is silent. After Power on, the controls disappear and startup finishes automatically; progress remains available to screen readers. The startup poster fills the landscape viewport, with a sourced 16:9 version on widescreen displays and the original capture on classic displays. Portrait phones keep the whole logo visible against a matching blue background. Startup reveals the shell, shortcuts and windows in discrete stages. Reduced motion removes the staged reveal. A tab remembers that startup has finished in sessionStorage, so reloading is immediate. Start → Settings → Replay startup returns to the power-on screen. No audio plays before an explicit gesture. The bundled player opens paused; selecting an external video loads YouTube.

## YouTube window

Internet Explorer opens `http://youtube.com` in its simulated address bar; the actual page is local `/2007-youtube/watch.html`. It preserves Eric’s HTML5 Flash-player recreation and uses an August 24, 2007 Numa Numa watch-page archive for the masthead, 450×370 player box, native star images, action rows and comment geometry. See `docs/youtube-2007-provenance.md`. This is a recreation, not Microsoft or YouTube software running natively.

Numa Numa starts paused and has its own fictional comments. Other video URLs select a deterministic mix of general fictional comments. Ratings, up/down votes, favorites, subscriptions and typed replies are local to each video and browser. No account or comment backend is used. Modern YouTube no longer has five-star ratings; these votes do not affect YouTube. External playback can be restricted by YouTube, and metadata may be unavailable; the page provides a direct video link on playback failure. The Windows shell keeps MS Sans Serif, the DOS console uses converted original DOSAPP.FON bitmap glyphs, and the watch page keeps period Arial.

## GitHub Pages

The included `.github/workflows/deploy.yml` builds on `main` and deploys `dist/` through GitHub Actions. The repository’s Pages build source is **GitHub Actions**. Nothing needs to be built or copied into the repository root. Subproject links still point to Eric’s existing project sites.

Pushing to `main` publishes the website through this workflow. The optional private Sites preview configuration is in `.openai/hosting.json`; GitHub Pages does not use it.

## Blog Express

Open **Blog** from the desktop, Start → Programs, or `open blog` in the terminal. The Outlook Express-inspired reader has searchable/sortable articles, category folders, saved articles, local read history, and permanent article URLs. Drag its bottom-right grip to resize it; a focused grip also accepts arrow keys. Maximize/restore preserves the chosen dimensions. Tidy desktop resets its size and closes the blog.

Edit `src/blogPosts.js` to add posts. Use a unique, stable lowercase slug; the build creates `/blog/<slug>/index.html` so direct links work on GitHub Pages. Body blocks contain an optional `heading` and plain-text `paragraphs`. Set `publishedAt` to an ISO timestamp if more precision than the date is needed, and `updatedAt` when editing a published article. The initial Welcome article contains exactly: “This is where my blogs will be”.

### Standard.site publishing

Every build emits a `site.standard.document` JSON export per article in `/standard-site/`, plus publication metadata. These exports alone do **not** publish records to AT Protocol. The integration follows [Standard.site’s quick start](https://standard.site/docs/quick-start/) and [verification requirements](https://standard.site/docs/verification/).

- `npm run blog:preview-records` previews publication and article records without authentication or writes.
- Configure GitHub Actions secrets `ATPROTO_IDENTIFIER` (your handle or DID) and `ATPROTO_APP_PASSWORD` (an app password for that account). For a PDS other than `https://bsky.social`, set the repository variable `ATPROTO_PDS` to its HTTPS origin. No credentials go in source files or `VITE_*` variables.
- The Pages workflow then publishes/updates the publication and each article before building. Stable record keys prevent duplicate articles. A conflicting record from another site stops the run.
- To publish locally, set those same environment variables and run `npm run blog:publish`, then `npm run build`. The publisher writes only public AT-URIs to `standard-site-records.json`; retain that file for builds outside CI.
- After authenticated publishing, the build emits `/.well-known/site.standard.publication` and the article’s `rel="site.standard.document"` link in its static HTML. Deploy `dist/` to complete website verification. Failed publication/build/deployment may leave records unverified until the next successful deployment.
- The publisher does not create Bluesky feed posts or delete records for removed articles.

Validation: `node --test scripts/standard-site.test.mjs` covers exact article content, repeat publication, record conflicts, verification pages and missing credentials. Tests use a simulated PDS; live publishing requires the account secrets above.
