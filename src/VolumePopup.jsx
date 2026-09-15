import React, { useEffect, useRef, useState } from "react";
import "./volume.css";

export default function VolumePopup({ enabled, volume, onEnabled, onVolume }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const button = useRef(null);
  const slider = useRef(null);
  useEffect(() => {
    if (!open) return;
    slider.current?.focus();
    const dismiss = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    const blur = () => {
      if (document.activeElement?.tagName === "IFRAME") setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("focusin", dismiss);
    window.addEventListener("blur", blur);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("focusin", dismiss);
      window.removeEventListener("blur", blur);
    };
  }, [open]);
  return (
    <div
      ref={root}
      className="volume-control"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.stopPropagation();
          setOpen(false);
          button.current.focus();
        }
      }}
    >
      <button
        ref={button}
        className={`sound-button ${!enabled || volume === 0 ? "muted" : ""}`}
        aria-label="Volume"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((old) => !old)}
        title={
          enabled ? `Volume: ${Math.round(volume * 100)}%` : "Volume: muted"
        }
      >
        <img src="/assets/win98/speaker.png" width="16" height="16" alt="" />
      </button>
      {open && (
        <div className="volume-popup" role="dialog" aria-label="Volume control">
          <div>Volume</div>
          <div className="volume-slider-area">
            <div className="volume-ticks" aria-hidden="true" />
            <input
              ref={slider}
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(volume * 100)}
              aria-label="Page volume"
              aria-orientation="vertical"
              aria-valuetext={`${Math.round(volume * 100)} percent`}
              onChange={(event) => onVolume(Number(event.target.value) / 100)}
            />
          </div>
          <label>
            <input
              type="checkbox"
              checked={!enabled}
              onChange={(event) => onEnabled(!event.target.checked)}
            />{" "}
            Mute
          </label>
        </div>
      )}
    </div>
  );
}
