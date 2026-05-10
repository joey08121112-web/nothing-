import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Liquid Background Effect
export const LiquidBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#000514]">
      {/* Primary Fluid Blob - Electric Blue */}
      <motion.div 
        animate={{ 
          scale: [1, 1.3, 1.2, 1.4, 1],
          x: ['-20%', '15%', '10%', '-25%', '-20%'],
          y: ['-15%', '25%', '-20%', '10%', '-15%'],
          rotate: [0, 90, 180, 270, 360],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
        className="liquid-bg absolute -top-[40%] -left-[30%] w-[140%] h-[140%] rounded-[40%] bg-gradient-to-br from-[#1d4ed8]/50 via-[#1e40af]/30 to-transparent opacity-70"
      />
      
      {/* Secondary Dynamic Orb - Cobalt Blue */}
      <motion.div 
        animate={{ 
          scale: [1.4, 1.2, 1.5, 1.3, 1.4],
          x: ['30%', '-15%', '40%', '10%', '30%'],
          y: ['20%', '40%', '15%', '-10%', '20%'],
          rotate: [0, -120, -240, -360],
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
        className="liquid-bg absolute top-[10%] -right-[40%] w-[130%] h-[130%] rounded-[45%] bg-gradient-to-tr from-[#1e3a8a]/60 via-[#1e40af]/20 to-transparent opacity-50"
      />
      
      {/* Tertiary Accent Bloom - Deep Sea Blue */}
      <motion.div 
        animate={{ 
          scale: [1, 1.5, 1.3, 1.6, 1],
          x: ['-15%', '20%', '-25%', '15%', '-15%'],
          y: ['50%', '75%', '40%', '65%', '50%'],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
        className="liquid-bg absolute -bottom-[30%] left-[-20%] w-[120%] h-[120%] rounded-[50%] bg-gradient-to-bl from-[#172554]/60 to-[#000514]/40 opacity-70"
      />

      {/* Glass Highlight Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-[#000514]/60 mix-blend-overlay opacity-40" />
      
      {/* Edge Softening Overlay */}
      <div className="absolute inset-0 bg-[#000514]/30 backdrop-blur-[140px]" />
    </div>
  );
};

// Particle Following Mouse Effect - Ultra-low latency liquid tail
export const ParticleBackground: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Array<{ x: number, y: number, vx: number, vy: number, life: number, size: number }>>([]);
  const mouse = useRef({ x: 0, y: 0, lastX: 0, lastY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mouse.current.lastX;
      const dy = e.clientY - mouse.current.lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      
      mouse.current.lastX = mouse.current.x;
      mouse.current.lastY = mouse.current.y;
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      // Spawn particles based on speed
      const count = isPlaying ? (speed > 10 ? 4 : 2) : (speed > 10 ? 2 : 1);
      for (let i = 0; i < count; i++) {
        particles.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: Math.random() * 0.8 + 0.4,
          life: 1.0
        });
      }
    };

    const update = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const pArr = particles.current;
      for (let i = pArr.length - 1; i >= 0; i--) {
        const p = pArr[i];
        
        // Fluid friction - essential for the video's "slow down" feel
        p.vx *= 0.98;
        p.vy *= 0.98;
        
        p.x += p.vx;
        p.y += p.vy;
        p.life -= isPlaying ? 0.006 : 0.012;

        if (p.life <= 0) {
          pArr.splice(i, 1);
          continue;
        }

        // Clean crisp pixel-dots
        ctx.globalAlpha = p.life * 0.9;
        ctx.fillStyle = '#93c5fd'; 
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // High-end Mesh: extremely subtle lines between close points
        for (let j = i - 1; j >= 0; j--) {
          const p2 = pArr[j];
          const distDx = p.x - p2.x;
          const distDy = p.y - p2.y;
          const dist = Math.sqrt(distDx * distDx + distDy * distDy);

          if (dist < 60) {
            ctx.strokeStyle = '#ffffff';
            ctx.globalAlpha = (1 - dist / 60) * p.life * 0.08;
            ctx.lineWidth = 0.3;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Very subtle radial glow following cursor
      const gradient = ctx.createRadialGradient(
        mouse.current.x, mouse.current.y, 0,
        mouse.current.x, mouse.current.y, 180
      );
      gradient.addColorStop(0, 'rgba(147, 197, 253, 0.03)');
      gradient.addColorStop(1, 'rgba(147, 197, 253, 0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationFrameId = requestAnimationFrame(update);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    resize();
    update();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[65] mix-blend-screen" />;
};

// Global cache to prevent "MediaElementAudioSourceNode has already been created" error
const audioSourceCache = new WeakMap<HTMLAudioElement, {
  source: MediaElementAudioSourceNode,
  analyser: AnalyserNode,
  context: AudioContext
}>();

// Real-time Audio Visualizer Component - Minimalist Linear Style
export const AudioVisualizer: React.FC<{ 
  audioRef: React.RefObject<HTMLAudioElement | null>, 
  isPlaying: boolean, 
  color?: string,
  mode?: 'bars' | 'line' | 'wave'
}> = ({ audioRef, isPlaying, color = '#ffffff', mode = 'bars' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!audioRef.current || !canvasRef.current) return;

    const el = audioRef.current;
    
    let audioContext: AudioContext;
    let analyser: AnalyserNode;
    let dataArray: Uint8Array;

    if (audioSourceCache.has(el)) {
      const cached = audioSourceCache.get(el)!;
      audioContext = cached.context;
      analyser = cached.analyser;
    } else {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaElementSource(el);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      
      audioSourceCache.set(el, { context: audioContext, analyser, source });
    }

    analyser.fftSize = mode === 'line' ? 512 : 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (audioContext.state === 'suspended' && isPlaying) {
        audioContext.resume();
      }

      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      
      if (mode === 'line') {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.lineJoin = 'round';
        
        const sliceWidth = width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, height - y);
          } else {
            ctx.lineTo(x, height - y);
          }

          x += sliceWidth;
        }
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        // Add a glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.stroke();
        ctx.shadowBlur = 0;
      } else {
        const barWidth = (width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * height * 0.8;
          ctx.fillStyle = color;
          ctx.globalAlpha = isPlaying ? 0.5 : 0.1;
          
          const r = 2;
          const y = height - barHeight;
          
          if (ctx.roundRect) {
            ctx.roundRect(x, y, barWidth - 1, barHeight, [r, r, 0, 0]);
          } else {
            ctx.rect(x, y, barWidth - 1, barHeight);
          }
          ctx.fill();
          x += barWidth + 1;
        }
      }
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [audioRef, isPlaying, color, mode]);

  return <canvas ref={canvasRef} width={600} height={120} className="w-full h-full" />;
};

export const DotMatrixText: React.FC<{ text: string; size?: 'sm' | 'md' | 'lg' | 'xl'; className?: string }> = ({ text, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-4xl',
    lg: 'text-7xl',
    xl: 'text-8xl md:text-[12rem]',
  };

  return (
    <span className={`font-display font-black tracking-tighter uppercase leading-none drop-shadow-2xl ${sizeClasses[size]} ${className}`}>
      {text}
    </span>
  );
};

export const Label: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = '', id }) => (
  <span id={id || "glass-label"} className={`font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-white/50 ${className}`}>
    {children}
  </span>
);

export const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  disabled?: boolean;
  id?: string;
}> = ({ children, onClick, variant = 'primary', className = '', disabled, id }) => {
  const base = "font-sans text-[12px] font-bold uppercase tracking-[0.15em] px-8 py-4 rounded-2xl transition-all duration-300 disabled:opacity-40 active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 hover:border-white/40 shadow-lg",
    secondary: "bg-transparent border border-white/10 text-white/60 hover:text-white hover:border-white/30",
    ghost: "bg-transparent text-white/40 hover:text-white px-2",
  };

  return (
    <button
      id={id || "glass-button"}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div id="glass-card" className={`glass-morphism rounded-[40px] p-8 ${className}`}>
    {children}
  </div>
);
