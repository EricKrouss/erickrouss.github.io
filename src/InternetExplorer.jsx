import React, { useEffect, useRef, useState } from "react";

const homeAddress = "http://youtube.com";
const playerPage = "/2007-youtube/watch.html";

function BrowserIcon({ name, size = 20, width = size, hot = false }) {
  if (hot)
    return (
      <span className="ie-toolbar-icon" style={{ width, height: size }}>
        <BrowserIcon name={name} size={size} width={width} />
        <img
          className="ie-icon-hot"
          src={`/assets/ie5/${name}-hot.png`}
          width={width}
          height={size}
          alt=""
          draggable="false"
        />
      </span>
    );
  return (
    <img
      src={`/assets/ie5/${name}.png`}
      width={width}
      height={size}
      alt=""
      draggable="false"
    />
  );
}

export default function InternetExplorer({
  visible,
  onFocus,
  onClose,
  showNotice,
}) {
  const [address, setAddress] = useState(homeAddress);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [menu, setMenu] = useState(null);
  const frame = useRef(null);
  const input = useRef(null);
  const root = useRef(null);

  const reload = () => {
    setAddress(homeAddress);
    setLoading(true);
    setRevision((value) => value + 1);
    setMenu(null);
  };
  const pause = () =>
    frame.current?.contentWindow?.postMessage(
      { type: "eric-desktop-pause" },
      location.origin,
    );
  useEffect(() => {
    if (!visible) pause();
  }, [visible]);
  useEffect(() => {
    const receive = (event) => {
      if (
        event.origin === location.origin &&
        event.source === frame.current?.contentWindow &&
        event.data?.type === "eric-player-focus"
      ) {
        onFocus();
        setMenu(null);
      }
    };
    const outside = (event) => {
      if (!root.current?.contains(event.target)) setMenu(null);
    };
    window.addEventListener("message", receive);
    document.addEventListener("pointerdown", outside);
    return () => {
      window.removeEventListener("message", receive);
      document.removeEventListener("pointerdown", outside);
    };
  }, [onFocus]);
  const navigate = (event) => {
    event.preventDefault();
    if (/^(https?:\/\/)?(www\.)?youtube\.com\/?$/i.test(address.trim()))
      reload();
    else {
      setAddress(homeAddress);
      showNotice(
        "Internet Explorer\n\nThis little browser only travels to 2007. Its home page is Eric’s YouTube player.\n\nTo load a video, paste a YouTube link into the page’s Search box.",
      );
    }
  };
  const stopLoading = () => {
    frame.current?.contentWindow?.stop();
    pause();
    setLoading(false);
  };
  const toolbarActions = [
    {
      name: "home",
      label: "Home",
      action: reload,
      className: "ie-compact-extra",
    },
    {
      name: "search",
      label: "Search",
      className: "ie-compact-extra",
      action: () =>
        frame.current?.contentWindow?.postMessage(
          { type: "eric-desktop-search" },
          location.origin,
        ),
    },
    {
      name: "favorites",
      label: "Favorites",
      action: () => setMenu("Favorites"),
      className: "ie-extra",
    },
    {
      name: "history",
      label: "History",
      className: "ie-extra",
      action: () => showNotice("History\n\nToday: http://youtube.com/"),
    },
    {
      name: "mail",
      label: "Mail",
      className: "ie-extra",
      action: () => showNotice("Outlook Express\n\nNo new messages."),
    },
    {
      name: "print",
      label: "Print",
      action: () => frame.current?.contentWindow?.print(),
      className: "ie-extra",
    },
  ];
  const menus = {
    File: [
      ["Open…", () => input.current?.focus()],
      ["Close", onClose],
    ],
    Edit: [
      [
        "Select Address",
        () => {
          input.current?.focus();
          input.current?.select();
        },
      ],
    ],
    View: [
      ["Refresh", reload],
      ["Stop", stopLoading],
    ],
    Favorites: [["YouTube — Broadcast Yourself", reload]],
    Tools: [
      [
        "Internet Options…",
        () =>
          showNotice(
            "Internet Options\n\nHome page: http://youtube.com\n\nConnection: one very long Ethernet cable to 2007.\nBrowser engine: your actual browser. Clippy has no jurisdiction here.",
          ),
      ],
    ],
    Help: [
      [
        "About Internet Explorer",
        () =>
          showNotice(
            "Microsoft Internet Explorer 5\n\nA desktop recreation using original Windows 98 SE toolbar graphics. The page inside is a local copy of Eric’s 2007 YouTube Player.\n\nThe address bar is decorative; you are still on Eric’s personal site.",
          ),
      ],
    ],
  };
  return (
    <div
      className="ie-browser"
      ref={root}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          if (menu === "Toolbar")
            root.current
              ?.querySelector(".ie-toolbar-overflow > button")
              ?.focus();
          setMenu(null);
        }
        if (event.key === "F5") {
          event.preventDefault();
          reload();
        }
      }}
    >
      <div className="ie-menu-row">
        <span className="ie-gripper" aria-hidden="true" />
        <nav className="ie-menus" aria-label="Internet Explorer menu">
          {Object.entries(menus).map(([label, items]) => (
            <div className="ie-menu" key={label}>
              <button
                aria-expanded={menu === label}
                onClick={() => setMenu(menu === label ? null : label)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    setMenu(label);
                    requestAnimationFrame(() =>
                      root.current
                        ?.querySelector(".ie-dropdown button")
                        ?.focus(),
                    );
                  }
                }}
              >
                {label === "Favorites" ? (
                  <>
                    F<u>a</u>vorites
                  </>
                ) : (
                  <>
                    <u>{label[0]}</u>
                    {label.slice(1)}
                  </>
                )}
              </button>
              {menu === label && (
                <div className="ie-dropdown">
                  {items.map(([text, action]) => (
                    <button
                      key={text}
                      onClick={() => {
                        setMenu(null);
                        action();
                      }}
                    >
                      {text}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="ie-brand">
          <BrowserIcon name="windows" size={22} />
        </div>
      </div>
      <div
        className="ie-toolbar"
        role="toolbar"
        aria-label="Internet Explorer navigation"
      >
        <span className="ie-gripper" aria-hidden="true" />
        <button
          disabled
          title="Back — no previous page"
          className="ie-split-button"
        >
          <BrowserIcon name="back-disabled" />
          <span>Back</span>
          <span className="ie-arrow" />
        </button>
        <button
          disabled
          title="Forward — no next page"
          aria-label="Forward"
          className="ie-split-button"
        >
          <BrowserIcon name="forward-disabled" />
          <span>Forward</span>
          <span className="ie-arrow" />
        </button>
        <button title="Stop" aria-label="Stop loading" onClick={stopLoading}>
          <BrowserIcon name="stop" hot />
          <span>Stop</span>
        </button>
        <button title="Refresh" aria-label="Refresh page" onClick={reload}>
          <BrowserIcon name="refresh" hot />
          <span>Refresh</span>
        </button>
        {toolbarActions.map(({ name, label, action, className }) => (
          <React.Fragment key={name}>
            {(name === "search" || name === "mail") && (
              <span className={`ie-divider ${className}`} aria-hidden="true" />
            )}
            <button
              title={label}
              onClick={action}
              className={`${className}${name === "mail" ? " ie-split-button" : ""}`}
            >
              <BrowserIcon name={name} hot />
              <span>{label}</span>
              {name === "mail" && <span className="ie-arrow" />}
            </button>
          </React.Fragment>
        ))}
        <div className="ie-toolbar-overflow">
          <button
            title="More toolbar buttons"
            aria-label="More toolbar buttons"
            aria-expanded={menu === "Toolbar"}
            onClick={() => setMenu(menu === "Toolbar" ? null : "Toolbar")}
          >
            <BrowserIcon name="chevron" width={10} size={7} />
          </button>
          {menu === "Toolbar" && (
            <div className="ie-dropdown">
              {toolbarActions.map(({ name, label, action, className }) => (
                <button
                  key={name}
                  className={`ie-overflow-${className}`}
                  onClick={() => {
                    setMenu(null);
                    action();
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <form className="ie-address-row" onSubmit={navigate}>
        <span className="ie-gripper" aria-hidden="true" />
        <label htmlFor="ie-address">Address</label>
        <div className="ie-address-box">
          <BrowserIcon name="page" size={16} />
          <input
            ref={input}
            id="ie-address"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            aria-label="Internet Explorer address"
          />
          <button
            type="button"
            aria-label="Address history"
            onClick={() => {
              setAddress(homeAddress);
              input.current?.focus();
            }}
          >
            <span className="ie-arrow" />
          </button>
        </div>
        <button className="ie-go" type="submit">
          <BrowserIcon name="go" size={16} width={18} hot />
          <span>Go</span>
        </button>
        <span className="ie-divider ie-links-label" aria-hidden="true" />
        <button
          type="button"
          className="ie-links-label"
          onClick={() => setMenu("Favorites")}
        >
          Links <span>»</span>
        </button>
      </form>
      <div className="ie-page-area">
        <iframe
          ref={frame}
          key={revision}
          src={playerPage}
          title="Eric’s 2007 YouTube player"
          allow="fullscreen; clipboard-write"
          onLoad={() => {
            setLoading(false);
            if (!visible) pause();
          }}
        />
      </div>
      <div className="ie-statusbar" role="status">
        <span className="ie-status-message">
          <BrowserIcon name="status-page" size={16} />
          {loading ? "Opening page http://youtube.com/…" : "Done"}
        </span>
        <span className="ie-status-pane" aria-hidden="true" />
        <span className="ie-status-pane" aria-hidden="true" />
        <span className="ie-status-zone">
          <BrowserIcon name="internet" size={16} />
          Internet
          <span className="ie-size-grip" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
