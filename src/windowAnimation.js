import { useEffect, useRef } from "react";
import { flushSync } from "react-dom";

export const CAPTION_DURATION = 250;

const captionRect = (element) =>
  element.querySelector(".title-bar").getBoundingClientRect();
const taskRect = (id, height) => {
  const button = document.querySelector(`[data-program="${id}"]`);
  if (!button) return null;
  const r = button.getBoundingClientRect();
  return {
    left: r.left + 2,
    top: r.top + 2,
    width: r.width - 4,
    height: Math.min(height, r.height - 4),
  };
};

// DrawAnimatedRects / IDANI_CAPTION moves a caption, not a scaled window.
// Measured against Windows 98 running in v86; see window-asset-provenance.md.
function flyCaption(element, from, to, complete) {
  const caption = element.querySelector(".title-bar").cloneNode(true);
  caption.classList.add("flying-caption");
  caption.querySelector(".title-bar-controls")?.remove();
  for (const child of caption.querySelectorAll("[id]"))
    child.removeAttribute("id");
  caption.setAttribute("aria-hidden", "true");
  caption.inert = true;
  const draw = (fraction) => {
    for (const key of ["left", "top", "width", "height"])
      caption.style[key] =
        `${Math.round(from[key] + (to[key] - from[key]) * fraction)}px`;
  };
  draw(0);
  document.body.append(caption);
  const start = performance.now();
  let raf,
    finished = false;
  const finish = (commit = true) => {
    if (finished) return;
    finished = true;
    cancelAnimationFrame(raf);
    if (commit) complete();
    caption.remove();
  };
  const tick = (now) => {
    const progress = Math.min(1, (now - start) / CAPTION_DURATION);
    draw(progress);
    if (progress < 1) raf = requestAnimationFrame(tick);
    else finish();
  };
  raf = requestAnimationFrame(tick);
  return finish;
}

export function useWindowActions(state) {
  const latest = useRef(state);
  latest.current = state;
  const transition = useRef(null);
  const queue = useRef([]);
  const generation = useRef(0);
  const run = useRef(null);
  const cancel = () => {
    generation.current += 1;
    queue.current = [];
    transition.current?.(false);
    transition.current = null;
  };
  useEffect(() => {
    const finishOnResize = () => {
      queue.current = [];
      transition.current?.();
    };
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    window.addEventListener("resize", finishOnResize);
    motion.addEventListener("change", finishOnResize);
    return () => {
      cancel();
      window.removeEventListener("resize", finishOnResize);
      motion.removeEventListener("change", finishOnResize);
    };
  }, []);

  run.current = (action, id) => {
    if (transition.current) {
      queue.current.push([action, id]);
      return;
    }
    const current = latest.current;
    const element = document.getElementById(id);
    const hidden = current.minimized.includes(id);
    const closed = current.closed.includes(id);
    if ((action === "minimize" || action === "maximize") && (closed || hidden))
      return;
    const commit = () => {
      flushSync(() => latest.current[action](id));
      transition.current = null;
      // React has committed the next state before a queued action reads it.
      const next = queue.current.shift();
      const currentGeneration = generation.current;
      if (next)
        queueMicrotask(() => {
          if (generation.current === currentGeneration) run.current(...next);
        });
    };
    const animate =
      element &&
      !closed &&
      (action === "minimize" ||
        action === "maximize" ||
        (action === "open" && hidden));
    if (!animate || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      commit();
      return;
    }

    let from, to;
    const previousScroll = { left: scrollX, top: scrollY, behavior: "instant" };
    if (action === "open") {
      element.hidden = false;
      to = captionRect(element);
      element.hidden = true;
      from = taskRect(id, to.height);
    } else {
      from = captionRect(element);
      if (action === "minimize") to = taskRect(id, from.height);
      else {
        const wasMaximized = current.maximized.includes(id);
        const oldTransform = element.style.transform;
        const offset = current.offsets[id] || { x: 0, y: 0 };
        element.classList.toggle("maximized", !wasMaximized);
        element.style.transform = wasMaximized
          ? `translate(${offset.x}px, ${offset.y}px)`
          : "none";
        to = captionRect(element);
        element.classList.toggle("maximized", wasMaximized);
        element.style.transform = oldTransform;
      }
    }
    window.scrollTo(previousScroll);
    if (!from || !to) {
      commit();
      return;
    }
    transition.current = flyCaption(element, from, to, commit);
  };
  return { dispatch: (action, id) => run.current(action, id), cancel };
}
