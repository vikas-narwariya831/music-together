import React, { useEffect, useRef } from 'react';

export default function AudioVisualizer({ 
  isPlaying = false, 
  isBackground = false, 
  moodProfile
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Defaults if profile not provided
  const family = moodProfile?.family ?? 0;
  const colors = moodProfile?.colors ?? ['#f43f5e', '#e11d48', '#fb7185', '#881337'];
  const baseSpeed = moodProfile?.pulseSpeed ?? 0.055;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    let phase = 0;

    // Pre-seed 60 particles for particle engines
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * (canvas.width || 800),
      y: Math.random() * (canvas.height || 200),
      radius: Math.random() * 2.5 + 1,
      speedX: (Math.random() - 0.5) * 1.5,
      speedY: -Math.random() * 1.8 - 0.4,
      seed: Math.random() * 100,
      opacity: Math.random() * 0.7 + 0.3
    }));

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const dpr = window.devicePixelRatio || 1;
      phase += isPlaying ? baseSpeed : 0.01;

      // ========================================================
      // AUTOMATIC ALGORITHMIC WAVE FAMILIES BASED ON MOOD
      // ========================================================

      // FAMILY 0: Equalizer Studio Bars (Upbeat Studio)
      if (family === 0) {
        const barWidth = 3 * dpr;
        const gap = 3.5 * dpr;
        const barCount = Math.floor(width / (barWidth + gap));
        const totalW = barCount * (barWidth + gap);
        const offsetX = (width - totalW) / 2;

        for (let i = 0; i < barCount; i++) {
          const normX = i / barCount;
          const bell = Math.sin(normX * Math.PI);
          const w = Math.sin(phase * 1.8 + i * 0.16) * 0.5 + Math.cos(phase * 2.4 + i * 0.3) * 0.3;
          const barH = isPlaying ? Math.max(4 * dpr, Math.abs(w) * Math.pow(bell, 0.7) * (height * 0.88)) : (4 + Math.sin(phase + i * 0.1) * 3) * dpr;
          const x = offsetX + i * (barWidth + gap);
          const y = height - barH;

          const grad = ctx.createLinearGradient(0, y, 0, height);
          grad.addColorStop(0, colors[0]);
          grad.addColorStop(0.6, colors[1]);
          grad.addColorStop(1, 'rgba(0,0,0,0.05)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(x, y, barWidth, barH, barWidth / 2);
          else ctx.rect(x, y, barWidth, barH);
          ctx.fill();
        }
      }

      // FAMILY 1: Liquid Silk Waves (Romantic, gentle, dreamy)
      else if (family === 1) {
        for (let layer = 0; layer < 3; layer++) {
          ctx.beginPath();
          ctx.moveTo(0, height);
          const freq = 0.006 + layer * 0.004;
          const speed = 1.2 + layer * 0.6;
          const amp = isPlaying ? (0.45 - layer * 0.08) : 0.1;

          for (let x = 0; x <= width; x += 4) {
            const bell = Math.sin((x / width) * Math.PI);
            const yOffset = Math.sin(x * freq + phase * speed + layer * 1.8) * (height * amp * (isPlaying ? bell : 1));
            ctx.lineTo(x, height * 0.6 + yOffset);
          }
          ctx.lineTo(width, height);
          ctx.closePath();
          ctx.fillStyle = (colors[layer % colors.length] || colors[0]) + '45';
          ctx.fill();
        }
      }

      // FAMILY 2: Stereo Pulse (Melancholic, sad, deep heartbreak)
      else if (family === 2) {
        const barWidth = 3.5 * dpr;
        const gap = 4 * dpr;
        const barCount = Math.floor(width / (barWidth + gap));
        const offsetX = (width - (barCount * (barWidth + gap))) / 2;
        const centerY = height / 2;

        for (let i = 0; i < barCount; i++) {
          const normDist = Math.abs((i / barCount) - 0.5) * 2;
          const bell = Math.cos(normDist * (Math.PI / 2));
          const beat = Math.abs(Math.sin(phase * 1.6 + i * 0.15) + Math.cos(phase * 0.9 - i * 0.2));
          const h = isPlaying ? Math.max(6, beat * bell * (height * 0.8)) : (4 + Math.sin(phase + i * 0.2) * 3) * dpr;

          const x = offsetX + i * (barWidth + gap);
          const y = centerY - (h / 2);

          const grad = ctx.createLinearGradient(0, y, 0, y + h);
          grad.addColorStop(0, colors[0]);
          grad.addColorStop(0.5, colors[1]);
          grad.addColorStop(1, colors[2] || colors[0]);

          ctx.fillStyle = grad;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(x, y, barWidth, h, barWidth / 2);
          else ctx.rect(x, y, barWidth, h);
          ctx.fill();
        }
      }

      // FAMILY 3: Stardust Nebula (Lo-Fi, chill, late night)
      else if (family === 3) {
        particles.forEach((p, idx) => {
          if (isPlaying) {
            p.y += p.speedY * 1.3;
            p.x += Math.sin(phase + p.seed) * 1.4;
          } else {
            p.y += p.speedY * 0.25;
          }
          if (p.y < 0) { p.y = height; p.x = Math.random() * width; }
          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * (isPlaying ? 1.4 : 1), 0, Math.PI * 2);
          ctx.fillStyle = colors[idx % colors.length];
          ctx.shadowBlur = 10;
          ctx.shadowColor = colors[0];
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // FAMILY 5: Cyber Pixel Grid (Punjabi, Drill, Hip-Hop swagger)
      else if (family === 5) {
        const cols = 36;
        const rows = 10;
        const colW = (width / cols) - 3;
        const rowH = (height / rows) - 2.5;

        for (let c = 0; c < cols; c++) {
          const bell = Math.sin((c / cols) * Math.PI);
          const activeRows = isPlaying 
            ? Math.floor((Math.abs(Math.sin(phase * 2.8 + c * 0.35)) * bell) * rows)
            : Math.floor(Math.abs(Math.sin(phase + c * 0.2)) * 2) + 1;

          for (let r = 0; r < activeRows; r++) {
            const x = c * (colW + 3);
            const y = height - (r + 1) * (rowH + 2.5);
            ctx.fillStyle = r > rows * 0.65 ? colors[0] : colors[1];
            ctx.fillRect(x, y, colW, rowH);
          }
        }
      }

      // FAMILY 7: DNA Acoustic Helix (Sufi, devotional soul)
      else if (family === 7) {
        const nodes = 32;
        const step = width / nodes;

        for (let n = 0; n < nodes; n++) {
          const x = n * step;
          const bell = Math.sin((n / nodes) * Math.PI);
          const amp = isPlaying ? height * 0.35 * bell : 10;
          const y1 = height * 0.55 + Math.sin(phase * 2 + n * 0.3) * amp;
          const y2 = height * 0.55 - Math.sin(phase * 2 + n * 0.3) * amp;

          ctx.strokeStyle = 'rgba(255,255,255,0.15)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x, y2);
          ctx.stroke();

          ctx.fillStyle = colors[0];
          ctx.beginPath();
          ctx.arc(x, y1, 3.5 * dpr, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = colors[1];
          ctx.beginPath();
          ctx.arc(x, y2, 3.5 * dpr, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // FAMILY 8: Volumetric Fountain (Party & High Energy Dance)
      else if (family === 8) {
        particles.slice(0, 48).forEach((p, i) => {
          const colX = (i / 48) * width;
          const bell = Math.sin((i / 48) * Math.PI);
          const bounceH = isPlaying 
            ? Math.abs(Math.sin(phase * 3.2 + i * 0.25)) * bell * (height * 0.88)
            : Math.sin(phase + i * 0.2) * 12 + 15;

          const y = height - bounceH;
          ctx.fillStyle = colors[i % colors.length];
          ctx.beginPath();
          ctx.arc(colX, y, 4 * dpr, 0, Math.PI * 2);
          ctx.shadowBlur = 12;
          ctx.shadowColor = colors[0];
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      }

      // FALLBACK: Ambient Dynamic Silk Wave
      else {
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 8) {
          const bell = Math.sin((x / width) * Math.PI);
          const yOffset = isPlaying 
            ? (Math.sin(x * 0.008 + phase * 2) + Math.cos(x * 0.02 - phase)) * (height * 0.35 * bell)
            : Math.sin(x * 0.005 + phase) * 10;
          ctx.lineTo(x, height * 0.65 + yOffset);
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, colors[0] + '80');
        grad.addColorStop(0.5, colors[1] + '50');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fill();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [isPlaying, isBackground, family, colors, baseSpeed]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full ${isBackground ? 'h-full pointer-events-none' : 'h-10'} flex items-center overflow-hidden`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}
