"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Posisi sheet sebagai porsi tinggi layar yang TERTUTUP (0 = penuh). */
const SNAPS = [0.08, 0.45, 0.82] as const; // penuh, separuh, kuncup
type SnapIndex = 0 | 1 | 2;

export default function Sheet({
  children,
  title,
  initial = 1,
  onCoverChange,
}: {
  children: ReactNode;
  title: string;
  initial?: SnapIndex;
  /** Melapor berapa piksel layar yang tertutup sheet, supaya peta bisa
   *  menyesuaikan area pas-nya dan marker tidak tersembunyi. */
  onCoverChange?: (px: number) => void;
}) {
  const [snap, setSnap] = useState<SnapIndex>(initial);
  const [drag, setDrag] = useState<number | null>(null);
  const startY = useRef(0);
  const startOffset = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);

  const offset = drag ?? SNAPS[snap];

  useEffect(() => setDrag(null), [snap]);

  // Laporkan tinggi tertutup hanya saat posisi mengunci (bukan tiap frame drag).
  useEffect(() => {
    if (!onCoverChange) return;
    const lapor = () =>
      onCoverChange(Math.round(window.innerHeight * (1 - SNAPS[snap])));
    lapor();
    window.addEventListener("resize", lapor);
    return () => window.removeEventListener("resize", lapor);
  }, [snap, onCoverChange]);

  function onStart(clientY: number) {
    startY.current = clientY;
    startOffset.current = SNAPS[snap];
    setDrag(SNAPS[snap]);
  }

  function onMove(clientY: number) {
    if (drag === null) return;
    const dy = (clientY - startY.current) / window.innerHeight;
    setDrag(Math.min(0.92, Math.max(0.04, startOffset.current + dy)));
  }

  function onEnd() {
    if (drag === null) return;
    // snap ke posisi terdekat
    let best: SnapIndex = 0;
    let bestD = Infinity;
    SNAPS.forEach((s, i) => {
      const d = Math.abs(s - drag);
      if (d < bestD) {
        bestD = d;
        best = i as SnapIndex;
      }
    });
    setSnap(best);
  }

  function cycle() {
    setSnap((s) => ((s === 2 ? 1 : s === 1 ? 0 : 2) as SnapIndex));
  }

  return (
    <div
      className={`sheet ${drag !== null ? "sheet-dragging" : ""} fixed inset-x-0 bottom-0 z-[1050] flex flex-col rounded-t-2xl border-t border-hairline bg-surface shadow-[0_-8px_30px_rgba(0,0,0,0.18)] md:hidden`}
      style={{
        height: "100dvh",
        transform: `translateY(${offset * 100}%)`,
      }}
      role="dialog"
      aria-label={title}
    >
      {/* Handle: bisa ditarik, bisa diketuk, bisa dipakai keyboard */}
      <button
        className="tap flex w-full shrink-0 cursor-grab flex-col items-center gap-1 rounded-t-2xl pb-1 pt-2 active:cursor-grabbing"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          onStart(e.clientY);
        }}
        onPointerMove={(e) => onMove(e.clientY)}
        onPointerUp={onEnd}
        onPointerCancel={onEnd}
        onClick={cycle}
        aria-label={`${title} — ketuk untuk ubah tinggi panel`}
      >
        <span className="h-1.5 w-10 rounded-full bg-axis" aria-hidden="true" />
        <span className="text-xs font-semibold text-ink2">{title}</span>
      </button>

      <div
        ref={bodyRef}
        className="scroll-y safe-b min-h-0 flex-1 px-4 pb-20"
        // saat sheet belum penuh, cegah scroll isi supaya drag terasa natural
        style={{ touchAction: snap === 0 ? "pan-y" : "none" }}
      >
        {children}
      </div>
    </div>
  );
}
