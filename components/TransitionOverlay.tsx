"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useTransitionStore } from "@/store/transitionStore";

type Phase = "idle" | "covering" | "covered" | "revealing";

export function TransitionOverlay() {
  const { active, x, y, target, color, reset } = useTransitionStore();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");

  useEffect(() => {
    if (!active || phase !== "idle") return;
    const start = setTimeout(() => setPhase("covering"), 0);
    const cover = setTimeout(() => {
      if (target) router.push(target);
      setPhase("covered");
    }, 550);
    return () => {
      clearTimeout(start);
      clearTimeout(cover);
    };
  }, [active, phase, router, target]);

  useEffect(() => {
    if (phase !== "covered") return;
    const t2 = setTimeout(() => setPhase("revealing"), 200);
    return () => clearTimeout(t2);
  }, [phase]);

  useEffect(() => {
    if (phase !== "revealing") return;
    const t3 = setTimeout(() => {
      setPhase("idle");
      reset();
    }, 550);
    return () => clearTimeout(t3);
  }, [phase, reset]);

  if (phase === "idle") return null;

  const size =
    typeof window !== "undefined" ? Math.hypot(window.innerWidth, window.innerHeight) * 2.3 : 3000;
  const expanded = phase === "covering" || phase === "covered";

  return (
    <div className="pointer-events-none fixed inset-0 z-[999] overflow-hidden">
      <motion.div
        className="absolute rounded-full"
        style={{ left: x, top: y, backgroundColor: color, x: "-50%", y: "-50%" }}
        initial={{ width: 0, height: 0 }}
        animate={{ width: expanded ? size : 0, height: expanded ? size : 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}
