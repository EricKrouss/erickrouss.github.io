# YouTube / IE6 revision (v2.3)

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

## IE6 shell

Microsoft's own IE6 toolbar reference documents the menu, standard button, address and optional Links rebar bands:
https://learn.microsoft.com/en-us/windows/win32/controls/cc-faq-ietoolbar

The PNG toolbar icons are unchanged preserved assets from:
https://github.com/ShizukuIchi/winXP/tree/master/src/assets/windowsIcons

Mappings: Back/back.png, Forward/forward.png, Stop/stop.png, Refresh/refresh.png, Home/home.png, Search/299(32x32).png, Favorites/744(32x32).png, History/history.png, Mail/mail.png, Print/17(32x32).png, Go/290.png, brand/windows.png, page/ie-paper.png, Internet/earth.png. Microsoft retains ownership of its artwork. The outer frame reuses the site's original Windows 98 title-bar bitmaps.

The IE window is a browser recreation with working local menus, focus, dragging, minimizing, maximizing, close and refresh. `http://youtube.com` is a simulated address; content is a local iframe. It does not pretend to be native Microsoft software or send visitors through an insecure HTTP connection.
