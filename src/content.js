// The personal bits live here. No database, no CMS, just a text editor.
export const site = {
  name: "Eric Krouss",
  version: "2.3.2",
  updated: "2026-09-08",
  email: "eric@krouss.net",
  github: "https://github.com/EricKrouss",
  bluesky: "https://bsky.app/profile/krouss.net",
  os: "CachyOS / Linux",
  kofi: "https://ko-fi.com/ericwaffles",
};
export const projects = [
  {
    name: "Minecraft Oldschool Edition",
    type: "JAVA",
    icon: "block",
    description:
      "A Beta 1.7.3 overhaul with classic worlds, expanded content and modern improvements.",
    target: "minecraft",
    tag: "BETA 1.7.3 MOD",
  },
  {
    name: "2007 YouTube player",
    type: "HTML / JS",
    icon: "youtube",
    description:
      "A little piece of the old internet, rebuilt for today’s browser.",
    href: "https://erickrouss.github.io/2007-YouTube-Player-HTML5/",
    source: "https://github.com/EricKrouss/2007-YouTube-Player-HTML5",
  },
];
export const links = [
  {
    title: "KO-FI",
    subtitle: "fuel the tinkering",
    href: site.kofi,
    style: "kofi",
    icon: "♥",
  },
  {
    title: "ARCH WIKI",
    subtitle: "read the manual",
    href: "https://wiki.archlinux.org/",
    style: "arch",
    icon: "▲",
  },
  {
    title: "NEOCITIES",
    subtitle: "the web is yours",
    href: "https://neocities.org/",
    style: "neocities",
    icon: "✦",
  },
  {
    title: "INTERNET",
    subtitle: "ARCHIVE",
    href: "https://archive.org/",
    style: "archive",
    icon: "▥",
  },
  {
    title: "GITHUB",
    subtitle: "view the source",
    href: site.github,
    style: "github",
    icon: "{}",
  },
  {
    title: "MDN WEB",
    subtitle: "keep building",
    href: "https://developer.mozilla.org/",
    style: "mdn",
    icon: "</>",
  },
  {
    title: "CACHY OS",
    subtitle: "linux, tuned up",
    href: "https://cachyos.org/",
    style: "cachy",
    icon: "C",
  },
];
export const hardware = [
  ["OS", "CachyOS"],
  ["CPU", "Ryzen 7 9800X3D"],
  ["GPU", "GeForce RTX 5080"],
  ["RAM", "60 GiB usable"],
  ["DISK", "9 TB SSD / 3 drives"],
];

// Verified against minecraftoldschool.com and the published 1.8 release notes.
export const minecraft = {
  name: "Minecraft Oldschool Edition",
  description:
    "A large-scale mod built on Minecraft Beta 1.7.3. It preserves early Minecraft’s terrain, pacing and atmosphere while adding new content and modern improvements.",
  features: [
    "Indev and Infdev world generators, plus an expanded Sky Dimension",
    "OpenGL or optional Vulkan rendering with FSR 3.1 upscaling",
    "Controller support, accessibility options and proximity voice chat",
  ],
  distribution:
    "A Prism Launcher client and a matching UberBukkit-based server.",
  website: "https://minecraftoldschool.com/",
  releases: "https://github.com/MinecraftOldschoolEdition/downloads/releases",
};
