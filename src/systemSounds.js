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

export function readVolumePreference() {
  try {
    const raw = localStorage.getItem("eric-page-volume-v1");
    const value = Number(raw);
    return raw !== null && Number.isFinite(value)
      ? Math.max(0, Math.min(1, value))
      : 1;
  } catch {
    return 1;
  }
}
export function useSystemSounds(enabled, volume = 1) {
  const clips = useRef(new Map());
  useEffect(() => {
    try {
      localStorage.setItem("eric-system-sound-v1", enabled ? "on" : "off");
    } catch {
      /* Sound still works when storage is unavailable. */
    }
    try {
      localStorage.setItem("eric-page-volume-v1", String(volume));
    } catch {}
    for (const clip of clips.current.values()) clip.volume = 0.5 * volume;
    if (!enabled) for (const clip of clips.current.values()) clip.pause();
  }, [enabled, volume]);
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
        clip.volume = 0.5 * volume;
        clips.current.set(name, clip);
      }
      // Called by a click/key action. Never replay blocked audio on a later gesture.
      for (const other of clips.current.values())
        if (other !== clip) other.pause();
      clip.currentTime = 0;
      void clip.play().catch(() => {});
    },
    [enabled, volume],
  );
}
