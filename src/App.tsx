import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, Radio, Volume2, Mic2, Clock, Cloud } from 'lucide-react';
import { DotMatrixText, Label, Button, Card } from './components/NothingUI';
import { generateDJScript, generateDJVoice } from './services/geminiService';
import { TRACKS } from './constants';
import { RadioState, Track } from './types';

export default function App() {
  const [radioState, setRadioState] = useState<RadioState>('IDLE');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [djText, setDjText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(new Date());

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];
  const nextTrackData = TRACKS[(currentTrackIndex + 1) % TRACKS.length];
  const prevTrackData = TRACKS[(currentTrackIndex - 1 + TRACKS.length) % TRACKS.length];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const playMusic = () => {
    setRadioState('MUSIC');
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const playDJAudio = async (base64: string) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
      }
      
      const float32 = new Float32Array(bytes.length / 2);
      for (let i = 0; i < float32.length; i++) {
          const int = (bytes[i * 2 + 1] << 8) | bytes[i * 2];
          float32[i] = (int >= 0x8000 ? int - 0x10000 : int) / 0x8000;
      }
      
      const buffer = audioCtx.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);
      
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;
      source.connect(audioCtx.destination);
      
      source.onended = () => {
        playMusic();
      };
      
      source.start();
    } catch (error) {
      console.error("Audio Playback Error:", error);
      playMusic();
    }
  };

  const startRadioSequence = async () => {
    if (radioState !== 'IDLE' || isLoading) return;
    setIsLoading(true);
    try {
      const script = await generateDJScript("Greeting the listener for the first time today. Mention Nothing Radio.");
      setDjText(script);
      const base64 = await generateDJVoice(script);
      if (base64) {
        setRadioState('DJ');
        await playDJAudio(base64);
      } else {
        playMusic();
      }
    } catch (e) {
      console.error(e);
      playMusic();
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = () => {
    if (radioState === 'IDLE') return;
    setIsPlaying(!isPlaying);
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
    }
  };

  const nextTrack = async () => {
    const nextIndex = (currentTrackIndex + 1) % TRACKS.length;
    setCurrentTrackIndex(nextIndex);
    
    if (nextIndex % 2 === 0) {
      if (audioRef.current) audioRef.current.pause();
      setRadioState('DJ');
      setIsLoading(true);
      const script = await generateDJScript(`A smooth transition after ${currentTrack.title}.`);
      setDjText(script);
      const base64 = await generateDJVoice(script);
      if (base64) {
        await playDJAudio(base64);
      } else {
        playMusic();
      }
      setIsLoading(false);
    } else {
      playMusic();
    }
  };

  const prevTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
    setCurrentTrackIndex(prevIndex);
    playMusic();
  };

  return (
    <div className="w-full h-screen bg-black text-white font-mono flex flex-col p-12 overflow-hidden select-none dot-grid relative">
      
      {/* Top Header / Status Bar */}
      <div className="flex justify-between items-start border-b border-white/10 pb-8 z-10">
        <div className="flex flex-col">
          <span className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase mb-2">Signal Source</span>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${radioState !== 'IDLE' ? 'bg-accent shadow-[0_0_8px_rgba(215,25,33,0.8)] animate-pulse' : 'bg-zinc-800'}`}></div>
            <h1 className="text-xl font-bold tracking-tighter uppercase font-sans">Nothing Radio / Private</h1>
          </div>
        </div>
        <div className="text-right flex flex-col">
          <span className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase mb-2">Frequency Control</span>
          <span className="text-3xl font-bold italic tracking-widest text-zinc-200">
            104.20<span className="text-zinc-600">MHz</span>
          </span>
        </div>
      </div>

      {/* Main Content Area: Large Typographic Display */}
      <div className="flex-1 flex flex-col justify-center items-center relative">
        {/* Background Decorative Text */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <span className="text-[24rem] font-black leading-none select-none">FM</span>
        </div>

        {/* Central Player Unit */}
        <AnimatePresence mode="wait">
          {radioState === 'IDLE' ? (
            <motion.div 
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="z-10 flex flex-col items-center"
            >
              <Button onClick={startRadioSequence} disabled={isLoading} className="border border-zinc-700">
                {isLoading ? "[GEN DJ...]" : "[INITIALIZE RADIO]"}
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="active"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="z-10 flex flex-col items-center w-full max-w-2xl px-4"
            >
              <div className="mb-8 border border-zinc-800 p-2 rounded-full relative">
                <div className="w-64 h-64 rounded-full border-[12px] border-zinc-900 flex items-center justify-center bg-zinc-950 relative overflow-hidden">
                    <div className="absolute inset-0 rounded-full border border-white/5"></div>
                    
                    {/* Dynamic Spinner / Progress Indicator */}
                    <motion.div 
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-6 bg-accent"
                      animate={{ rotate: isPlaying ? 360 : 0 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                      style={{ originY: "5.33" }}
                    />

                    <span className="text-[120px] font-black tracking-tighter text-white font-sans">
                      0{currentTrackIndex + 1}
                    </span>
                </div>
              </div>

              <div className="text-center space-y-4">
                <h2 className="text-5xl font-black uppercase tracking-[-0.05em] leading-tight break-words">
                  {radioState === 'DJ' ? "DJ ON AIR" : currentTrack.title}
                </h2>
                <div className="flex items-center justify-center gap-4 text-zinc-400 font-medium tracking-widest text-sm uppercase">
                  <span>{radioState === 'DJ' ? "AI_CHARON" : currentTrack.artist}</span>
                  <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full"></span>
                  <span className="font-mono">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span>
                </div>
                {radioState === 'DJ' && (
                   <p className="font-mono text-xs text-accent italic mt-4 max-w-md mx-auto opacity-80">
                     "{djText}"
                   </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Navigation & Controls */}
      <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10 z-10">
        {/* Previous */}
        <div className="flex flex-col gap-4">
          <span className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase">Previous Track</span>
          <div className="group cursor-pointer" onClick={prevTrack}>
            <div className="text-lg font-bold text-zinc-500 group-hover:text-white transition-colors">
              0{((currentTrackIndex - 1 + TRACKS.length) % TRACKS.length) + 1}. {prevTrackData.title.toUpperCase()}
            </div>
            <div className="text-[10px] text-zinc-600 mt-1">VOL: {(volume * 100).toFixed(0)}%</div>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-12">
            <button 
              onClick={prevTrack}
              className="w-12 h-12 flex items-center justify-center border border-zinc-800 rounded-full cursor-pointer hover:bg-zinc-900 transition-colors"
            >
              <SkipForward className="w-4 h-4 rotate-180" fill="white" />
            </button>
            <button 
              onClick={togglePlayback}
              className="w-16 h-16 flex items-center justify-center bg-white rounded-full cursor-pointer hover:bg-zinc-200 transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6 text-black" fill="black" /> : <Play className="w-6 h-6 text-black pl-1" fill="black" />}
            </button>
            <button 
              onClick={nextTrack}
              className="w-12 h-12 flex items-center justify-center border border-zinc-800 rounded-full cursor-pointer hover:bg-zinc-900 transition-colors"
            >
              <SkipForward className="w-4 h-4" fill="white" />
            </button>
        </div>

        {/* Next */}
        <div className="flex flex-col gap-4 items-end text-right">
          <span className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase">Up Next</span>
          <div className="group cursor-pointer" onClick={nextTrack}>
            <div className="text-lg font-bold text-white uppercase transition-opacity group-hover:opacity-80">
              0{((currentTrackIndex + 1) % TRACKS.length) + 1}. {nextTrackData.title.toUpperCase()}
            </div>
            <div className="text-[10px] text-zinc-500 mt-1 uppercase">SIGNAL_STRENGTH: HIGH</div>
          </div>
        </div>
      </div>

      {/* Bottom Decorative Rail */}
      <div className="mt-8 flex justify-between items-center text-[9px] uppercase tracking-[0.4em] text-zinc-700 z-10">
        <span>NOTHING(R) DESIGN SYSTEM</span>
        <span>AUTO-SCAN ACTIVE / HI-RES AUDIO ENABLED</span>
        <div className="flex items-center gap-2">
           <Volume2 className="w-3 h-3" />
           <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.01" 
              value={volume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setVolume(v);
                if (audioRef.current) audioRef.current.volume = v;
              }}
              className="w-24 accent-white bg-zinc-800 h-0.5 rounded-full appearance-none cursor-pointer"
            />
        </div>
      </div>

      {/* Hidden Audio Elements */}
      <audio 
        ref={audioRef} 
        src={currentTrack.url}
        onEnded={nextTrack}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
      
      {/* Absolute Background Elements */}
      <div className="absolute inset-0 pointer-events-none opacity-20 dot-grid-subtle" />
    </div>
  );
}

