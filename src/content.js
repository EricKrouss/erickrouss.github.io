// The personal bits live here. No database, no CMS, just a text editor.
export const site = {
  name: "Eric Krouss",
  version: "2.0.0",
  updated: "2026-09-08",
  email: "eric@krouss.net",
  github: "https://github.com/EricKrouss",
  bluesky: "https://bsky.app/profile/krouss.net",
  os: "CachyOS / Linux",
};
export const projects = [
  {
    name: "Minecraft workshop",
    type: "JAVA",
    icon: "block",
    description:
      "Client & server tinkering. Old-school feel, new things under the hood.",
    target: "minecraft",
    tag: "ON THE WORKBENCH",
  },
  {
    name: "2007 YouTube player",
    type: "HTML / JS",
    icon: "play",
    description:
      "A little piece of the old internet, rebuilt for today’s browser.",
    href: "https://erickrouss.github.io/2007-YouTube-Player-HTML5/",
    source: "https://github.com/EricKrouss/2007-YouTube-Player-HTML5",
  },
  {
    name: "Bluesky Flex",
    type: "REACT",
    icon: "network",
    description:
      "Explore the most-followed people and most-liked posts on Bluesky.",
    href: "https://erickrouss.github.io/Bluesky-Flex/",
    source: "https://github.com/EricKrouss/Bluesky-Flex",
  },
  {
    name: "Bluesky Shield",
    type: "PYTHON / JS",
    icon: "shield",
    description: "Tools for creating and managing Bluesky block lists.",
    href: "https://github.com/EricKrouss/Bluesky-Shield",
  },
];
export const links = [
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
