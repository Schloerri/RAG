import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Play, Pause, Volume2, Users, X, ChevronRight, Beaker, Atom, Gem } from 'lucide-react';

interface PixelButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  variant?: 'default' | 'glass' | 'solid';
}

interface Message {
  id: number;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}





const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => (
  <div 
    className="animate-float"
    style={{ 
      animationDelay: `${delay}s`,
      animationDuration: '6s',
      animationIterationCount: 'infinite'
    }}
  >
    {children}
  </div>
);

const MagicalOrb = ({ color, size = 'w-3 h-3', delay = 0 }: { color: string, size?: string, delay?: number }) => (
  <div 
    className={`${size} rounded-full animate-pulse-glow backdrop-blur-sm`}
    style={{ 
      backgroundColor: color,
      boxShadow: `0 0 20px ${color}80, 0 0 40px ${color}40`,
      animationDelay: `${delay}s`,
      animationDuration: '3s'
    }}
  />
);

const ModernButton = React.memo(({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary', 
  disabled = false,
  size = 'md' 
}: PixelButtonProps) => {
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-emerald-400/50 shadow-emerald-500/25',
    secondary: 'bg-white/10 text-white border-white/20 shadow-white/10 hover:bg-white/20',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white border-red-400/50 shadow-red-500/25',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-green-400/50 shadow-green-500/25',
    ghost: 'bg-transparent text-white border-white/30 hover:bg-white/10 shadow-none'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizes[size]} font-medium rounded-xl border backdrop-blur-sm 
        transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variants[variant]} ${className}
      `}
    >
      {children}
    </button>
  );
});

const ModernCard = React.memo(({ 
  children, 
  className = '', 
  glow = false,
  variant = 'default'
}: ModernCardProps) => {
  const variants = {
    default: 'bg-white/10 border-white/20',
    glass: 'bg-white/5 border-white/10',
    solid: 'bg-gray-900/90 border-gray-700'
  };

  return (
    <div 
      className={`
        ${variants[variant]} border backdrop-blur-xl rounded-2xl 
        transition-all duration-500 shadow-xl
        ${glow ? 'shadow-cyan-500/20 border-cyan-400/30' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
});

const AlchemyApp = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: 'ai',
      content: '🔮 Willkommen in der modernen Alchemie-Werkstatt! Ich bin Arcanum, dein KI-Assistent für mystische Braukunst. Welche magischen Experimente sollen wir heute durchführen? ✨',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');


  const [isTyping, setIsTyping] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [videoBlob, setVideoBlob] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Audio controls
  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((error) => {
          console.error('Error playing audio:', error);
          // User interaction required for audio
          if (error.name === 'NotAllowedError') {
            console.log('Audio autoplay blocked by browser. User interaction required.');
          }
        });
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleVolumeClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newVolume = Math.round((clickX / rect.width) * 100);
    handleVolumeChange(Math.max(0, Math.min(100, newVolume)));
  }, [handleVolumeChange]);

  // Initialize audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
      audioRef.current.addEventListener('loadeddata', () => {
        console.log('Audio loaded successfully');
      });
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
      });
    }
  }, [volume]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(() => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        '⚗️ Faszinierend! Diese quantenbasierte Formel erfordert präzise Molekularstrukturen. Die Synthesewahrscheinlichkeit liegt bei 94%! 🧪',
        '🔬 Ausgezeichnete Auswahl! Diese Nano-Verbindung nutzt fortschrittliche Bioengineering-Prinzipien. Erfolgsrate: 89% 🧬',
        '✨ Brillante Kombination! Diese Formel basiert auf Quantenphysik und ätherischen Energien. Extrem hohe Potenz! ⚛️',
        '🌟 Meisterhafte Wahl! Diese Synthese vereint moderne Wissenschaft mit mystischen Elementen. Bereite dich auf außergewöhnliche Resultate vor! 🔮',
        '🪄 Innovativ! Diese Quantenformel erschafft harmonische Energiefelder. Das Resultat wird deine alchemistischen Fähigkeiten verstärken! ⭐'
      ];
      
      const aiMessage: Message = {
        id: Date.now() + 1,
        type: 'ai',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000);
  }, [inputMessage]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  }, []);





  // Load video on app start
  useEffect(() => {
    const loadVideo = async () => {
      try {
        // Clean up old blob URL storage if exists
        const oldBlobUrl = localStorage.getItem('teamVideoUrl');
        if (oldBlobUrl) {
          localStorage.removeItem('teamVideoUrl');
        }

        // Check if video is already cached as base64
        const cachedVideoBase64 = localStorage.getItem('teamVideoBase64');
        if (cachedVideoBase64) {
          console.log('Video found in cache, loading instantly...');
          setVideoBlob(cachedVideoBase64);
          setIsVideoReady(true);
          
          // Preload and start video element when cached
          setTimeout(() => {
            if (videoRef.current) {
              videoRef.current.load();
              videoRef.current.play().catch(console.error);
            }
          }, 100);
          return;
        }

        console.log('Loading video from server...');
        const response = await fetch('/team.mp4');
        if (response.ok) {
          const blob = await response.blob();
          
          // Convert blob to base64 for persistent storage
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = reader.result as string;
            localStorage.setItem('teamVideoBase64', base64String);
            setVideoBlob(base64String);
            setIsVideoReady(true);
            console.log('Video loaded and cached successfully');
            
            // Preload and start video element
            if (videoRef.current) {
              videoRef.current.load();
              videoRef.current.play().catch(console.error);
            }
          };
          reader.onerror = () => {
            console.error('Error reading video file');
            setVideoBlob('/team.mp4');
            setIsVideoReady(true);
          };
          reader.readAsDataURL(blob);
        } else {
          throw new Error('Failed to load video from server');
        }
      } catch (error) {
        console.error('Error loading video:', error);
        // Fallback to direct video path
        setVideoBlob('/team.mp4');
        setIsVideoReady(true);
      }
    };

    loadVideo();
  }, []);

  const openAboutModal = useCallback(() => {
    setIsAboutModalOpen(true);
  }, []);
  
  const closeAboutModal = useCallback(() => {
    // Sync back to hidden video before closing
    const modalVideo = document.querySelector('.modal-video') as HTMLVideoElement;
    if (modalVideo && videoRef.current) {
      videoRef.current.currentTime = modalVideo.currentTime;
      // Ensure hidden video continues playing
      if (videoRef.current.paused) {
        videoRef.current.play().catch(console.error);
      }
    }
    setIsAboutModalOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 text-white flex flex-col p-4 space-y-6 relative overflow-hidden">
      {/* Audio Element */}
      <audio 
        ref={audioRef} 
        loop 
        preload="auto"
        onLoadedData={() => console.log('Audio file loaded successfully')}
        onError={(e) => console.error('Audio loading error:', e)}
      >
        <source src="/Fantasy Background Music - Celtic Relaxation - Free Use.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Hidden Video Element for Preloading */}
      {videoBlob && (
        <video
          ref={videoRef}
          className="hidden"
          preload="auto"
          loop
          muted
          playsInline
          src={videoBlob}
        />
      )}

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20">
          <MagicalOrb color="#10b981" size="w-4 h-4" delay={0} />
        </div>
        <div className="absolute top-40 right-32">
          <MagicalOrb color="#8b5cf6" size="w-3 h-3" delay={0.5} />
        </div>
        <div className="absolute bottom-40 left-40">
          <MagicalOrb color="#f59e0b" size="w-5 h-5" delay={1} />
        </div>
        <div className="absolute top-1/2 right-20">
          <MagicalOrb color="#06b6d4" size="w-2 h-2" delay={1.5} />
        </div>
        
        {/* Floating modern symbols */}
        <div className="absolute top-32 left-1/3">
          <FloatingElement delay={0}>
            <div className="text-emerald-400/20 text-3xl">⚛️</div>
          </FloatingElement>
        </div>
        <div className="absolute bottom-32 right-1/4">
          <FloatingElement delay={1}>
            <div className="text-cyan-400/20 text-2xl">🧬</div>
          </FloatingElement>
        </div>
        <div className="absolute top-1/3 right-1/3">
          <FloatingElement delay={2}>
            <div className="text-purple-400/20 text-xl">🔬</div>
          </FloatingElement>
        </div>
      </div>

      {/* About Modal */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-lg flex items-center justify-center z-50 p-4">
          <ModernCard className="relative max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col" glow>
            <ModernButton
              onClick={closeAboutModal}
              variant="danger"
              className="absolute top-4 right-4 z-10 !p-2"
            >
              <X className="w-5 h-5" />
            </ModernButton>

            <div className="relative w-full h-[60vh] overflow-hidden rounded-t-2xl">
              {/* Video Background */}
              {videoBlob && isVideoReady && (
                <video
                  className="absolute inset-0 w-full h-full object-cover modal-video"
                  loop
                  muted
                  playsInline
                  src={videoBlob}
                  onLoadedData={(e) => {
                    // Sync with preloaded video for seamless continuation
                    const modalVideo = e.target as HTMLVideoElement;
                    if (videoRef.current && modalVideo && videoRef.current.readyState >= 2) {
                      modalVideo.currentTime = videoRef.current.currentTime;
                      modalVideo.play().catch(console.error);
                      console.log('Video synchronized at position:', videoRef.current.currentTime);
                    }
                  }}
                  onCanPlay={(e) => {
                    // Backup sync when video is ready to play
                    const modalVideo = e.target as HTMLVideoElement;
                    if (videoRef.current && modalVideo && modalVideo.currentTime === 0) {
                      modalVideo.currentTime = videoRef.current.currentTime;
                    }
                  }}
                />
              )}
              
              {/* Video Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-transparent to-gray-900/30" />
              
              {/* Floating Effects */}
              <div className="absolute top-10 left-10">
                <MagicalOrb color="#10b981" size="w-6 h-6" delay={0} />
              </div>
              <div className="absolute top-20 right-20">
                <MagicalOrb color="#8b5cf6" size="w-4 h-4" delay={1} />
              </div>
              <div className="absolute bottom-20 left-1/4">
                <MagicalOrb color="#06b6d4" size="w-5 h-5" delay={0.5} />
              </div>
              <div className="absolute top-1/3 right-1/3">
                <MagicalOrb color="#f59e0b" size="w-3 h-3" delay={1.5} />
              </div>
            </div>

            {/* Content Panel */}
              <div className="w-full bg-gradient-to-br from-gray-900/95 to-slate-900/90 p-8 backdrop-blur-xl rounded-b-2xl">
                <div className="text-center space-y-6">
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <Users className="w-8 h-8 text-emerald-400" />
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      Unser Team
                    </h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-8 text-left">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-emerald-300 flex items-center space-x-2">
                        <Atom className="w-6 h-6" />
                        <span>Unsere Mission</span>
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        Wir kombinieren traditionelle Alchemie mit modernster Technologie. Unser interdisziplinäres Team 
                        aus Wissenschaftlern, Ingenieuren und Mystikern entwickelt revolutionäre Lösungen für die 
                        Zukunft der Braukunst.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-cyan-300 flex items-center space-x-2">
                        <Gem className="w-6 h-6" />
                        <span>Unsere Technologie</span>
                      </h3>
                      <ul className="text-gray-300 space-y-2">
                        <li className="flex items-center space-x-2">
                          <ChevronRight className="w-4 h-4 text-emerald-400" />
                          <span>RAG mit Vektordatenbank</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <ChevronRight className="w-4 h-4 text-cyan-400" />
                          <span>KI-Modell Analyse & Optimierung</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <ChevronRight className="w-4 h-4 text-purple-400" />
                          <span>Web Scraping & Datenbeschaffung</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <ChevronRight className="w-4 h-4 text-amber-400" />
                          <span>Frontend Entwicklung</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="mt-8 p-6 bg-gradient-to-r from-gray-800/50 to-slate-800/50 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <h3 className="text-2xl font-bold text-center mb-6 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                      Unser Team
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: 'Soufian Bernard', role: 'Implementierung responsiver Frontend-Anwendungen', icon: '💻' },
                        { name: 'Linda Nehring', role: 'Konzeption und Implementierung von RAG und Vektordatenbank', icon: '🗄️' },
                        { name: 'Laurin Layyous', role: 'Vergleich verschiedener KI-Modelle zur Ermittlung optimaler Ergebnisse', icon: '🤖' },
                        { name: 'Daniel Kuhlicke', role: 'Implementierung eines Web-Scrapers zur automatisierten Datenbeschaffung', icon: '🕷️' }
                      ].map((member) => (
                        <div 
                          key={member.name}
                          className="flex items-start space-x-4 p-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl border border-emerald-400/20 hover:border-emerald-400/40 transition-all duration-300 hover:scale-105"
                        >
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-xl shadow-lg flex-shrink-0">
                            {member.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white text-lg">{member.name}</h4>
                            <p className="text-emerald-300 text-sm leading-relaxed">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4 mt-8">
                    <ModernButton variant="primary" onClick={closeAboutModal} className="px-8 flex items-center space-x-2">
                      <Beaker className="w-5 h-5" />
                      <span>Zurück zum Labor</span>
                    </ModernButton>
                  </div>
                </div>
              </div>
          </ModernCard>
        </div>
      )}

      {/* Header */}
      <ModernCard glow className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 via-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center text-2xl border-2 border-cyan-400/50 shadow-lg shadow-cyan-400/30">
                <img src="./public/logo.png" alt="Arcanum" className="w-10 h-10 scale-150" />
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-cyan-400/20 rounded-2xl animate-pulse"></div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                KI Arcanum
              </h1>
              <div className="flex items-center space-x-2 mt-1">
                <Atom className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-gray-400">KI-gestützte Braukunst der Zukunft</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Music Controls */}
            <ModernCard variant="glass" className="flex items-center space-x-3 px-4 py-2">
              <ModernButton 
                onClick={togglePlayPause}
                variant="ghost" 
                size="sm"
                className="!p-2"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </ModernButton>
              
              <div className="flex items-center space-x-2">
                <ModernButton 
                  onClick={toggleMute}
                  variant="ghost" 
                  size="sm"
                  className="!p-1.5"
                >
                  <Volume2 className={`w-3 h-3 ${isMuted ? 'text-red-400' : 'text-cyan-300'}`} />
                </ModernButton>
                
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-16 h-2 bg-white/10 rounded-full overflow-hidden cursor-pointer hover:bg-white/20 transition-colors"
                    onClick={handleVolumeClick}
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-200"
                      style={{ width: `${isMuted ? 0 : volume}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 min-w-8">{volume}%</span>
                </div>
              </div>
            </ModernCard>

            <ModernButton variant="success" onClick={openAboutModal} className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Team</span>
            </ModernButton>
          </div>
        </div>
      </ModernCard>

            {/* Content Area */}
      <ModernCard className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-2xl transition-all duration-300 hover:scale-[1.02]`}>
                <div
                  className={`p-4 rounded-2xl backdrop-blur-sm border ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-400/30'
                      : 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400/30'
                  }`}
                >
                  {message.type === 'ai' && (
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-sm">
                        🤖
                      </div>
                      <span className="text-emerald-300 text-sm font-medium">Arcanum</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div className="text-xs text-gray-400 mt-2 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-400/30 p-4 rounded-2xl border backdrop-blur-sm">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-6 h-6 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full flex items-center justify-center text-sm">
                    🤖
                  </div>
                  <span className="text-emerald-300 text-sm font-medium">Arcanum</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-300">Analysiere Quantenstrukturen</span>
                  <div className="flex space-x-1">
                    <MagicalOrb color="#10b981" size="w-2 h-2" delay={0} />
                    <MagicalOrb color="#06b6d4" size="w-2 h-2" delay={0.2} />
                    <MagicalOrb color="#8b5cf6" size="w-2 h-2" delay={0.4} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-white/10 p-4 bg-white/5">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Beschreibe deine Alchemie-Ideen..."
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-emerald-400/50 focus:bg-white/15 transition-all duration-300 backdrop-blur-sm"
            />
            <ModernButton onClick={handleSendMessage} className="px-6 flex items-center space-x-2">
              <Send className="w-5 h-5" />
              <span>Senden</span>
            </ModernButton>
          </div>
        </div>
      </ModernCard>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        @keyframes pulse-glow {
          0%, 100% { 
            opacity: 1; 
            transform: scale(1);
          }
          50% { 
            opacity: 0.5; 
            transform: scale(1.1);
          }
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default AlchemyApp; 