"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * The gold handshake film (AI-upscaled 4x, then encoded per device).
 *
 *  - Resolution: picks 1440p or 1080p from the real rendered size x device pixel ratio.
 *  - Codec: AV1 → HEVC → H.264; the browser plays the first one it supports.
 *  - Plays once, then rests on the final frame with a breathing gold glow.
 *  - Reduced motion, Save-Data or blocked autoplay → a crisp still of the final frame.
 *  - mix-blend-mode: screen on the (masked) wrapper makes the film's black vanish into the charcoal hero;
 *    it must sit on the wrapper, because a mask isolates its children from the backdrop.
 */

const SRC = (h: 1080 | 1440) => [
  { src: `/video/hero-handshake-${h}.av1.mp4`, type: 'video/mp4; codecs="av01.0.08M.08"' },
  { src: `/video/hero-handshake-${h}.hevc.mp4`, type: `video/mp4; codecs="hvc1.1.6.L${h === 1440 ? 150 : 120}.90"` },
  { src: `/video/hero-handshake-${h}.h264.mp4`, type: 'video/mp4; codecs="avc1.640033"' },
];

export function HeroVideo({ className = "", style, dockable = false }: { className?: string; style?: CSSProperties; dockable?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mode, setMode] = useState<"pending" | "video" | "still">("pending");
  const [tier, setTier] = useState<1080 | 1440>(1080);
  const [ended, setEnded] = useState(false);
  const [docked, setDocked] = useState(false);

  // Tell the page the film has settled (the enquiry card listens for this).
  useEffect(() => {
    if (!ended && mode !== "still") return;
    const t = window.setTimeout(() => window.dispatchEvent(new Event("sw:film-settled")), mode === "still" ? 1200 : 250);
    return () => window.clearTimeout(t);
  }, [ended, mode]);

  // Desktop: glide aside while the enquiry card is open, return when it closes.
  useEffect(() => {
    if (!dockable) return;
    const open = () => setDocked(true);
    const close = () => setDocked(false);
    window.addEventListener("sw:quick-open", open);
    window.addEventListener("sw:quick-close", close);
    return () => {
      window.removeEventListener("sw:quick-open", open);
      window.removeEventListener("sw:quick-close", close);
    };
  }, [dockable]);

  // Decide once, on the client, what this device should get.
  useEffect(() => {
    // Only the layout that is actually visible (mobile or desktop) loads anything.
    if (!wrapRef.current || wrapRef.current.offsetParent === null) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (reduce || conn?.saveData) {
      setMode("still");
      return;
    }
    const w = wrapRef.current?.getBoundingClientRect().width ?? window.innerWidth;
    const h = wrapRef.current?.getBoundingClientRect().height ?? 0;
    // object-cover may scale the 16:9 film beyond the box width; account for that.
    const coverWidth = Math.max(w, (h * 16) / 9);
    setTier(coverWidth * Math.min(window.devicePixelRatio || 1, 3) > 2000 ? 1440 : 1080);
    setMode("video");
  }, []);

  // Start playback; fall back to the still if the browser refuses autoplay.
  useEffect(() => {
    if (mode !== "video") return;
    const v = videoRef.current;
    if (!v) return;
    v.load();
    const p = v.play();
    if (p) p.catch(() => setMode("still"));
  }, [mode, tier]);

  return (
    <div ref={wrapRef} className={`pointer-events-none select-none mix-blend-screen ${className}`} style={style} aria-hidden>
      <div className={`film-stage absolute inset-0 ${docked ? "is-docked" : ""}`}>
      {mode === "still" ? (
        <Image
          src="/video/hero-handshake-end-2560.jpg"
          alt=""
          fill
          sizes="(min-width: 1024px) 64vw, 100vw"
          className="object-cover"
        />
      ) : mode === "video" ? (
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          preload="auto"
          disablePictureInPicture
          disableRemotePlayback
          poster="/video/hero-handshake-poster.jpg"
          onEnded={() => setEnded(true)}
          onError={() => setMode("still")}
          className="absolute inset-0 h-full w-full object-cover"
        >
          {SRC(tier).map((s) => (
            <source key={s.src} src={s.src} type={s.type} />
          ))}
        </video>
      ) : null}

      {/* Breathing glow around the ring once the film has settled (or on the still) */}
      <div
        className={`hero-glow absolute left-[50.5%] top-1/2 aspect-square h-[71%] rounded-full transition-opacity duration-1000 ${
          ended || mode === "still" ? "opacity-100" : "opacity-0"
        }`}
      />
      </div>
    </div>
  );
}
