"use client";

import React, { useEffect, useRef } from "react";

interface Drop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
}

export function AnimatedWaterCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Initialize rain drops
    const drops: Drop[] = [];
    const dropCount = Math.min(60, Math.floor(width / 20));
    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        length: 12 + Math.random() * 16,
        speed: 4 + Math.random() * 5,
        opacity: 0.2 + Math.random() * 0.4,
      });
    }

    // Expanding ripples on ground
    const ripples: Ripple[] = [];

    const handlePointerMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (Math.random() > 0.4) {
        ripples.push({
          x,
          y,
          radius: 2,
          maxRadius: 28 + Math.random() * 20,
          opacity: 0.8,
          speed: 1.2 + Math.random() * 0.8,
        });
      }
    };

    canvas.parentElement?.addEventListener("mousemove", handlePointerMove);

    // Main render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw falling raindrops
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i];
        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - 1, d.y + d.length);
        ctx.strokeStyle = `rgba(34, 211, 238, ${d.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        d.y += d.speed;
        d.x -= 0.4; // subtle wind drift

        if (d.y > height - 30) {
          // Splash ripple
          if (Math.random() > 0.6) {
            ripples.push({
              x: d.x,
              y: height - 15 + Math.random() * 10,
              radius: 1,
              maxRadius: 18 + Math.random() * 16,
              opacity: 0.6,
              speed: 0.9 + Math.random() * 0.6,
            });
          }
          d.y = -d.length;
          d.x = Math.random() * (width + 50);
        }
      }

      // 2. Draw expanding ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        ctx.beginPath();
        // Draw ellipse for perspective
        ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(52, 211, 153, ${r.opacity})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        r.radius += r.speed;
        r.opacity -= 0.016;

        if (r.opacity <= 0 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.parentElement?.removeEventListener("mousemove", handlePointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none select-none ${className}`}
      style={{ display: "block" }}
    />
  );
}

