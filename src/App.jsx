import React, { useCallback, useEffect, useRef, useState } from "react";
import { site, projects, links, hardware, minecraft } from "./content.js";
import { Icon, DesktopComputer, MinecraftArtwork } from "./Art.jsx";
import StartMenu from "./StartMenu.jsx";
import InternetExplorer from "./InternetExplorer.jsx";
import Startup, { hasStarted } from "./Startup.jsx";
import ClassicScrollbars from "./ClassicScrollbars.jsx";
import { useWindowActions } from "./windowAnimation.js";
import { readSoundPreference, useSystemSounds } from "./systemSounds.js";

const programs = [
  ["eric", "computer"],
  ["projects", "folder"],
  ["minecraft", "block"],
  ["computer", "gear"],
  ["links", "network"],
  ["status", "disk"],
  ["terminal", "dos"],
  ["iexplore", "ie"],
];
const programNames = programs.map(([name]) => name);
const initialLines = [
  { text: "Microsoft(R) Windows 98" },
  { text: "   (C)Copyright Microsoft Corp 1981-1998." },
  { text: "" },
  { text: "C:\\WINDOWS> bash" },
  { text: "MS-DOS Prompt. Suspiciously fluent in Bash." },
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
  onClose,
  onMaximize,
  maximized,
  offset,
  onMove,
  className = "",
}) {
  const drag = useRef(null);
  const content = useRef(null);
  const startDrag = (e) => {
    if (
      maximized ||
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
      maxY:
        (getComputedStyle(e.currentTarget.closest("section")).position ===
        "fixed"
          ? innerHeight
          : document.documentElement.scrollHeight) - rect.bottom,
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
      className={`window ${active ? "active" : ""} ${maximized ? "maximized" : ""} ${className}`}
      style={{
        transform: maximized
          ? "none"
          : `translate(${offset.x}px, ${offset.y}px)`,
        zIndex: active ? 60 : maximized ? 40 : 1,
      }}
      onPointerDown={() => onFocus(id)}
      onFocus={() => onFocus(id)}
    >
      <div
        className="title-bar"
        onDoubleClick={(e) => {
          if (!e.target.closest("button")) onMaximize(id);
        }}
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
        <div className="title-bar-controls">
          <button
            className="window-control minimize"
            aria-label={`Minimize ${id}.exe`}
            title="Minimize"
            onClick={() => onMinimize(id)}
          />
          <button
            className={`window-control ${maximized ? "restore" : "maximize"}`}
            aria-label={`${maximized ? "Restore" : "Maximize"} ${id}.exe window`}
            title={maximized ? "Restore Down" : "Maximize"}
            onClick={() => onMaximize(id)}
          />
          <button
            className="window-control close"
            aria-label={`Close ${id}.exe`}
            title="Close — reopen from the desktop"
            onClick={() => onClose(id)}
          />
        </div>
      </div>
      <div className="window-body classic-scroll-area">
        <div className="window-content" ref={content}>
          {children}
        </div>
        <ClassicScrollbars viewportRef={content} label={title || `${id}.exe`} />
      </div>
      {footer && (
        <div className="window-footer">
          {footer}
          <span className="resize-grip" aria-hidden="true" />
        </div>
      )}
    </section>
  );
}

function Terminal({
  openProgram,
  resetDesktop,
  onSecret,
  onMaximize,
  showNotice,
  playSound,
}) {
  const [lines, setLines] = useState(initialLines);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [fontSize, setFontSize] = useState("auto");
  const [caret, setCaret] = useState(0);
  const screen = useRef(null);
  const output = useRef(null);
  useEffect(() => {
    screen.current.scrollTop = screen.current.scrollHeight;
  }, [lines]);
  const execute = (e) => {
    e.preventDefault();
    const raw = input.trim();
    if (!raw) return;
    const [command, ...args] = raw.toLowerCase().split(/\s+/);
    let answer;
    if (command === "clear") {
      setCaret(0);
      setLines([]);
      setInput("");
      return;
    }
    if (command === "help")
      answer =
        "help · about · ls · open [name] · specs · date\nping · fortune · ver · wallpaper · reset · clear\nTry: open minecraft. There may be a few secrets.";
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
    else if (command === "arch") answer = "btw";
    else if (command === "ping")
      answer =
        "PING imagination.local (127.0.0.1)\n64 bytes: time=<1ms  TTL=nostalgia\nSimulated connection: looking good.";
    else if (command === "ver")
      answer =
        "Windows 98 on the outside. CachyOS on the inside.\nC:\\WINDOWS has been symlinked to /home/eric. Please act surprised.";
    else if (command === "pacman")
      answer =
        "resolving dependencies…\nnostalgia is up to date. Clippy has been held back.";
    else if (command === "fortune")
      answer = [
        "There is no cloud. Just someone else’s computer.",
        "Your next bug fix is hiding behind a good night’s sleep.",
        "You can close the wiki tabs. You will open them again.",
        "The best part of the internet is still the people.",
      ][Math.floor(Math.random() * 4)];
    else if (command === "wallpaper") {
      answer = "Desktop: original Windows 98 teal (#008080).";
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
    else {
      answer = `Command not found: ${command}\nType help for the little list of things I understand.`;
      playSound("error");
    }
    setLines((old) =>
      [
        ...old,
        { text: `eric@home:~$ ${raw}`, type: "bright" },
        { text: answer, type: command === "cowsay" ? "ascii" : "" },
      ].slice(-70),
    );
    setHistory((old) => [...old, raw]);
    setHistoryIndex(history.length + 1);
    setInput("");
    setCaret(0);
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
    setCaret((history[next] || "").length);
  };
  const mark = () => {
    const range = document.createRange();
    range.selectNodeContents(output.current);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        window.getSelection()?.toString() || output.current.textContent,
      );
    } catch {
      showNotice("Copy\n\nSelect the text and press Ctrl+C to copy it.");
    }
  };
  const paste = async () => {
    try {
      const text = (await navigator.clipboard.readText()).replace(
        /[\r\n]+/g,
        " ",
      );
      setInput(text);
      setCaret(text.length);
      document.getElementById("command")?.focus();
    } catch {
      showNotice("Paste\n\nClick the command line and press Ctrl+V to paste.");
    }
  };
  return (
    <div className={`terminal-shell dos-font-${fontSize}`}>
      <div
        className="dos-toolbar"
        role="toolbar"
        aria-label="MS-DOS Prompt toolbar"
      >
        <select
          aria-label="Console font size"
          value={fontSize}
          onChange={(event) => setFontSize(event.target.value)}
        >
          <option value="auto">Auto</option>
          <option value="small">6 x 8</option>
          <option value="large">8 x 12</option>
        </select>
        {[
          ["mark", "Mark", mark],
          ["copy", "Copy", copy],
          ["paste", "Paste", paste],
          ["fullscreen", "Full Screen", onMaximize],
          [
            "properties",
            "Properties",
            () =>
              showNotice(
                "MS-DOS Prompt Properties\n\nOriginal Windows 98 Terminal bitmap fonts. Linux commands, because old habits die hard.\n\nThis is a simulated shell; commands never run on your computer.",
              ),
          ],
          ["background", "Background", () => openProgram("eric")],
          [
            "font",
            "Font",
            () => setFontSize((size) => (size === "large" ? "small" : "large")),
          ],
        ].map(([name, label, action]) => (
          <button
            key={name}
            className={`dos-tool dos-${name}`}
            title={label}
            aria-label={`Console ${label}`}
            onClick={action}
          >
            <img
              src={`/assets/dos/${name}.png`}
              width="22"
              height="22"
              alt=""
            />
          </button>
        ))}
      </div>
      <div className="dos-scroll-area classic-scroll-area">
        <div className="dos-screen" ref={screen}>
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
                {line.type === "ascii" ? (
                  <span
                    role="img"
                    aria-label="An ASCII cow says: keep the web weird!"
                  >
                    {line.text.split("\n").map((row, rowIndex) => (
                      <span
                        className="ascii-row"
                        key={rowIndex}
                        aria-hidden="true"
                      >
                        {[...row].map((character, column) => (
                          <span key={column}>{character}</span>
                        ))}
                      </span>
                    ))}
                  </span>
                ) : (
                  line.text
                )}
              </div>
            ))}
          </div>
          <form onSubmit={execute} className="terminal-input">
            <label htmlFor="command">eric@home:~$</label>
            <span
              className="dos-command-field"
              style={{ "--caret-column": caret }}
            >
              <input
                id="command"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setCaret(e.target.selectionStart);
                }}
                onSelect={(e) => setCaret(e.target.selectionStart)}
                onKeyDown={recall}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck="false"
                aria-label="Terminal command"
              />
              <span className="dos-caret" aria-hidden="true" />
            </span>
          </form>
        </div>
        <ClassicScrollbars viewportRef={screen} label="MS-DOS Prompt" />
      </div>
    </div>
  );
}

export default function App() {
  const [bootPhase, setBootPhase] = useState(() =>
    hasStarted() ? "ready" : "off",
  );
  const [soundEnabled, setSoundEnabled] = useState(readSoundPreference);
  const playSound = useSystemSounds(soundEnabled);
  const shownWindows = useRef(null);
  const [active, setActive] = useState("eric");
  const [minimized, setMinimized] = useState([]);
  const [closed, setClosed] = useState(["iexplore"]);
  const [maximized, setMaximized] = useState([]);
  const [offsets, setOffsets] = useState({});
  const [menu, setMenu] = useState(false);
  const [time, setTime] = useState(new Date());
  const [notice, setNotice] = useState(null);
  const showNotice = useCallback(
    (message, kind = "alert") => {
      setNotice(message);
      if (message) playSound(kind);
    },
    [playSound],
  );
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
    if (build === 100 && buildRunning) {
      setBuildRunning(false);
      playSound("notice");
    }
  }, [build, buildRunning, playSound]);
  useEffect(() => {
    if (notice && !dialog.current.open) dialog.current.showModal();
  }, [notice]);
  useEffect(() => {
    const closeMenu = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenu(false);
    };
    const escape = (e) => {
      if (e.key === "Escape" && menuRef.current?.querySelector("#start-menu")) {
        setMenu(false);
        menuRef.current.querySelector(".start-button")?.focus();
      }
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
        showNotice(
          "Cheat code accepted. You now have unlimited curiosity. Use it irresponsibly.",
        );
    };
    window.addEventListener("keydown", secret);
    return () => window.removeEventListener("keydown", secret);
  }, [showNotice]);
  const finishOpen = (id) => {
    if (id === "iexplore" && closed.includes(id)) playSound("navigate");
    shownWindows.current = null;
    setClosed((old) => old.filter((n) => n !== id));
    setMinimized((old) => old.filter((n) => n !== id));
    setActive(id);
    setMenu(false);
    requestAnimationFrame(() => {
      const el = document.getElementById(id);
      el?.focus({ preventScroll: true });
      el?.scrollIntoView({
        behavior: "instant",
        block: "nearest",
      });
    });
  };
  const resetDesktop = () => {
    windowActions.cancel();
    shownWindows.current = null;
    setOffsets({});
    setMinimized([]);
    setClosed(["iexplore"]);
    setMaximized([]);
    setActive("eric");
    setMenu(false);
  };
  const finishMinimize = (id) => {
    shownWindows.current = null;
    setMinimized((old) => (old.includes(id) ? old : [...old, id]));
    setActive(
      programNames.find(
        (name) =>
          name !== id && !closed.includes(name) && !minimized.includes(name),
      ) || null,
    );
  };
  const showDesktop = () => {
    windowActions.cancel();
    setMenu(false);
    if (shownWindows.current) {
      setMinimized(shownWindows.current.minimized);
      setActive(shownWindows.current.active);
      shownWindows.current = null;
    } else {
      shownWindows.current = { minimized, active };
      setMinimized(programNames.filter((name) => !closed.includes(name)));
      setActive(null);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  };
  const restart = () => {
    resetDesktop();
    window.scrollTo({ top: 0, behavior: "instant" });
    setBootPhase("off");
  };
  const windowActions = useWindowActions({
    minimized,
    closed,
    maximized,
    offsets,
    open: finishOpen,
    minimize: (id) => {
      finishMinimize(id);
      requestAnimationFrame(() =>
        document.querySelector(`[data-program="${id}"]`)?.focus(),
      );
    },
    maximize: (n) => {
      setMaximized((old) =>
        old.includes(n) ? old.filter((v) => v !== n) : [...old, n],
      );
      setActive(n);
    },
    close: (n) => {
      setClosed((old) => [...old, n]);
      setMinimized((old) => old.filter((v) => v !== n));
      setMaximized((old) => old.filter((v) => v !== n));
      setActive(
        programNames.find(
          (v) => v !== n && !closed.includes(v) && !minimized.includes(v),
        ) || null,
      );
      requestAnimationFrame(() =>
        document.querySelector(`[data-shortcut="${n}"]`)?.focus(),
      );
    },
  });
  const openProgram = (id) => windowActions.dispatch("open", id);
  const minimizeProgram = (id) => windowActions.dispatch("minimize", id);
  const frame = (id) => ({
    id,
    icon: programs.find((p) => p[0] === id)[1],
    active: active === id,
    hidden: minimized.includes(id) || closed.includes(id),
    maximized: maximized.includes(id),
    onMaximize: (n) => windowActions.dispatch("maximize", n),
    onClose: (n) => windowActions.dispatch("close", n),
    onFocus: setActive,
    onMinimize: minimizeProgram,
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
      showNotice(code);
    }
  };
  return (
    <>
      <Startup
        phase={bootPhase}
        onPhase={setBootPhase}
        soundEnabled={soundEnabled}
        onSoundChange={setSoundEnabled}
      />
      <div
        className={`desktop boot-${bootPhase}`}
        inert={bootPhase !== "ready"}
        aria-hidden={bootPhase !== "ready"}
      >
        <a
          className="skip-link"
          href="#eric"
          onClick={() => openProgram("eric")}
        >
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
            {programs.map(([name, icon]) => (
              <button
                key={name}
                onClick={() => openProgram(name)}
                title={`Open ${name}.exe`}
                data-shortcut={name}
              >
                <Icon name={icon} size={32} />
                <span>
                  {name === "iexplore"
                    ? "Internet Explorer"
                    : name === "eric"
                      ? "My computer"
                      : name.charAt(0).toUpperCase() + name.slice(1)}
                </span>
              </button>
            ))}
            <button
              onClick={() => {
                setRecycled(true);
                showNotice(
                  "Recycle Bin: 3 items\n\nfinal_final_v2.zip\nnew-website-idea-47.txt\nInternet Explorer\n\nSome things are better left here.",
                );
              }}
              title="One person’s trash…"
            >
              <Icon name="trash" size={32} />
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
                  <p>
                    Computers, code &amp; other things I probably took apart.
                  </p>
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
                <DesktopComputer />
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
                      <img
                        className="profile-photo"
                        src="/assets/period/eric.png"
                        width="80"
                        height="80"
                        alt="Eric Krouss"
                      />
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
                    Usually messing with Linux, writing code, poking at
                    networks, or getting sidetracked by Minecraft internals.
                  </p>
                  <div className="profile-links">
                    <OutsideLink href={site.github}>GitHub ↗</OutsideLink>
                    <OutsideLink href={site.bluesky}>Bluesky ↗</OutsideLink>
                    <a href={`mailto:${site.email}`}>Send electronic mail ✉</a>
                  </div>
                  <div className="handwritten">
                    a website should feel like someone lives here.
                  </div>
                </Window>
                <Window
                  {...frame("projects")}
                  footer={
                    <>
                      <span>{projects.length} items</span>
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
                    <MinecraftArtwork />
                    <span className="landscape-caption">
                      MINECRAFT OLDSCHOOL
                    </span>
                    <a
                      className="build-label"
                      href={minecraft.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      visit the project ↗
                    </a>
                  </div>
                  <div className="minecraft-copy">
                    <h3>{minecraft.name}</h3>
                    <p>{minecraft.description}</p>
                    <div className="workshop-list">
                      {minecraft.features.map((feature, index) => (
                        <div key={feature}>
                          <span>{String(index + 1).padStart(2, "0")}</span>
                          {feature}
                        </div>
                      ))}
                    </div>
                    <p className="minecraft-distribution">
                      {minecraft.distribution}
                    </p>
                    <div className="minecraft-project-links">
                      <OutsideLink href={minecraft.website}>
                        Project website ↗
                      </OutsideLink>
                      <OutsideLink href={minecraft.releases}>
                        Releases &amp; changelog ↗
                      </OutsideLink>
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
                      <small>
                        toy build system · no actual blocks compiled
                      </small>
                    </div>
                  </div>
                </Window>
                <Window
                  {...frame("terminal")}
                  title="MS-DOS Prompt"
                  className="terminal-window"
                >
                  <Terminal
                    openProgram={openProgram}
                    resetDesktop={resetDesktop}
                    onMaximize={() => frame("terminal").onMaximize("terminal")}
                    showNotice={showNotice}
                    playSound={playSound}
                    onSecret={() =>
                      showNotice(
                        "SECRET FOUND\n\nYou have earned the Certified Internet Explorer badge.\n\nNo browser wars were started in the making of this badge.",
                      )
                    }
                  />
                </Window>
                <div className="blinkie-shelf">
                  <OutsideLink
                    href="https://wiki.archlinux.org/"
                    title="An archived Arch Linux 88×31 button"
                  >
                    <img
                      src="/assets/period/archlinux.gif"
                      width="88"
                      height="31"
                      alt="Arch Linux"
                    />
                  </OutsideLink>
                  <a
                    href="/asset-credits.html"
                    title="Archived web graphics and their sources"
                  >
                    <img
                      src="/assets/period/construction.gif"
                      width="88"
                      height="31"
                      alt="This site is under construction"
                    />
                  </a>
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
                      <dd>“Installed a Start menu. Still can’t quit Vim.”</dd>
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
                      showNotice(
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
                <a href="/asset-credits.html">asset credits</a>{" "}
                <span className="footer-divider">/</span>{" "}
                <a href="#desktop">back to top ↑</a>
              </span>
            </footer>
          </main>
        </div>
        {!closed.includes("iexplore") && (
          <Window
            {...frame("iexplore")}
            title="YouTube - Microsoft Internet Explorer"
            className="ie-window"
          >
            <InternetExplorer
              visible={!minimized.includes("iexplore")}
              onFocus={() => setActive("iexplore")}
              onClose={() => frame("iexplore").onClose("iexplore")}
              showNotice={showNotice}
              playSound={playSound}
            />
          </Window>
        )}
        <nav className="taskbar" aria-label="Open programs">
          <div className="start-area" ref={menuRef}>
            <button
              className={`start-button ${menu ? "pressed" : ""}`}
              aria-expanded={menu}
              aria-controls="start-menu"
              onClick={() => setMenu((v) => !v)}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                  e.preventDefault();
                  setMenu(true);
                  requestAnimationFrame(() =>
                    menuRef.current
                      .querySelector(".start-menu-items > button")
                      ?.focus(),
                  );
                }
              }}
            >
              <Icon name="start" size={16} />
              <strong>Start</strong>
            </button>
            {menu && (
              <StartMenu
                programs={programs}
                minimized={minimized}
                openProgram={openProgram}
                resetDesktop={resetDesktop}
                showNotice={showNotice}
                soundEnabled={soundEnabled}
                toggleSound={() => setSoundEnabled((enabled) => !enabled)}
                closeMenu={() => setMenu(false)}
                restart={restart}
              />
            )}
          </div>
          <div className="quick-launch" aria-label="Quick Launch">
            <span className="toolbar-grip" aria-hidden="true" />
            <button
              title="Show Desktop"
              aria-label="Show Desktop"
              onClick={showDesktop}
            >
              <img
                src="/assets/win98/desktop.png"
                width="16"
                height="16"
                alt=""
              />
            </button>
            <button
              title="Internet Explorer"
              aria-label="Open Internet Explorer"
              onClick={() => openProgram("iexplore")}
            >
              <img
                src="/assets/win98/internet-explorer.png"
                width="16"
                height="16"
                alt=""
              />
            </button>
            <span className="toolbar-grip" aria-hidden="true" />
          </div>
          <div className="task-buttons">
            {programs
              .filter(([name]) => !closed.includes(name))
              .map(([name, icon]) => (
                <button
                  key={name}
                  className={`${active === name && !minimized.includes(name) ? "selected" : ""} ${minimized.includes(name) ? "minimized" : ""}`}
                  data-program={name}
                  aria-label={`${minimized.includes(name) ? "Restore" : active === name ? "Minimize" : "Focus"} ${name}.exe`}
                  onClick={() =>
                    active === name && !minimized.includes(name)
                      ? minimizeProgram(name)
                      : openProgram(name)
                  }
                  title={`${minimized.includes(name) ? "Restore" : active === name ? "Minimize" : "Focus"} ${name}.exe`}
                >
                  <Icon name={icon} size={16} />
                  <span>
                    {name === "iexplore"
                      ? "YouTube - Microsoft Internet Explorer"
                      : `${name}.exe`}
                  </span>
                </button>
              ))}
          </div>
          <div className="taskbar-clock">
            <button
              className={`sound-button ${soundEnabled ? "" : "muted"}`}
              onClick={() => setSoundEnabled((enabled) => !enabled)}
              aria-label={
                soundEnabled ? "Mute system sounds" : "Enable system sounds"
              }
              aria-pressed={!soundEnabled}
              title={
                soundEnabled ? "Volume — system sounds on" : "Volume — muted"
              }
            >
              <img
                src="/assets/win98/speaker.png"
                width="16"
                height="16"
                alt=""
              />
            </button>
            <span title="Your local time">
              {time.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
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
              className="window-control close"
              aria-label="Close dialog"
              onClick={() => dialog.current.close()}
            />
          </div>
          <div className="dialog-content">
            <Icon name="computer" size={32} />
            <p>{notice}</p>
          </div>
          <button
            className="dialog-ok"
            autoFocus
            onClick={() => dialog.current.close()}
          >
            OK
          </button>
        </dialog>
      </div>
    </>
  );
}
