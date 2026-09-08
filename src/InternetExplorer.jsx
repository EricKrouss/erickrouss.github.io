import React, { useEffect, useRef, useState } from "react";

const homeAddress = "http://youtube.com";
const playerPage = "/2007-youtube/watch.html";

function BrowserIcon({ name, size = 24 }) {
  return (
    <img
      src={`/assets/ie6/${name}.png`}
      width={size}
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
      [
        "Stop",
        () => {
          frame.current?.contentWindow?.stop();
          pause();
          setLoading(false);
        },
      ],
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
            "Microsoft Internet Explorer 6\n\nA desktop recreation using archived interface graphics. The page inside is a local copy of Eric’s 2007 YouTube Player.\n\nThe address bar is decorative; you are still on Eric’s personal site.",
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
                {label}
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
        <button disabled title="Back — no previous page" className="ie-back">
          <BrowserIcon name="back" />
          <span>Back</span>
          <span className="ie-arrow" />
        </button>
        <button disabled title="Forward — no next page" aria-label="Forward">
          <BrowserIcon name="forward" />
          <span className="ie-arrow" />
        </button>
        <button
          title="Stop"
          aria-label="Stop loading"
          onClick={() => {
            frame.current?.contentWindow?.stop();
            pause();
            setLoading(false);
          }}
        >
          <BrowserIcon name="stop" />
        </button>
        <button title="Refresh" aria-label="Refresh page" onClick={reload}>
          <BrowserIcon name="refresh" />
        </button>
        <button
          title="Home"
          aria-label="Internet Explorer home"
          onClick={reload}
        >
          <BrowserIcon name="home" />
        </button>
        <span className="ie-divider" aria-hidden="true" />
        <button
          title="Search"
          onClick={() =>
            frame.current?.contentWindow?.postMessage(
              { type: "eric-desktop-search" },
              location.origin,
            )
          }
        >
          <BrowserIcon name="search" />
          <span>Search</span>
        </button>
        <button
          title="Favorites"
          className="ie-extra"
          onClick={() => setMenu("Favorites")}
        >
          <BrowserIcon name="favorites" />
          <span>Favorites</span>
        </button>
        <button
          title="History"
          aria-label="History"
          className="ie-extra"
          onClick={() =>
            showNotice(
              "History\n\nToday: YouTube, 2007.\n\nSome tabs are worth keeping open for nineteen years.",
            )
          }
        >
          <BrowserIcon name="history" />
        </button>
        <span className="ie-divider ie-extra" aria-hidden="true" />
        <button
          title="Mail"
          aria-label="Internet Explorer mail"
          className="ie-extra"
          onClick={() =>
            showNotice(
              "You have 0 new messages.\n\nEven Outlook Express deserves a day off.",
            )
          }
        >
          <BrowserIcon name="mail" />
          <span className="ie-arrow" />
        </button>
        <button
          title="Print"
          aria-label="Print page"
          className="ie-extra"
          onClick={() => frame.current?.contentWindow?.print()}
        >
          <BrowserIcon name="print" />
        </button>
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
          <BrowserIcon name="go" size={16} />
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
          <BrowserIcon name="page" size={16} />
          {loading ? "Opening page http://youtube.com/…" : "Done"}
        </span>
        <span className="ie-status-zone">
          <BrowserIcon name="internet" size={16} />
          Internet
        </span>
        <span className="ie-size-grip" aria-hidden="true" />
      </div>
    </div>
  );
}
