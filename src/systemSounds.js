import { useCallback, useEffect, useRef } from "react";

const recordings = {
  error: "chord",
  alert: "chord",
  notice: "ding",
  beep: "ding",
  navigate: "start",
};
export function readSoundPreference() {
  try {
    return localStorage.getItem("eric-system-sound-v1") !== "off";
  } catch {
    return true;
  }
}

export function useSystemSounds(enabled) {
  const clips = useRef(new Map());
  useEffect(() => {
    try {
      localStorage.setItem("eric-system-sound-v1", enabled ? "on" : "off");
    } catch {
      /* Sound still works when storage is unavailable. */
    }
    if (!enabled) for (const clip of clips.current.values()) clip.pause();
  }, [enabled]);
  useEffect(
    () => () => {
      for (const clip of clips.current.values()) clip.pause();
    },
    [],
  );
  return useCallback(
    (kind = "alert") => {
      if (!enabled) return;
      const name = recordings[kind] || recordings.alert;
      let clip = clips.current.get(name);
      if (!clip) {
        clip = new Audio(`/assets/win98/sounds/${name}.wav`);
        clip.volume = 0.5;
        clips.current.set(name, clip);
      }
      // Called by a click/key action. Never replay blocked audio on a later gesture.
      for (const other of clips.current.values())
        if (other !== clip) other.pause();
      clip.currentTime = 0;
      void clip.play().catch(() => {});
    },
    [enabled],
  );
}
