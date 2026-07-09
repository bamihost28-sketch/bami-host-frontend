import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TourStep {
  /** CSS selector of the element to highlight. */
  selector: string;
  title: string;
  content: string;
  /** Preferred tooltip placement relative to the target. Defaults to "bottom". */
  placement?: "top" | "bottom";
}

interface GuidedTourProps {
  steps: TourStep[];
  /** localStorage key used to remember that the tour was completed/skipped. */
  storageKey: string;
  /** Increment this (e.g. from a "Take a tour" button) to force-start the tour. */
  startSignal?: number;
  /** Auto-start the first time the user lands here. Defaults to true. */
  autoStart?: boolean;
}

const SPOTLIGHT_PADDING = 8;
const TIP_WIDTH = 330;
const GAP = 14;

export function GuidedTour({ steps, storageKey, startSignal = 0, autoStart = true }: GuidedTourProps) {
  const [running, setRunning] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const finish = useCallback(
    (markSeen = true) => {
      setRunning(false);
      setIndex(0);
      setRect(null);
      if (markSeen) {
        try {
          localStorage.setItem(storageKey, "1");
        } catch {
          /* ignore private-mode storage errors */
        }
      }
    },
    [storageKey],
  );

  const start = useCallback(() => {
    setIndex(0);
    setRunning(true);
  }, []);

  // Auto-start once per user (per storageKey).
  useEffect(() => {
    if (!autoStart) return;
    let seen = false;
    try {
      seen = localStorage.getItem(storageKey) === "1";
    } catch {
      seen = true;
    }
    if (seen) return;
    const t = setTimeout(start, 700);
    return () => clearTimeout(t);
  }, [autoStart, storageKey, start]);

  // Manual (re)start when the parent bumps startSignal.
  useEffect(() => {
    if (startSignal > 0) start();
  }, [startSignal, start]);

  // Locate + scroll the current target into view, then measure it.
  const measure = useCallback(() => {
    const step = steps[index];
    if (!step) return;
    const el = document.querySelector(step.selector) as HTMLElement | null;
    if (!el) {
      setRect(null);
      return;
    }
    setRect(el.getBoundingClientRect());
  }, [index, steps]);

  useLayoutEffect(() => {
    if (!running) return;
    const step = steps[index];
    const el = step ? (document.querySelector(step.selector) as HTMLElement | null) : null;
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    measure();
    // Re-measure after the smooth scroll settles.
    const t = setTimeout(measure, 380);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [running, index, measure, steps]);

  const next = useCallback(() => {
    setIndex((i) => {
      if (i >= steps.length - 1) {
        finish();
        return i;
      }
      return i + 1;
    });
  }, [steps.length, finish]);

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);

  useEffect(() => {
    if (!running) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, finish, next, prev]);

  if (!running) return null;
  const step = steps[index];
  if (!step) return null;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Tooltip position: below the target by default, above when there isn't room.
  let tipStyle: React.CSSProperties;
  if (rect) {
    const spaceBelow = vh - rect.bottom;
    const placeTop = step.placement === "top" || (spaceBelow < 240 && rect.top > spaceBelow);
    const left = Math.min(Math.max(rect.left + rect.width / 2 - TIP_WIDTH / 2, 12), vw - TIP_WIDTH - 12);
    tipStyle = placeTop
      ? { bottom: vh - rect.top + GAP, left, width: TIP_WIDTH }
      : { top: rect.bottom + GAP, left, width: TIP_WIDTH };
  } else {
    // Target missing — center the tooltip so the tour never dead-ends.
    tipStyle = { top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: TIP_WIDTH };
  }

  return createPortal(
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Guided tour">
      {/* Dimmer + spotlight. The box-shadow cuts a "hole" around the target. */}
      {rect ? (
        <div
          className="pointer-events-none fixed rounded-lg transition-all duration-300"
          style={{
            top: rect.top - SPOTLIGHT_PADDING,
            left: rect.left - SPOTLIGHT_PADDING,
            width: rect.width + SPOTLIGHT_PADDING * 2,
            height: rect.height + SPOTLIGHT_PADDING * 2,
            boxShadow: "0 0 0 9999px rgba(2,6,23,0.62)",
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-slate-950/60" />
      )}

      {/* Click-catcher so the page underneath isn't interactive mid-tour. */}
      <div className="fixed inset-0" onClick={() => finish()} />

      {/* Tooltip card */}
      <div
        className="fixed z-[101] rounded-xl border bg-background p-4 shadow-2xl animate-in fade-in zoom-in-95"
        style={tipStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-semibold leading-tight">{step.title}</h3>
          </div>
          <button
            onClick={() => finish()}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close tour"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">{step.content}</p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === index ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30",
                )}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {index > 0 && (
              <Button variant="ghost" size="sm" onClick={prev} className="h-8 px-2">
                <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                Back
              </Button>
            )}
            <Button size="sm" onClick={next} className="h-8">
              {index === steps.length - 1 ? (
                "Finish"
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>

        {index < steps.length - 1 && (
          <button
            onClick={() => finish()}
            className="mt-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Skip tour
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
