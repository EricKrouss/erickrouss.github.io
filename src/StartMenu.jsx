import React, { useRef, useState } from "react";
import { Icon } from "./Art.jsx";

export default function StartMenu({
  programs,
  minimized,
  openProgram,
  resetDesktop,
  showNotice,
  closeMenu,
  restart,
}) {
  const [submenu, setSubmenu] = useState(null);
  const root = useRef(null);
  const openShell = () => {
    openProgram("terminal");
    requestAnimationFrame(() =>
      document.getElementById("command")?.focus({ preventScroll: true }),
    );
  };
  const showHelp = () => {
    closeMenu();
    showNotice(
      "Welcome to Eric’s desktop.\n\nPrograms opens any of the seven windows. Drag a title bar to move a window. Use the three buttons to minimize, maximize/restore, or close it. Double-click a title bar to maximize or restore. All seven desktop shortcuts stay available, even when windows are closed.\n\nType help in the terminal for commands, or try cowsay.\n\nThis is a personal homepage running in your browser. The Windows 98 graphics are here for nostalgia.",
    );
  };
  const keyboard = (e) => {
    const inPanel = e.target.closest(".start-submenu");
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
      e.preventDefault();
      const buttons = [
        ...(inPanel || root.current).querySelectorAll(
          inPanel
            ? "button"
            : ".start-menu-items > button, .submenu-row > button",
        ),
      ];
      const index = buttons.indexOf(e.target);
      const next =
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? buttons.length - 1
            : (index + (e.key === "ArrowUp" ? -1 : 1) + buttons.length) %
              buttons.length;
      buttons[next]?.focus();
    } else if (e.key === "ArrowRight" && e.target.dataset.submenu) {
      e.preventDefault();
      setSubmenu(e.target.dataset.submenu);
      requestAnimationFrame(() =>
        root.current.querySelector(".start-submenu button")?.focus(),
      );
    } else if (e.key === "ArrowLeft" && inPanel) {
      e.preventDefault();
      root.current.querySelector(`[data-submenu="${submenu}"]`)?.focus();
      setSubmenu(null);
    }
  };
  const submenuButton = (name, label, icon) => (
    <button
      data-submenu={name}
      aria-expanded={submenu === name}
      aria-controls={`${name}-submenu`}
      onClick={() => setSubmenu(name)}
      onMouseEnter={() => setSubmenu(name)}
    >
      <Icon name={icon} size={32} />
      <span>{label}</span>
      <span className="menu-arrow" aria-hidden="true">
        ▸
      </span>
    </button>
  );
  return (
    <nav
      id="start-menu"
      className="start-menu"
      aria-label="Start menu"
      ref={root}
      onKeyDown={keyboard}
    >
      <div className="start-menu-brand" role="img" aria-label="Windows 98" />
      <div className="start-menu-items">
        <button
          onMouseEnter={() => setSubmenu(null)}
          onClick={() => openProgram("status")}
        >
          <Icon name="network" size={32} />
          <span>What’s New</span>
        </button>
        <div className="menu-separator" />
        <div className="submenu-row">
          {submenuButton("programs", "Programs", "folder")}
          {submenu === "programs" && (
            <div
              className="start-submenu"
              id="programs-submenu"
              aria-label="Programs"
            >
              {programs.map(([name, icon]) => (
                <button key={name} onClick={() => openProgram(name)}>
                  <Icon name={icon} size={16} />
                  <span>{name}.exe</span>
                  {minimized.includes(name) && <small>minimized</small>}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onMouseEnter={() => setSubmenu(null)}
          onClick={() => openProgram("links")}
        >
          <Icon name="favorites" size={32} />
          <span>Favorites</span>
        </button>
        <button
          onMouseEnter={() => setSubmenu(null)}
          onClick={() => openProgram("eric")}
        >
          <Icon name="note" size={32} />
          <span>Documents</span>
        </button>
        <div className="submenu-row">
          {submenuButton("settings", "Settings", "gear")}
          {submenu === "settings" && (
            <div
              className="start-submenu"
              id="settings-submenu"
              aria-label="Settings"
            >
              <button
                onClick={() => {
                  closeMenu();
                  showNotice(
                    "Display properties\n\nDesktop color: Windows 98 teal (#008080).\n\nAll seven programs have permanent desktop shortcuts. Use Tidy desktop to restore every window to its original position.",
                  );
                }}
              >
                <Icon name="computer" size={16} />
                <span>Display properties</span>
              </button>
              <button onClick={restart}>
                <Icon name="shutdown" size={16} />
                <span>Replay startup</span>
              </button>
              <button onClick={resetDesktop}>
                <Icon name="folder" size={16} />
                <span>Tidy desktop</span>
              </button>
              <button onClick={() => openProgram("computer")}>
                <Icon name="gear" size={16} />
                <span>System properties</span>
              </button>
            </div>
          )}
        </div>
        <button onMouseEnter={() => setSubmenu(null)} onClick={openShell}>
          <Icon name="search" size={32} />
          <span>Find…</span>
        </button>
        <button onMouseEnter={() => setSubmenu(null)} onClick={showHelp}>
          <Icon name="help" size={32} />
          <span>Help</span>
        </button>
        <button onMouseEnter={() => setSubmenu(null)} onClick={openShell}>
          <Icon name="terminal" size={32} />
          <span>Run…</span>
        </button>
        <div className="menu-separator" />
        <button
          onMouseEnter={() => setSubmenu(null)}
          onClick={() => {
            closeMenu();
            showNotice(
              "It’s now safe to close this tab.\n\nYour actual computer will keep running.\nThanks for visiting — come back soon.",
            );
          }}
        >
          <Icon name="shutdown" size={32} />
          <span>Shut Down…</span>
        </button>
      </div>
    </nav>
  );
}
