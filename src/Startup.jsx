import React, { useEffect, useRef, useState } from "react";
import { Icon } from "./Art.jsx";

const sessionKey = "eric-desktop-started";

export function hasStarted() {
  try {
    return sessionStorage.getItem(sessionKey) === "yes";
  } catch {
    return false;
  }
}

export default function Startup({
  phase,
  onPhase,
  soundEnabled,
  onSoundChange,
}) {
  const timers = useRef([]);
  const audio = useRef(null);
  const generation = useRef(0);
  const powerButton = useRef(null);
  const skipButton = useRef(null);
  const [audioUnavailable, setAudioUnavailable] = useState(false);

  const stop = () => {
    generation.current += 1;
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const context = audio.current?.context;
    if (context && context.state !== "closed")
      void context.close().catch(() => {});
    audio.current = null;
  };

  useEffect(() => () => stop(), []);
  useEffect(() => {
    if (audio.current) audio.current.gain.gain.value = soundEnabled ? 0.6 : 0;
  }, [soundEnabled]);
  useEffect(() => {
    if (phase === "ready") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);
  useEffect(() => {
    if (phase === "off") {
      stop();
      setAudioUnavailable(false);
      powerButton.current?.focus({ preventScroll: true });
    }
    if (phase === "splash") skipButton.current?.focus({ preventScroll: true });
  }, [phase]);

  const finish = () => {
    try {
      sessionStorage.setItem(sessionKey, "yes");
    } catch {
      /* Optional convenience. */
    }
    onPhase("ready");
    requestAnimationFrame(() =>
      document.getElementById("eric")?.focus({ preventScroll: true }),
    );
  };
  const skip = () => {
    stop();
    finish();
  };
  const start = () => {
    stop();
    const run = generation.current;
    const reducedMotion = matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let recording = Promise.resolve(null);
    // Resume within the click gesture. Fetching/decoding alone never plays audio.
    if (soundEnabled) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        const context = new AudioContext();
        const gain = context.createGain();
        gain.gain.value = 0.6;
        gain.connect(context.destination);
        audio.current = { context, gain };
        const resumed = context.resume();
        recording = Promise.all([
          resumed,
          fetch("/assets/win98/startup.wav")
            .then((response) => {
              if (!response.ok)
                throw new Error("Startup recording unavailable");
              return response.arrayBuffer();
            })
            .then((data) => context.decodeAudioData(data)),
        ])
          .then(([, buffer]) => ({ context, gain, buffer }))
          .catch(() => {
            if (generation.current === run) setAudioUnavailable(true);
            return null;
          });
      } catch {
        setAudioUnavailable(true);
      }
    }
    const later = (delay, action) => {
      timers.current.push(
        setTimeout(() => {
          if (generation.current === run) action();
        }, delay),
      );
    };
    onPhase("splash");
    const revealAt = reducedMotion ? 500 : 1700;
    later(revealAt, () => {
      onPhase(reducedMotion ? "ready" : "shell");
      void recording.then((recording) => {
        if (!recording || generation.current !== run) return;
        const source = recording.context.createBufferSource();
        source.buffer = recording.buffer;
        source.connect(recording.gain);
        source.start();
      });
      if (reducedMotion) finish();
    });
    if (!reducedMotion) {
      later(2100, () => onPhase("icons"));
      later(2600, () => onPhase("windows"));
      later(4100, finish);
    }
  };

  if (phase === "ready") return null;
  return (
    <section
      className={`startup startup-${phase}`}
      aria-label="Computer startup"
    >
      {phase === "off" ? (
        <div className="power-dialog window active">
          <div className="title-bar">
            <Icon name="computer" size={16} />
            <h2>Welcome to Eric’s personal computer</h2>
          </div>
          <div className="power-content">
            <Icon name="computer" size={48} />
            <div>
              <h1>Ready when you are.</h1>
              <p>
                A Windows 98 desktop with a suspicious number of Linux commands.
              </p>
            </div>
          </div>
          <label className="boot-sound-option">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(event) => onSoundChange(event.target.checked)}
            />
            Play the original Windows 98 startup sound
          </label>
          <div className="power-actions">
            <button ref={powerButton} onClick={start}>
              Power on
            </button>
            <button onClick={skip}>Skip startup</button>
          </div>
        </div>
      ) : (
        <>
          {phase === "splash" && (
            <img
              className="boot-splash"
              src="/assets/win98/boot-splash.png"
              width="640"
              height="400"
              alt="Microsoft Windows 98 startup screen"
            />
          )}
          <div className="boot-actions">
            <span role="status">
              {audioUnavailable
                ? "Sound unavailable — starting desktop…"
                : phase === "splash"
                  ? "Starting Windows 98…"
                  : "Loading /home/eric… don’t tell Microsoft."}
            </span>
            <button ref={skipButton} onClick={skip}>
              Skip startup
            </button>
          </div>
        </>
      )}
    </section>
  );
}
