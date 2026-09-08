import React, { useEffect, useId, useRef, useState } from "react";

// Keep the browser's actual scroll surface (including iframe wheel/touch input).
// Only the scrollbar furniture is replaced. All dimensions are CSS pixels.
export default function ClassicScrollbars({
  viewportRef,
  iframe = false,
  alwaysVertical = false,
  revision = 0,
  label = "Window",
}) {
  const [metrics, setMetrics] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    fullWidth: 0,
    fullHeight: 0,
  });
  const target = useRef(null);
  const stopRepeat = useRef(() => {});
  const id = useId();
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let detach = () => {};
    const attach = () => {
      detach();
      const doc = iframe ? viewport.contentDocument : document;
      const scroll = iframe ? doc?.scrollingElement : viewport;
      if (!scroll) return;
      target.current = scroll;
      const host = viewport.parentElement;
      let sheet;
      if (iframe) {
        sheet = doc.createElement("style");
        sheet.textContent =
          "html { scrollbar-width: none !important; } html::-webkit-scrollbar { display: none !important; }";
        doc.head.append(sheet);
      }
      scroll.id ||= `scroll-${id}`;
      let raf;
      const measure = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const next = {
            x: scroll.scrollLeft,
            y: scroll.scrollTop,
            width: scroll.clientWidth,
            height: scroll.clientHeight,
            fullWidth: scroll.scrollWidth,
            fullHeight: scroll.scrollHeight,
          };
          host.dataset.scrollX = String(next.fullWidth > next.width + 1);
          host.dataset.scrollY = String(
            alwaysVertical || next.fullHeight > next.height + 1,
          );
          setMetrics((old) =>
            Object.keys(next).every((key) => old[key] === next[key])
              ? old
              : next,
          );
        });
      };
      const surface = iframe ? doc.defaultView : scroll;
      surface.addEventListener("scroll", measure, { passive: true });
      scroll.addEventListener("load", measure, true);
      const resize = new ResizeObserver(measure);
      resize.observe(viewport);
      const observeContent = () => {
        for (const child of iframe ? doc.body.children : scroll.children)
          resize.observe(child);
        if (iframe) resize.observe(doc.body);
      };
      observeContent();
      const mutation = new MutationObserver(() => {
        observeContent();
        measure();
      });
      mutation.observe(iframe ? doc.body : scroll, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      measure();
      detach = () => {
        cancelAnimationFrame(raf);
        resize.disconnect();
        mutation.disconnect();
        sheet?.remove();
        surface.removeEventListener("scroll", measure);
        scroll.removeEventListener("load", measure, true);
        target.current = null;
      };
    };
    attach();
    if (iframe) viewport.addEventListener("load", attach);
    return () => {
      detach();
      viewport.removeEventListener("load", attach);
      stopRepeat.current();
    };
  }, [viewportRef, iframe, alwaysVertical, revision, id]);

  const move = (axis, amount, absolute = false) => {
    const scroll = target.current;
    if (scroll)
      scroll[axis === "x" ? "scrollLeft" : "scrollTop"] = absolute
        ? amount
        : scroll[axis === "x" ? "scrollLeft" : "scrollTop"] + amount;
  };
  const repeat = (event, action) => {
    if (event.button !== 0) return;
    event.preventDefault();
    stopRepeat.current();
    event.currentTarget.setPointerCapture(event.pointerId);
    action();
    let interval;
    const delay = setTimeout(() => {
      interval = setInterval(action, 50);
    }, 400);
    stopRepeat.current = () => {
      clearTimeout(delay);
      clearInterval(interval);
    };
  };
  const release = () => stopRepeat.current();
  const rail = (axis) => {
    const vertical = axis === "y";
    const view = metrics[vertical ? "height" : "width"];
    const total = metrics[vertical ? "fullHeight" : "fullWidth"];
    const max = Math.max(0, total - view);
    const position = Math.max(0, Math.min(max, metrics[axis]));
    const track = Math.max(0, view - 32);
    const thumb = Math.min(
      track,
      Math.max(8, Math.round((track * view) / (total || 1))),
    );
    const travel = track - thumb;
    const pixel = max ? Math.round((position / max) * travel) : 0;
    const directions = vertical ? ["up", "down"] : ["left", "right"];
    return (
      <div
        className={`classic-scrollbar ${vertical ? "vertical" : "horizontal"}`}
        key={axis}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
      >
        <button
          className={`scroll-arrow ${directions[0]}`}
          aria-label={`${label}: scroll ${directions[0]}`}
          disabled={!max}
          onPointerDown={(e) => repeat(e, () => move(axis, -16))}
          onClick={(e) => {
            if (e.detail === 0) move(axis, -16);
          }}
        />
        <div
          className="scroll-track"
          onPointerDown={(e) => {
            if (e.target !== e.currentTarget || !max) return;
            const trackElement = e.currentTarget;
            const point = vertical ? e.clientY : e.clientX;
            const direction =
              point <
              trackElement.getBoundingClientRect()[vertical ? "top" : "left"] +
                pixel
                ? -1
                : 1;
            repeat(e, () => {
              const scroll = target.current;
              if (!scroll) return;
              const current =
                (scroll[vertical ? "scrollTop" : "scrollLeft"] / max) * travel;
              const at =
                point -
                trackElement.getBoundingClientRect()[vertical ? "top" : "left"];
              if (direction < 0 ? at < current : at > current + thumb)
                move(axis, direction * Math.max(16, view - 16));
            });
          }}
        >
          {max > 0 && (
            <div
              className="scroll-thumb"
              role="scrollbar"
              tabIndex="0"
              aria-label={`${label}: ${vertical ? "vertical" : "horizontal"} scrollbar`}
              aria-controls={target.current?.id || `scroll-${id}`}
              aria-orientation={vertical ? "vertical" : "horizontal"}
              aria-valuemin={0}
              aria-valuemax={Math.round(max)}
              aria-valuenow={Math.round(position)}
              style={
                vertical
                  ? { height: thumb, top: pixel }
                  : { width: thumb, left: pixel }
              }
              onKeyDown={(e) => {
                const amount = {
                  ArrowUp: -16,
                  ArrowLeft: -16,
                  ArrowDown: 16,
                  ArrowRight: 16,
                  PageUp: -view,
                  PageDown: view,
                }[e.key];
                if (
                  amount !== undefined ||
                  e.key === "Home" ||
                  e.key === "End"
                ) {
                  e.preventDefault();
                  move(
                    axis,
                    e.key === "Home" ? 0 : e.key === "End" ? max : amount,
                    amount === undefined,
                  );
                }
              }}
              onPointerDown={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();
                release();
                const start = vertical ? e.clientY : e.clientX;
                const el = e.currentTarget;
                el.focus({ preventScroll: true });
                el.setPointerCapture(e.pointerId);
                const drag = (event) =>
                  move(
                    axis,
                    position +
                      (((vertical ? event.clientY : event.clientX) - start) *
                        max) /
                        (travel || 1),
                    true,
                  );
                const end = () => {
                  el.removeEventListener("pointermove", drag);
                  el.removeEventListener("lostpointercapture", end);
                };
                el.addEventListener("pointermove", drag);
                el.addEventListener("lostpointercapture", end);
              }}
            />
          )}
        </div>
        <button
          className={`scroll-arrow ${directions[1]}`}
          aria-label={`${label}: scroll ${directions[1]}`}
          disabled={!max}
          onPointerDown={(e) => repeat(e, () => move(axis, 16))}
          onClick={(e) => {
            if (e.detail === 0) move(axis, 16);
          }}
        />
      </div>
    );
  };
  return (
    <>
      {rail("y")}
      {rail("x")}
      <div className="scroll-corner" aria-hidden="true" />
    </>
  );
}
