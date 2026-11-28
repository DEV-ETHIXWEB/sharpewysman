"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * The skyline film: a looping full-bleed background behind the hero copy.
 *
 *  - Desktop / landscape: AV1 → H.264 at 1080p; the browser plays the first one it supports.
 *  - Phones (portrait, < 768px): a portrait centre-crop in H.264 (~600 KB), which every phone
 *    decodes in hardware. The mobile hero only ever shows that centre strip anyway.
 *  - The poster is always painted underneath, so the hero never flashes empty; the film fades
 *    in over it once it is actually playing.
 *  - If autoplay is refused (iOS Low Power Mode, in-app browsers like Slack/Instagram), the
 *    poster stays and the film starts on the visitor's first touch, scroll or key press.
 *  - Pauses while the hero is off screen, so scrolling the rest of the page stays smooth.
 *  - Reduced motion or Save-Data → the still frame only.
 */

type Source = { src: string; type: string };

const DESKTOP: Source[] = [
  { src: "/video/hero-skyline-1080.av1.mp4", type: 'video/mp4; codecs="av01.0.08M.08"' },
  { src: "/video/hero-skyline-1080.h264.mp4", type: 'video/mp4; codecs="avc1.640033"' },
];

const MOBILE: Source[] = [{ src: "/video/hero-skyline-mobile.h264.mp4", type: 'video/mp4; codecs="avc1.4d0028"' }];

const MOBILE_QUERY = "(max-width: 767px) and (orientation: portrait)";

/** Interactions that count as a user gesture for media playback. */
const GESTURES = ["touchstart", "touchend", "pointerdown", "click", "keydown", "scroll"] as const;

export function HeroVideo({
  className = "",
  style,
  blend = true,
}: {
  className?: string;
  style?: CSSProperties;
  /** Screen-blends the film into the charcoal background. Turn off for a full-bleed background video. */
  blend?: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [sources, setSources] = useState<Source[] | null>(null);
  const [mode, setMode] = useState<"pending" | "video" | "still">("pending");
  const [playing, setPlaying] = useState(false);

  // Tell the page the film has settled (the enquiry card listens for this).
  useEffect(() => {
    if (mode === "pending") return;
    const t = window.setTimeout(() => window.dispatchEvent(new Event("sw:film-settled")), mode === "still" ? 1200 : 600);
    return () => window.clearTimeout(t);
  }, [mode]);

  // Decide on the client what this device should get. The film waits for the page to finish
  // loading (or 3s, whichever is first), so it never competes with the poster, fonts and scripts.
  useEffect(() => {
    if (!wrapRef.current || wrapRef.current.offsetParent === null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (reduce || conn?.saveData) {
      setMode("still");
      return;
    }
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      setSources(window.matchMedia(MOBILE_QUERY).matches ? MOBILE : DESKTOP);
      setMode("video");
    };
    if (document.readyState === "complete") {
      start();
      return;
    }
    window.addEventListener("load", start, { once: true });
    const cap = window.setTimeout(start, 3000);
    return () => {
      window.removeEventListener("load", start);
      window.clearTimeout(cap);
    };
  }, []);

  // Start playback. If the browser refuses autoplay, keep the poster and retry on the first
  // gesture. Pause when the hero scrolls out of view or the tab is hidden; resume when it's back.
  useEffect(() => {
    if (mode !== "video") return;
    const v = videoRef.current;
    if (!v) return;

    // iOS only autoplays a video that is muted at the moment play() is called. React does not
    // reflect `muted` as an attribute, so set every form of it explicitly.
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.setAttribute("webkit-playsinline", "");

    let inView = true;
    let blocked = false;

    const removeGestures = () => GESTURES.forEach((e) => window.removeEventListener(e, onGesture));
    const tryPlay = () => {
      if (!inView || document.hidden) return;
      const p = v.play();
      if (!p) return;
      p.then(
        () => {
          blocked = false;
          removeGestures();
        },
        (err: DOMException) => {
          // AbortError just means a pause() interrupted play(); not a refusal.
          if (err?.name === "AbortError" || blocked) return;
          blocked = true;
          GESTURES.forEach((e) => window.addEventListener(e, onGesture, { passive: true }));
        },
      );
    };
    function onGesture() {
      blocked = false;
      tryPlay();
    }

    const onVisibility = () => (document.hidden ? v.pause() : tryPlay());
    document.addEventListener("visibilitychange", onVisibility);

    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            if (inView) tryPlay();
            else v.pause();
          })
        : null;
    if (io && wrapRef.current) io.observe(wrapRef.current);

    v.load();
    tryPlay();

    return () => {
      io?.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      removeGestures();
    };
  }, [mode, sources]);

  return (
    <div ref={wrapRef} className={`pointer-events-none select-none ${blend ? "mix-blend-screen" : ""} ${className}`} style={style} aria-hidden>
      <div className="absolute inset-0">
        {/* The poster is in the first HTML response, so the hero paints immediately */}
        <Image src="/video/hero-skyline-poster.jpg" alt="" fill sizes="100vw" priority quality={55} className="object-cover" />
        {mode === "video" && sources ? (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            onPlaying={() => setPlaying(true)}
            onError={() => setMode("still")}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
          >
            {sources.map((s, i) => (
              <source
                key={s.src}
                src={s.src}
                type={s.type}
                // A <source> failing doesn't fire the video's onError; if the last one fails, fall back to the still.
                onError={i === sources.length - 1 ? () => setMode("still") : undefined}
              />
            ))}
          </video>
        ) : null}
      </div>
    </div>
  );
}
