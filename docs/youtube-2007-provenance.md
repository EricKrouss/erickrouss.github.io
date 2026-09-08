# YouTube watch page (v2.3) and IE5 shell (v2.3.2)

## Reference date

The target is the **August 24, 2007** Numa Numa watch page, not a blend of several YouTube eras:

https://web.archive.org/web/20070824085445id_/http://www.youtube.com/watch?v=KmtzQCSh6xk

Retrieved September 8, 2026. The Wayback response has `memento-datetime: Fri, 24 Aug 2007 08:54:45 GMT`. Its original HTML references `base_yts1187860626.css` and `watch_yts1187912981.css`. The local stylesheet retains the masthead selectors/geometry and adapts the original watch/comment rules to semantic controls. The archive specifies a 875px page, 450×370 SWF player, 300px metadata column with a 15px gap, 19×20 stars, and 19×19 comment voting icons. The unused right advertisement rail is intentionally omitted. Narrow viewports reflow instead of retaining the archive's horizontal overflow.

YouTube's contemporary announcement confirms the positive/negative comment votes and score threshold filter:
https://blog.youtube/news-and-events/site-update-822/

## Local player

Eric's original project is https://github.com/EricKrouss/2007-YouTube-Player-HTML5 . The vendored source was retrieved at commit `b36198a68c27f1ee7a4513d26c80b82630e64680`. Player assets, Numa Numa MP4, fonts and control code are preserved in `public/2007-youtube/`. The player is HTML5; no Flash runtime is required. The poster/related Numa thumbnail is a frame extracted at 12 seconds from that same bundled video, not generated artwork.

Local integration changes: paused initial playback, one search handler, bounded API loading, playback-failure link, stale-request guards, archive-correct player dimensions, responsive adaptation, and a parent-window pause/focus message bridge. The watch page and metadata module were rebuilt around the archived geometry. YouTube may restrict individual external videos. Live metadata uses YouTube oEmbed and optional Piped stream information; neither supplies the fictional comment thread or five-star scores. No API key is bundled.

## Archived graphics

`public/2007-youtube/assets/archive-2007/` contains unchanged archive files. Retrieval URLs use the prefix `https://web.archive.org/web/20070824im_/http://www.youtube.com/img/`; captures resolve to August 24–25, 2007:

- `tab_nav.gif`, `tab_nav_sel.gif`
- `pic_upload_bug_22x23.gif`
- `icn_star_full_19x20.png`, `icn_star_empty_19x20.png`
- `icn_comments_up_19x19.gif`, `icn_comments_down_19x19.gif`
- `btn_exploretab_related_300x34.gif`, `btn_exploretab_morefromuser_300x34.gif`, `btn_exploretab_playlist_300x34.gif`
- `pic_badge_director_90x18.gif`
- `en_US.gif` (archive path `flags/en_US.gif`; this is the global-site globe)

The logo, gray search-bar graphic, action-row icons and Flash control artwork come from Eric's player repository. YouTube marks/artwork remain Google's. Related-video thumbnails for other videos are served by YouTube's `i.ytimg.com`.

## Fictional community

The user explicitly requested humorous comments by fake viewers. Numa Numa uses eight specific jokes plus eight general ones. Other video IDs deterministically select 16 general comments from an editable pool. LocalStorage is namespaced per video. Ratings, votes, replies, favorites and subscriptions never post to YouTube or a public service. The page labels these as fictional/local. Numa's initial views, ratings and favorites are the archive snapshot values, not current totals. Its comment count matches the fictional thread. Modern likes/dislikes are never relabeled as five-star ratings.

## IE5 shell

The current target is Internet Explorer 5 on Windows 98 SE. Its reference capture is:
https://guidebookgallery.org/pics/gui/applications/internet/browser/win98se.png

The standard toolbar has 20×20 icons with labels underneath, 50px buttons (64px with a dropdown arrow), a 42px band, and a black Windows-logo box. The menu and address bands are 24px and 26px. Narrow screens retain those icon pixels and place excess commands in a chevron menu. The address still shows `http://youtube.com` and loads Eric's local watch page.

The icon pixels come from Microsoft's **BROWSEUI.DLL 5.0.2614.3500**, extracted without executing it from `WIN98_26.CAB` at https://www.okpb.cz/REG/WIN98/ . Resource bitmap 265 holds the 20px normal images; 266 holds their original color hover states. Cell indices: Back 0, Forward 1, Stop 2, Refresh 3, Home 4, Search 5, Favorites 6, Print 7, History 12, Mail 13. Magenta (`#ff00ff`) is the native transparent color key and becomes PNG alpha; all remaining RGB pixels are preserved. Go uses 18×16 resources 290/291. The black-box Windows flag is the first 22×22 frame of resource 306. Only PNGs are shipped, not Microsoft DLLs or cabinets. These replace the previous IE6/XP asset set entirely.

Other unmodified RGB crops from the reference screenshot (left, top, right/bottom exclusive):

| Local asset | Crop |
| --- | --- |
| Forward, disabled | 94, 52, 114, 72 |
| Address page | 59, 94, 75, 110 |
| Status page | 6, 300, 22, 316 |
| Internet zone | 315, 300, 331, 316 |
| Overflow chevron | 463, 53, 473, 60 |

The disabled Back arrow mirrors the captured disabled Forward arrow. Both navigation directions are disabled because this simulated browser has one page. The six normal DLL icons for Stop, Refresh, Home, Search, Favorites and History compare pixel-for-pixel equal to the reference screenshot at (156,52), (206,52), (256,52), (312,52), (362,52), and (412,52), respectively, when composited on `#c0c0c0`.

Source SHA-256:

- `WIN98_26.CAB`: `5f2922c84af3b04e0e60bd6d3dbb54887e327ef732b23e10b5c36ade002791c9`
- `BROWSEUI.DLL`: `bc1624637e972d3e7313d3fefb8b509cfe5b32853308cb82394acaec978d341f`
- IE5 reference PNG: `b0fd92258f9953609fb742549c684bc6fbecbf171260f3c4cb85ffe39c0ff1d1`

Microsoft retains ownership of its artwork. The outer frame reuses the site's original Windows 98 title-bar bitmaps. The UI remains React/CSS, with browser text rendering rather than native GDI.

The IE window is a browser recreation with working local menus, focus, dragging, minimizing, maximizing, close and refresh. `http://youtube.com` is a simulated address; content is a local iframe. It does not pretend to be native Microsoft software or send visitors through an insecure HTTP connection.
