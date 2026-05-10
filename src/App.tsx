import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, Radio, Volume2, Mic2, Clock, Cloud, MessageSquare, Layout, Music, Waves, Cpu } from 'lucide-react';
import { DotMatrixText, Label, Button, Card, ParticleBackground, LiquidBackground, AudioVisualizer } from './components/NothingUI';
import { generateDJScript, generateDJVoice } from './services/geminiService';
import { TRACKS } from './constants';
import { RadioState, Track } from './types';

type View = 'DASHBOARD' | 'TERMINAL' | 'PROFILE';

export default function App() {
  const [radioState, setRadioState] = useState<RadioState>('IDLE');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentView, setCurrentView] = useState<View>('DASHBOARD');
  const [djText, setDjText] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'dj', text: string }>>([
    { role: 'dj', text: "Welcome to Claudio. It's Monday night, let's connect through sound." }
  ]);
  const [userInput, setUserInput] = useState("");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

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
      const audio = new Audio(`data:audio/mp3;base64,${base64}`);
      setRadioState('DJ');
      audio.onended = () => {
        playMusic();
      };
      await audio.play();
    } catch (error) {
      console.error("Audio Playback Error:", error);
      playMusic();
    }
  };

  const startRadioSequence = async () => {
    if (radioState !== 'IDLE' || isLoading) return;
    setIsLoading(true);
    setCurrentView('TERMINAL');
    try {
      const script = await generateDJScript("Greeting the listener for the first time. Introduce yourself briefly as Claudio.");
      setDjText(script);
      const base64 = await generateDJVoice(script);
      if (base64) {
        await playDJAudio(base64);
      } else {
        playMusic();
      }
    } catch (e) {
      playMusic();
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = () => {
    if (radioState === 'IDLE') return;
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % TRACKS.length;
    setCurrentTrackIndex(nextIndex);
    playMusic();
  };

  const prevTrack = () => {
    const prevIndex = (currentTrackIndex - 1 + TRACKS.length) % TRACKS.length;
    setCurrentTrackIndex(prevIndex);
    playMusic();
  };

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    const userMsg = userInput;
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setUserInput("");
    setIsLoading(true);

    try {
      const script = await generateDJScript(`User said: ${userMsg}. Respond conversationally as Claudio AI.`);
      setChatMessages(prev => [...prev, { role: 'dj', text: script }]);
      const base64 = await generateDJVoice(script);
      if (base64) await playDJAudio(base64);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-[#080808] text-white font-sans flex flex-col p-6 md:p-10 overflow-hidden select-none relative">
      <LiquidBackground />
      <ParticleBackground isPlaying={isPlaying} />
      
      {/* Top Navigation - As seen in video 00:18 */}
      <div className="flex justify-between items-center z-[70] mb-6">
        <div className="flex items-center gap-3">
           <div className="flex flex-col">
              <motion.span 
                animate={{ opacity: radioState === 'DJ' ? [0.6, 1, 0.6] : 1 }}
                className="text-xl font-bold tracking-tight"
              >
                Claudio
              </motion.span>
              <div className="flex items-center gap-1.5 leading-none">
                 <div className={`w-1 h-1 rounded-full ${radioState === 'DJ' ? 'bg-claudio-green shadow-[0_0_8px_#22c55e]' : 'bg-white/20'}`} />
                 <span className={`text-[9px] font-bold uppercase tracking-widest ${radioState === 'DJ' ? 'text-claudio-green' : 'text-white/30'}`}>
                   {radioState === 'DJ' ? 'Speaking...' : 'On Air'}
                 </span>
              </div>
           </div>
        </div>

        {/* Central Digital Clock */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
           <motion.span 
             animate={{ opacity: [0.7, 1, 0.7] }}
             transition={{ duration: 4, repeat: Infinity }}
             className="text-5xl font-black font-display tracking-tight text-white/90"
           >
             {currentTime.getHours().toString().padStart(2, '0')}:
             {currentTime.getMinutes().toString().padStart(2, '0')}
           </motion.span>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="text-[10px] font-bold uppercase tracking-[0.2em] px-5 py-2 rounded-full border border-white/5 hover:bg-white/5 transition-all">Login</button>
          <div className="flex p-1 bg-white/5 rounded-full border border-white/5">
             <button className="px-4 py-1 rounded-full bg-white text-black text-[9px] font-black uppercase tracking-widest transition-all">Dark</button>
             <button className="px-4 py-1 rounded-full text-white/40 text-[9px] font-black uppercase tracking-widest hover:text-white transition-all">Light</button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden max-w-5xl mx-auto w-full">
        <AnimatePresence mode="wait">
          
          {/* VIEW 1: DASHBOARD (Video 00:00) */}
          {currentView === 'DASHBOARD' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="h-full flex flex-col items-center justify-center p-4"
            >
               <Card className="max-w-md w-full p-0 overflow-hidden claudio-card shadow-4xl rounded-[40px]">
                  <div className="h-64 bg-zinc-900 border-b border-white/5 flex items-center justify-center p-12 relative overflow-hidden">
                     <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />
                     </div>
                     <div className="w-full h-full border border-white/5 rounded-2xl flex flex-col items-center justify-center space-y-4 bg-black/20 backdrop-blur-sm relative z-10">
                        <Label>Monday Night Exhale</Label>
                        <DotMatrixText text={`0${currentTrackIndex+1}`} size="xl" className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]" />
                     </div>
                  </div>
                  <div className="p-8 space-y-8">
                    <div className="text-left space-y-2">
                       <h3 className="text-3xl font-black font-sans leading-none uppercase tracking-tighter">Monday Night<br/>Exhale</h3>
                       <p className="text-white/40 text-[11px] font-bold uppercase tracking-[0.3em] font-mono">TRACK 0{currentTrackIndex+1} — ACTIVE SESSION</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="flex-1 h-[2px] bg-white/5 relative rounded-full overflow-hidden">
                          <motion.div 
                            className="absolute top-0 left-0 h-full bg-white shadow-[0_0_8px_white]" 
                            animate={{ width: isPlaying ? '100%' : '15%' }}
                            transition={{ duration: 180, ease: "linear" }}
                          />
                       </div>
                       <span className="text-[10px] font-mono text-white/30 tabular-nums">00:42 / 03:15</span>
                    </div>
                    <Button onClick={startRadioSequence} className="w-full h-16 text-lg tracking-[0.2em] rounded-3xl">Initiate Flow</Button>
                  </div>
               </Card>
            </motion.div>
          )}

          {/* VIEW 2: TERMINAL (Video 00:18) */}
          {currentView === 'TERMINAL' && (
            <motion.div 
              key="terminal"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full flex flex-col gap-6"
            >
              <Card className="flex-1 flex flex-col p-8 glass-morphism rounded-[40px] border-white/5 overflow-hidden">
                <div className="flex justify-between items-center mb-10 text-[10px] font-bold text-white/10 tracking-[0.4em] uppercase border-b border-white/5 pb-4">
                  <span>Digital Terminal v2.1.0</span>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-claudio-green animate-pulse" />
                    <span className="text-claudio-green/60">Transmission Stable</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto space-y-12 pr-4 custom-scrollbar mb-8">
                  <AnimatePresence initial={false}>
                    {chatMessages.map((msg, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", damping: 15, stiffness: 120 }}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <Label className="mb-3 text-[9px] opacity-20">{msg.role === 'user' ? 'CLIENT_INPUT' : 'SYSTEM_DJ'}</Label>
                        <div className={`p-5 rounded-2xl max-w-[85%] text-lg leading-relaxed ${msg.role === 'user' ? 'bg-white/5 border border-white/5 text-white' : 'bg-transparent text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]'}`}>
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Integrated Mini-Player (Bottom of Terminal Card) */}
                <div className="bg-[#0c0c0c]/80 backdrop-blur-3xl border border-white/5 rounded-[32px] p-8 flex items-center gap-8">
                   <div className="w-20 h-20 rounded-2xl bg-zinc-900 flex items-center justify-center font-black text-3xl border border-white/5 shadow-inner">
                      {currentTrackIndex + 1}
                   </div>
                   <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xl truncate uppercase tracking-tighter">{radioState === 'DJ' ? 'CLAUDIO BROADCAST' : currentTrack.title}</h4>
                      <div className="flex items-center gap-3 mt-3 h-8 overflow-hidden rounded-lg bg-black/20 p-2">
                         <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} mode="line" color={radioState === 'DJ' ? '#22c55e' : '#ffffff'} />
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <button onClick={prevTrack} className="p-3 text-white/20 hover:text-white transition-all"><SkipForward className="rotate-180" size={24} /></button>
                      <button onClick={togglePlayback} className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-2xl">
                        {isPlaying ? <Pause size={28} fill="black" /> : <Play size={28} fill="black" className="ml-1" />}
                      </button>
                      <button onClick={nextTrack} className="p-3 text-white/20 hover:text-white transition-all"><SkipForward size={24} /></button>
                   </div>
                </div>
              </Card>

              {/* Input Stream */}
              <div className="relative">
                <input 
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Communicate with the algorithm..."
                  className="w-full bg-white/5 border border-white/10 rounded-[35px] px-10 py-7 text-white focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all font-medium text-lg placeholder:text-white/5 shadow-2xl backdrop-blur-xl"
                />
                <button onClick={handleSendMessage} className="absolute right-8 top-1/2 -translate-y-1/2 p-3 text-white/20 hover:text-white hover:scale-110 transition-all">
                  <MessageSquare size={32} />
                </button>
              </div>
            </motion.div>
          )}

          {/* VIEW 3: PROFILE (Video 00:33 - The Music Taste/Stats page) */}
          {currentView === 'PROFILE' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="h-full flex flex-col py-8"
            >
              <div className="flex items-center gap-8 mb-12">
                 <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white/5 bg-zinc-900 flex items-center justify-center shadow-2xl relative">
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-2 border border-dashed border-white/10 rounded-full"
                    />
                    <Waves size={48} className="text-white/40" />
                 </div>
                 <div className="space-y-2">
                    <h2 className="text-4xl font-black font-sans uppercase tracking-tighter leading-none">Claudio Station</h2>
                    <p className="text-white/20 text-[11px] font-bold uppercase tracking-[0.4em] font-mono">Unified Audio Protocol — Established 2024</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                 <Card className="flex flex-col items-center justify-center p-10 bg-zinc-950/50 border-white/5 rounded-[32px]">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4">Frequency</span>
                    <span className="text-4xl font-black font-display text-claudio-green drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">LIVE</span>
                 </Card>
                 <Card className="flex flex-col items-center justify-center p-10 bg-zinc-950/50 border-white/5 rounded-[32px]">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4">Genres</span>
                    <span className="text-4xl font-black font-display text-white">∞</span>
                 </Card>
                 <Card className="flex flex-col items-center justify-center p-10 bg-zinc-950/50 border-white/5 rounded-[32px]">
                    <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mb-4">Nodes</span>
                    <span className="text-4xl font-black font-display text-white">01</span>
                 </Card>
              </div>

              <Label className="mb-6 ml-2">Musical DNA Fragment</Label>
              <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 content-start overflow-y-auto custom-scrollbar pr-2">
                 {['ABSTRACT-HIPHOP', 'LIQUID-FUNK', 'Shoegaze', 'POST-ROCK', 'GLITCH', 'DREAM-POP', 'MINIMALISM', 'MATH-ROCK', 'CITY-POP', 'DRUMNBASS', 'CHILLSTEP', 'NO-WAVE'].map(genre => (
                   <div key={genre} className="group p-6 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white hover:border-white/20 hover:bg-white/5 cursor-pointer transition-all flex flex-col gap-2">
                     <span className="group-hover:text-claudio-green text-[8px] font-mono">PROTOCOL_{genre.slice(0,3)}</span>
                     {genre}
                   </div>
                 ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Overlay - Lower Center */}
      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[80]">
        <div className="flex items-center gap-2 p-2 bg-[#0c0c0c]/90 backdrop-blur-2xl border border-white/5 rounded-[32px] shadow-4xl">
           <button 
            onClick={() => setCurrentView('DASHBOARD')}
            className={`px-10 py-3.5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${currentView === 'DASHBOARD' ? 'bg-white text-black shadow-xl translate-y-[-2px]' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
           >
             Focus
           </button>
           <button 
            onClick={() => setCurrentView('TERMINAL')}
            className={`px-10 py-3.5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${currentView === 'TERMINAL' ? 'bg-white text-black shadow-xl translate-y-[-2px]' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
           >
             Claudio
           </button>
           <button 
            onClick={() => setCurrentView('PROFILE')}
            className={`px-10 py-3.5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${currentView === 'PROFILE' ? 'bg-white text-black shadow-xl translate-y-[-2px]' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
           >
             Network
           </button>
        </div>
      </div>

      <audio 
        ref={audioRef} 
        src={currentTrack.url}
        onEnded={nextTrack}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}
