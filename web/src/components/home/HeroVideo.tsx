"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * The skyline film: a looping full-bleed background behind the hero copy.
 *
 *  - Codec: AV1 → H.264; the browser plays the first one it supports.
 *  - Loops continuously, muted.
 *  - Reduced motion, Save-Data or blocked autoplay → a crisp still frame instead.
 */

const SRC = [
  { src: "/video/hero-skyline-1080.av1.mp4", type: 'video/mp4; codecs="av01.0.08M.08"' },
  { src: "/video/hero-skyline-1080.h264.mp4", type: 'video/mp4; codecs="avc1.640033"' },
];

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
  const [mode, setMode] = useState<"pending" | "video" | "still">("pending");

  // Tell the page the film has settled (the enquiry card listens for this).
  useEffect(() => {
    if (mode === "pending") return;
    const t = window.setTimeout(() => window.dispatchEvent(new Event("sw:film-settled")), mode === "still" ? 1200 : 600);
    return () => window.clearTimeout(t);
  }, [mode]);

  // Decide on the client what this device should get. The film waits for the page to finish
  // loading, so it never competes with the poster, fonts and scripts.
  useEffect(() => {
    if (!wrapRef.current || wrapRef.current.offsetParent === null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (reduce || conn?.saveData) {
      setMode("still");
      return;
    }
    const start = () => setMode("video");
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, []);

  // Start playback; fall back to the still if the browser refuses autoplay.
  useEffect(() => {
    if (mode !== "video") return;
    const v = videoRef.current;
    if (!v) return;
    v.load();
    const p = v.play();
    if (p) p.catch(() => setMode("still"));
  }, [mode]);

  return (
    <div ref={wrapRef} className={`pointer-events-none select-none ${blend ? "mix-blend-screen" : ""} ${className}`} style={style} aria-hidden>
      <div className="absolute inset-0">
        {/* The poster is in the first HTML response, so the hero paints immediately */}
        <Image src="/video/hero-skyline-poster.jpg" alt="" fill sizes="100vw" priority className="object-cover" />
        {mode === "video" ? (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            onError={() => setMode("still")}
            className="absolute inset-0 h-full w-full object-cover"
          >
            {SRC.map((s) => (
              <source key={s.src} src={s.src} type={s.type} />
            ))}
          </video>
        ) : null}
      </div>
    </div>
  );
}
