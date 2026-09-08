import React, { useEffect, useRef, useState } from "react";
import { site, projects, links, hardware } from "./content.js";
import { Icon, PixelComputer, BlockLandscape } from "./Art.jsx";

const programs = [
  ["eric", "computer"],
  ["projects", "folder"],
  ["minecraft", "block"],
  ["computer", "gear"],
  ["links", "network"],
  ["status", "disk"],
  ["terminal", "terminal"],
];
const programNames = programs.map(([name]) => name);
const initialLines = [
  { text: "EricOS [Version 2.0.0]", type: "bright" },
  { text: "A tiny shell. An unreasonable amount of potential." },
  { text: "Type “help” to have a look around." },
];

function OutsideLink({ children, href, ...props }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" {...props}>
      {children}
    </a>
  );
}
function Led({ amber = false }) {
  return <span className={`led ${amber ? "amber" : ""}`} aria-hidden="true" />;
}

function Window({
  id,
  title,
  icon,
  children,
  footer,
  active,
  hidden,
  onFocus,
  onMinimize,
  offset,
  onMove,
  className = "",
}) {
  const drag = useRef(null);
  const startDrag = (e) => {
    if (
      e.target.closest("button") ||
      e.button !== 0 ||
      e.pointerType === "touch" ||
      !matchMedia("(min-width: 1050px)").matches
    )
      return;
    const rect = e.currentTarget.closest("section").getBoundingClientRect();
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      origin: offset,
      rect,
      maxY: document.documentElement.scrollHeight - rect.bottom,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const moveDrag = (e) => {
    if (!drag.current) return;
    const d = drag.current;
    const dx = Math.max(
      -d.rect.left + 8,
      Math.min(
        document.documentElement.clientWidth - d.rect.right - 8,
        e.clientX - d.x,
      ),
    );
    const dy = Math.max(
      -d.rect.top + 8,
      Math.min(d.maxY - 48, e.clientY - d.y),
    );
    onMove(id, { x: d.origin.x + dx, y: d.origin.y + dy });
  };
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      tabIndex="-1"
      hidden={hidden}
      className={`window ${active ? "active" : ""} ${className}`}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        zIndex: active ? 20 : 1,
      }}
      onPointerDown={() => onFocus(id)}
      onFocus={() => onFocus(id)}
    >
      <div
        className="title-bar"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <Icon name={icon} size={17} />
        <h2 id={`${id}-title`}>{title || `${id}.exe`}</h2>
        <span className="title-grip" />
        <button
          className="window-control"
          aria-label={`Minimize ${id}.exe`}
          title="Minimize — restore from the dock"
          onClick={() => onMinimize(id)}
        >
          _
        </button>
      </div>
      <div className="window-content">{children}</div>
      {footer && (
        <div className="window-footer">
          {footer}
          <span className="resize-grip" aria-hidden="true">
            ◢
          </span>
        </div>
      )}
    </section>
  );
}

function Terminal({ openProgram, changeWallpaper, resetDesktop, onSecret }) {
  const [lines, setLines] = useState(initialLines);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const output = useRef(null);
  useEffect(() => {
    output.current.scrollTop = output.current.scrollHeight;
  }, [lines]);
  const execute = (e) => {
    e.preventDefault();
    const raw = input.trim();
    if (!raw) return;
    const [command, ...args] = raw.toLowerCase().split(/\s+/);
    let answer;
    if (command === "clear") {
      setLines([]);
      setInput("");
      return;
    }
    if (command === "help")
      answer =
        "help · about · ls · open [name] · specs · date\nping · fortune · wallpaper · reset · clear\nTry: open minecraft. There may be a few secrets.";
    else if (command === "about" || command === "whoami")
      answer =
        "eric — computer person, Linux user, code tinkerer.\nUsually somewhere between a terminal and a block game.";
    else if (command === "ls")
      answer = programNames.map((n) => `${n}.exe`).join("  ");
    else if (command === "open") {
      const name = args[0]?.replace(".exe", "");
      if (programNames.includes(name)) {
        openProgram(name);
        answer = `Launching ${name}.exe… OK`;
      } else
        answer =
          "Usage: open [eric|projects|minecraft|computer|links|status|terminal]";
    } else if (command === "specs" || command === "neofetch")
      answer = hardware.map(([k, v]) => `${k.padEnd(5)} ${v}`).join("\n");
    else if (command === "date") answer = new Date().toLocaleString();
    else if (command === "ping")
      answer =
        "PING imagination.local (127.0.0.1)\n64 bytes: time=<1ms  TTL=nostalgia\nSimulated connection: looking good.";
    else if (command === "fortune")
      answer = [
        "There is no cloud. Just someone else’s computer.",
        "Your next bug fix is hiding behind a good night’s sleep.",
        "You can close the wiki tabs. You will open them again.",
        "The best part of the internet is still the people.",
      ][Math.floor(Math.random() * 4)];
    else if (command === "wallpaper") {
      changeWallpaper();
      answer = "Wallpaper changed. Same computer, different mood.";
    } else if (command === "reset") {
      resetDesktop();
      answer =
        "Desktop tidied. Tabs in your actual browser: still your problem.";
    } else if (command === "sudo")
      answer =
        "eric is not in the mood to read the sudoers file.\nThis incident will be politely ignored.";
    else if (command === "rm")
      answer = "Nice try. The recycle bin has unionized.";
    else if (command === "xyzzy") {
      onSecret();
      answer = "A hollow voice says: “You found the good internet.”";
    } else if (command === "cowsay")
      answer =
        "  ____________________\n< keep the web weird! >\n  --------------------\n         \\   ^__^\n          \\  (oo)\\_______\n             (__)\\       )\\/\\\n                 ||----w |\n                 ||     ||";
    else
      answer = `Command not found: ${command}\nType help for the little list of things I understand.`;
    setLines((old) =>
      [
        ...old,
        { text: `eric@home:~$ ${raw}`, type: "bright" },
        { text: answer },
      ].slice(-70),
    );
    setHistory((old) => [...old, raw]);
    setHistoryIndex(history.length + 1);
    setInput("");
  };
  const recall = (e) => {
    if (!["ArrowUp", "ArrowDown"].includes(e.key)) return;
    e.preventDefault();
    const next = Math.max(
      0,
      Math.min(history.length, historyIndex + (e.key === "ArrowUp" ? -1 : 1)),
    );
    setHistoryIndex(next);
    setInput(history[next] || "");
  };
  return (
    <div className="terminal-shell">
      <div
        className="terminal-output"
        ref={output}
        role="log"
        tabIndex="0"
        aria-label="Terminal output"
        aria-live="polite"
      >
        {lines.map((line, i) => (
          <div key={i} className={line.type || ""}>
            {line.text}
          </div>
        ))}
      </div>
      <form onSubmit={execute} className="terminal-input">
        <label htmlFor="command">eric@home:~$</label>
        <input
          id="command"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={recall}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          aria-label="Terminal command"
        />
        <button
          type="submit"
          aria-label="Run terminal command"
          title="Run command"
        >
          ↵
        </button>
      </form>
    </div>
  );
}

export default function App() {
  const [active, setActive] = useState("eric");
  const [minimized, setMinimized] = useState([]);
  const [offsets, setOffsets] = useState({});
  const [menu, setMenu] = useState(false);
  const [wallpaper, setWallpaper] = useState(false);
  const [time, setTime] = useState(new Date());
  const [notice, setNotice] = useState(null);
  const [build, setBuild] = useState(34);
  const [buildRunning, setBuildRunning] = useState(false);
  const [recycled, setRecycled] = useState(false);
  const [copied, setCopied] = useState(false);
  const dialog = useRef(null);
  const menuRef = useRef(null);
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 30000);
    const resize = () => setOffsets({});
    window.addEventListener("resize", resize);
    return () => {
      clearInterval(timer);
      window.removeEventListener("resize", resize);
    };
  }, []);
  useEffect(() => {
    if (!buildRunning) return;
    const timer = setInterval(
      () =>
        setBuild((old) => {
          const next = Math.min(100, old + 10);
          return next;
        }),
      220,
    );
    return () => clearInterval(timer);
  }, [buildRunning]);
  useEffect(() => {
    if (build === 100) setBuildRunning(false);
  }, [build]);
  useEffect(() => {
    if (notice && !dialog.current.open) dialog.current.showModal();
  }, [notice]);
  useEffect(() => {
    const closeMenu = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenu(false);
    };
    const escape = (e) => {
      if (e.key === "Escape") setMenu(false);
    };
    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  useEffect(() => {
    let sequence = [];
    const secret = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      sequence = [...sequence, e.key].slice(-10);
      if (
        sequence.join(",") ===
        "ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a"
      )
        setNotice(
          "Cheat code accepted. You now have unlimited curiosity. Use it irresponsibly.",
        );
    };
    window.addEventListener("keydown", secret);
    return () => window.removeEventListener("keydown", secret);
  }, []);
  const openProgram = (id) => {
    setMinimized((old) => old.filter((n) => n !== id));
    setActive(id);
    setMenu(false);
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "nearest",
      });
    });
  };
  const resetDesktop = () => {
    setOffsets({});
    setMinimized([]);
    setActive("eric");
    setMenu(false);
  };
  const frame = (id) => ({
    id,
    icon: programs.find((p) => p[0] === id)[1],
    active: active === id,
    hidden: minimized.includes(id),
    onFocus: setActive,
    onMinimize: (n) => {
      setMinimized((old) => [...old, n]);
      requestAnimationFrame(() =>
        document.querySelector(`[data-program="${n}"]`)?.focus(),
      );
    },
    offset: offsets[id] || { x: 0, y: 0 },
    onMove: (n, pos) => setOffsets((old) => ({ ...old, [n]: pos })),
  });
  const copyButton = async () => {
    const code =
      '<a href="https://erickrouss.github.io/"><img src="https://erickrouss.github.io/button.svg" width="88" height="31" alt="Eric’s personal computer"></a>';
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      setNotice(code);
    }
  };
  return (
    <div className={`desktop ${wallpaper ? "alternate-wallpaper" : ""}`}>
      <a className="skip-link" href="#eric" onClick={() => openProgram("eric")}>
        Skip to Eric’s homepage
      </a>
      <header className="desktop-top">
        <span>
          <Led /> ERIC'S PERSONAL COMPUTER
        </span>
        <span>
          NO CLOUD REQUIRED <span className="top-star">✦</span> EST. ON THE
          INTERNET
        </span>
      </header>
      <div className="desktop-workspace">
        <nav className="desktop-icons" aria-label="Desktop shortcuts">
          {programs
            .filter(([n]) => !["links", "status"].includes(n))
            .map(([name, icon]) => (
              <button
                key={name}
                onClick={() => openProgram(name)}
                title={`Open ${name}.exe`}
              >
                <Icon name={icon} size={34} />
                <span>
                  {name === "eric"
                    ? "My computer"
                    : name.charAt(0).toUpperCase() + name.slice(1)}
                </span>
              </button>
            ))}
          <button
            onClick={() => {
              setRecycled(true);
              setNotice(
                "Recycle Bin: 3 items\n\nfinal_final_v2.zip\nnew-website-idea-47.txt\nInternet Explorer\n\nSome things are better left here.",
              );
            }}
            title="One person’s trash…"
          >
            <Icon name="trash" size={33} />
            <span>Recycle Bin</span>
            {recycled && <small>inspected ✓</small>}
          </button>
          <div className="dock-note">
            100%
            <br />
            home
            <br />
            cooked<span>↗</span>
          </div>
        </nav>
        <main className="site-surface" id="desktop">
          <header className="masthead">
            <div className="masthead-chrome">
              <span>
                <Icon name="network" size={15} /> erickrouss.github.io —
                personal homepage
              </span>
              <span>
                http:// <b>home sweet home</b>
              </span>
            </div>
            <div className="masthead-main">
              <div>
                <div className="eyebrow">YOU HAVE REACHED</div>
                <h1>
                  eric’s corner
                  <span>
                    of the internet<span className="text-cursor">_</span>
                  </span>
                </h1>
                <p>Computers, code &amp; other things I probably took apart.</p>
              </div>
              <div className="masthead-stickers">
                <span className="round-sticker">
                  PERSONAL
                  <br />
                  WEBSITE
                  <br />
                  <b>★ ★ ★</b>
                </span>
                <span className="version-sticker">
                  NO ADS.
                  <br />
                  JUST ME.
                </span>
              </div>
              <PixelComputer />
            </div>
            <div className="welcome-strip">
              <span className="strip-label">MOTD</span>
              <span>
                Welcome, fellow internet traveler. Make yourself at ~/home.
              </span>
              <span className="strip-right">
                ★ best explored with curiosity
              </span>
            </div>
          </header>
          <div className="desktop-hint">
            <span>
              <span className="tiny-cross">✣</span> Click around. Drag a title
              bar. Stay a while.
            </span>
            <button onClick={resetDesktop}>[ tidy desktop ]</button>
          </div>
          <div className="window-grid">
            <div className="window-column left-column">
              <Window
                {...frame("eric")}
                footer={
                  <>
                    <Led /> user profile loaded{" "}
                    <span className="footer-right">hello, world.</span>
                  </>
                }
              >
                <div className="profile-top">
                  <div className="avatar">
                    <PixelComputer small />
                    <span>LOCAL USER</span>
                  </div>
                  <div>
                    <div className="eyebrow">README.TXT</div>
                    <h3>
                      Hey, I’m Eric<span className="hand-star">✳</span>
                    </h3>
                    <p className="profile-subtitle">
                      Computer person. Perpetual tinkerer.
                    </p>
                    <div className="tag-row">
                      <span>LINUX</span>
                      <span>CODE</span>
                      <span>BLOCKS</span>
                    </div>
                  </div>
                </div>
                <p>
                  Welcome to my little directory on the internet. I like
                  figuring out how computers work, then changing things until
                  they work <em>slightly differently.</em>
                </p>
                <p>
                  Usually messing with Linux, writing code, poking at networks,
                  or getting sidetracked by Minecraft internals.
                </p>
                <div className="profile-links">
                  <OutsideLink href={site.github}>GitHub ↗</OutsideLink>
                  <OutsideLink href={site.bluesky}>Bluesky ↗</OutsideLink>
                  <a href={`mailto:${site.email}`}>Send a packet ✉</a>
                </div>
                <div className="handwritten">
                  a website should feel like someone lives here.
                </div>
              </Window>
              <Window
                {...frame("projects")}
                footer={
                  <>
                    <span>4 items</span>
                    <OutsideLink className="footer-right" href={site.github}>
                      browse all repositories ↗
                    </OutsideLink>
                  </>
                }
              >
                <div className="file-toolbar">
                  <span>File</span>
                  <span>Edit</span>
                  <span>View</span>
                  <span className="path">~/things-i-made/</span>
                </div>
                <div className="project-list">
                  {projects.map((project) => (
                    <article className="project" key={project.name}>
                      <Icon name={project.icon} size={26} />
                      <div>
                        <div className="project-name">
                          {project.target ? (
                            <button
                              className="text-link"
                              onClick={() => openProgram(project.target)}
                            >
                              {project.name}
                            </button>
                          ) : (
                            <OutsideLink href={project.href}>
                              {project.name} ↗
                            </OutsideLink>
                          )}
                          <span>{project.type}</span>
                        </div>
                        <p>{project.description}</p>
                        {project.tag ? (
                          <span className="project-tag">
                            <Led amber />
                            {project.tag}
                          </span>
                        ) : (
                          project.source && (
                            <OutsideLink
                              className="source-link"
                              href={project.source}
                            >
                              source code ↗
                            </OutsideLink>
                          )
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </Window>
            </div>
            <div className="window-column middle-column">
              <Window
                {...frame("minecraft")}
                footer={
                  <>
                    <Icon name="block" size={13} /> one more block before bed…
                  </>
                }
              >
                <div className="landscape-wrap">
                  <BlockLandscape />
                  <span className="landscape-caption">
                    THE BLOCK DEPARTMENT
                  </span>
                  <span className="build-label">JAVA EDITION</span>
                </div>
                <div className="minecraft-copy">
                  <h3>Same blocks. Different bits.</h3>
                  <p>
                    A place for my Minecraft experiments: client tweaks, server
                    work, modding, and an unreasonable interest in how it all
                    fits together.
                  </p>
                  <div className="workshop-list">
                    <div>
                      <span>01</span> Client &amp; rendering experiments
                    </div>
                    <div>
                      <span>02</span> Server &amp; networking tinkering
                    </div>
                    <div>
                      <span>03</span> A soft spot for the old versions
                    </div>
                  </div>
                  <div className="build-status">
                    <span>
                      <Led amber />{" "}
                      {buildRunning
                        ? "Compiling a little nostalgia…"
                        : build === 100
                          ? "BUILD SUCCESSFUL. Go touch grass."
                          : "The workbench is never really empty."}
                    </span>
                    <div className="build-bottom">
                      <div
                        className="progress-track"
                        role="progressbar"
                        aria-label="Simulated Minecraft build"
                        aria-valuemin="0"
                        aria-valuemax="100"
                        aria-valuenow={build}
                      >
                        <div style={{ width: `${build}%` }} />
                      </div>
                      <button
                        onClick={() => {
                          setBuild(0);
                          setBuildRunning(true);
                        }}
                        disabled={buildRunning}
                        title="Run a pretend build"
                      >
                        {buildRunning
                          ? `${build}%`
                          : build === 100
                            ? "again?"
                            : "build ▶"}
                      </button>
                    </div>
                    <small>toy build system · no actual blocks compiled</small>
                  </div>
                </div>
              </Window>
              <Window
                {...frame("terminal")}
                footer={
                  <>
                    <span>bash-ish • local simulation</span>
                    <span className="footer-right">UTF-8</span>
                  </>
                }
                className="terminal-window"
              >
                <Terminal
                  openProgram={openProgram}
                  changeWallpaper={() => setWallpaper((v) => !v)}
                  resetDesktop={resetDesktop}
                  onSecret={() =>
                    setNotice(
                      "SECRET FOUND\n\nYou have earned the Certified Internet Explorer badge.\n\nNo browser wars were started in the making of this badge.",
                    )
                  }
                />
              </Window>
              <div className="blinkie-shelf">
                <span className="blinkie">
                  <span>★</span> I BREAK THINGS &amp; FIX THEM <span>★</span>
                </span>
                <span className="tiny-stamp">
                  HTML
                  <br />
                  <b>WITH ♥</b>
                </span>
                <span className="tiny-stamp linux-stamp">
                  LINUX
                  <br />
                  <b>INSIDE</b>
                </span>
              </div>
            </div>
            <aside
              className="window-column right-column"
              aria-label="System information"
            >
              <Window
                {...frame("status")}
                footer={<>manually updated • {site.updated}</>}
              >
                <div className="status-heading">
                  <Led />
                  <strong>Probably tinkering.</strong>
                </div>
                <dl className="status-list">
                  <div>
                    <dt>currently</dt>
                    <dd>Under the hood of Minecraft</dd>
                  </div>
                  <div>
                    <dt>running</dt>
                    <dd>CachyOS &amp; too many tabs</dd>
                  </div>
                  <div>
                    <dt>thinking</dt>
                    <dd>“There’s probably a config for that.”</dd>
                  </div>
                </dl>
              </Window>
              <Window
                {...frame("computer")}
                footer={
                  <>
                    <Led /> powered by curiosity &amp; electricity
                  </>
                }
              >
                <div className="spec-header">
                  <Icon name="computer" size={35} />
                  <div>
                    <strong>The daily driver</strong>
                    <span>bare metal. real buttons.</span>
                  </div>
                </div>
                <dl className="spec-list">
                  {hardware.map(([key, value]) => (
                    <div key={key}>
                      <dt>{key}</dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="system-sticker">
                  <span>
                    cachy<span className="accent">OS</span>
                  </span>
                  <small>my computer, my rules.</small>
                </div>
              </Window>
              <div className="warning-note">
                <div className="note-heading">
                  <span>▲</span> friendly warning
                </div>
                <p>
                  This website is never finished.
                  <br />
                  Neither is anything in my projects folder.
                </p>
                <button
                  onClick={() =>
                    setNotice(
                      "You understand the risks.\n\nSymptoms may include opening 14 wiki tabs, reinstalling Linux, and wanting your own homepage.\n\nWelcome to the club.",
                    )
                  }
                >
                  [ understood ]
                </button>
              </div>
            </aside>
          </div>
          <div className="bottom-grid">
            <Window
              {...frame("links")}
              footer={
                <>
                  Small buttons. Big internet.{" "}
                  <span className="footer-right">
                    88 × 31, as nature intended
                  </span>
                </>
              }
            >
              <div className="links-intro">
                <h3>Some good exits.</h3>
                <p>The web is better when it links to other places.</p>
              </div>
              <div className="web-buttons">
                {links.map((link) => (
                  <OutsideLink
                    href={link.href}
                    key={link.title}
                    className={`web-button ${link.style}`}
                    title={`${link.title} — ${link.subtitle}`}
                  >
                    <b className="button-icon">{link.icon}</b>
                    <span>
                      <b>{link.title}</b>
                      <small>{link.subtitle}</small>
                    </span>
                  </OutsideLink>
                ))}
              </div>
            </Window>
            <div className="site-info">
              <div className="visitor-label">YOU ARE VISITOR NUMBER</div>
              <div
                className="counter"
                role="img"
                aria-label="Decorative visitor counter, 0001337"
              >
                {"0001337".split("").map((n, i) => (
                  <span key={i}>{n}</span>
                ))}
              </div>
              <small>completely fake. the welcome is real.</small>
              <div className="my-button-row">
                <img
                  src="/button.svg"
                  width="88"
                  height="31"
                  alt="Eric’s personal computer website button"
                />
                <button onClick={copyButton}>
                  {copied ? "copied! ✓" : "take a button ↗"}
                </button>
              </div>
            </div>
          </div>
          <footer className="site-footer">
            <span>
              © {new Date().getFullYear()} Eric Krouss{" "}
              <span className="footer-star">✦</span> made by a person, for
              people.
            </span>
            <span>
              v{site.version} <span className="footer-divider">/</span> last
              saved {site.updated} <span className="footer-divider">/</span>{" "}
              <a href="#desktop">back to top ↑</a>
            </span>
          </footer>
        </main>
      </div>
      <nav className="taskbar" aria-label="Open programs">
        <div className="start-area" ref={menuRef}>
          <button
            className={`start-button ${menu ? "pressed" : ""}`}
            aria-expanded={menu}
            aria-controls="start-menu"
            onClick={() => setMenu((v) => !v)}
          >
            <Icon name="computer" size={23} />
            <strong>start</strong>
          </button>
          {menu && (
            <nav id="start-menu" className="start-menu" aria-label="Start menu">
              <div className="start-menu-brand">
                EricOS <span>PERSONAL EDITION</span>
              </div>
              {programs.map(([name, icon]) => (
                <button key={name} onClick={() => openProgram(name)}>
                  <Icon name={icon} />
                  {name}.exe
                  {minimized.includes(name) && <small>minimized</small>}
                </button>
              ))}
              <div className="menu-separator" />
              <button
                onClick={() => {
                  setWallpaper((v) => !v);
                  setMenu(false);
                }}
              >
                <Icon name="gear" />
                Change wallpaper
              </button>
              <button onClick={resetDesktop}>
                <Icon name="folder" />
                Tidy desktop
              </button>
            </nav>
          )}
        </div>
        <div className="taskbar-divider" />
        <div className="task-buttons">
          {programs.map(([name, icon]) => (
            <button
              key={name}
              className={`${active === name && !minimized.includes(name) ? "selected" : ""} ${minimized.includes(name) ? "minimized" : ""}`}
              data-program={name}
              aria-label={`${minimized.includes(name) ? "Restore" : "Focus"} ${name}.exe`}
              onClick={() => openProgram(name)}
              title={`${minimized.includes(name) ? "Restore" : "Focus"} ${name}.exe`}
            >
              <Icon name={icon} size={16} />
              <span>{name}.exe</span>
              {minimized.includes(name) && <span>↓</span>}
            </button>
          ))}
        </div>
        <div className="taskbar-clock">
          <Led />
          <span title="Your local time">
            {time.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </nav>
      <dialog
        ref={dialog}
        className="retro-dialog"
        aria-label="Message from the webmaster"
        onClose={() => setNotice(null)}
      >
        <div className="title-bar">
          <Icon name="note" size={18} />
          <strong>message from the webmaster</strong>
          <button
            className="window-control"
            aria-label="Close dialog"
            onClick={() => dialog.current.close()}
          >
            ×
          </button>
        </div>
        <div className="dialog-content">
          <Icon name="computer" size={44} />
          <p>{notice}</p>
        </div>
        <button
          className="dialog-ok"
          autoFocus
          onClick={() => dialog.current.close()}
        >
          OK, got it.
        </button>
      </dialog>
    </div>
  );
}
