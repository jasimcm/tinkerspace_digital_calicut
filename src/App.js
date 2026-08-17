import React, { useEffect, useState } from 'react';
import { fetchData } from './utils/api/fetchData';
import { removeDuplicates } from './utils/helpers/removeDuplicates';
import Header from './components/layout/Header';
import PaginatedCardGrid from './components/layout/PaginatedCardGrid';
import TinkerHubMascot from './components/mascot/TinkerHubMascot';

const CURRENT_VIEW = 'makers';

function App() {
    const [data, setData] = useState([]);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [startAnimation, setStartAnimation] = useState(false);
    const [isAppReady, setIsAppReady] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [manualTheme, setManualTheme] = useState(null);
    const [needsFullscreenPrompt, setNeedsFullscreenPrompt] = useState(false);

    // Fullscreen + wake lock. Most browsers (including many Smart TV/Android TV
    // browsers) block requestFullscreen() unless it's called from a real user
    // gesture, so the automatic attempt on load often silently fails. As a
    // fallback, retry on the very first keydown/click/touch — a TV remote's
    // OK/select button fires keydown, which qualifies as a gesture — and show
    // a brief prompt if fullscreen hasn't kicked in a moment after load.
    useEffect(() => {
        const enterFullscreen = async () => {
            try {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                }
            } catch (err) {
                console.log('Fullscreen request error:', err);
            }
            try {
                await navigator.wakeLock.request('screen');
            } catch (err) {
                console.log('Wake Lock error:', err);
            }
        };
        enterFullscreen();

        const promptTimer = setTimeout(() => {
            if (!document.fullscreenElement) setNeedsFullscreenPrompt(true);
        }, 1500);

        const gestureController = new AbortController();
        const retryOnGesture = () => {
            enterFullscreen();
            setNeedsFullscreenPrompt(false);
            gestureController.abort();
        };
        document.addEventListener('keydown', retryOnGesture, { signal: gestureController.signal });
        document.addEventListener('click', retryOnGesture, { signal: gestureController.signal });
        document.addEventListener('touchstart', retryOnGesture, { signal: gestureController.signal });

        const handleFullscreenChange = () => {
            if (document.fullscreenElement) setNeedsFullscreenPrompt(false);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            clearTimeout(promptTimer);
            gestureController.abort();
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    useEffect(() => {
        const fetchRecords = async () => {
            try {
                const records = await fetchData();
                setData(removeDuplicates(records));
            } catch (error) {
                console.error('Fetch failed:', error);
            }
        };

        fetchRecords();
        const interval = setInterval(fetchRecords, 20000);
        return () => clearInterval(interval);
    }, []);

    // Theme Detection Logic
    useEffect(() => {
        const checkTimeTheme = () => {
            if (manualTheme !== null) {
                const isDark = manualTheme === 'dark';
                if (isDark) document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
                setIsDarkMode(isDark);
                return;
            }

            const currentHour = new Date().getHours();
            const isNight = currentHour < 6 || currentHour >= 18; // Before 6 AM or after 6 PM is dark mode
            
            if (isNight) {
                document.documentElement.classList.add('dark');
                setIsDarkMode(true);
            } else {
                document.documentElement.classList.remove('dark');
                setIsDarkMode(false);
            }
        };

        checkTimeTheme();
        const interval = setInterval(checkTimeTheme, 20000); // Check every 20 seconds
        return () => clearInterval(interval);
    }, [manualTheme]);


    // Loading Animation Logic
    useEffect(() => {
        let currentProgress = 0;
        let animationFrameId;
        let isPaused = false;

        const updateProgress = () => {
            if (isPaused) return;

            if (currentProgress < 63) {
                currentProgress += Math.random() * 2 + 0.5; 
                if (currentProgress >= 63) {
                    currentProgress = 63;
                    isPaused = true;
                    setLoadingProgress(Math.floor(currentProgress));
                    
                    // Pause for exactly 1 second at 63%
                    setTimeout(() => {
                        isPaused = false;
                        animationFrameId = requestAnimationFrame(updateProgress);
                    }, 1000);
                    return; 
                }
            } else if (currentProgress < 100) {
                currentProgress += Math.random() * 3 + 1; 
                if (currentProgress >= 100) {
                    currentProgress = 100;
                    setLoadingProgress(100);
                    
                    // Loading complete - start animations
                    setTimeout(() => {
                        setStartAnimation(true);
                        // Show main app shortly after vector starts moving
                        setTimeout(() => {
                            setIsAppReady(true);
                        }, 500); 
                    }, 400); 
                    return;
                }
            }
            
            setLoadingProgress(Math.floor(currentProgress));
            animationFrameId = requestAnimationFrame(updateProgress);
        };

        animationFrameId = requestAnimationFrame(updateProgress);
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    return (
        <div className="relative w-screen h-screen overflow-hidden font-geist text-gray-800 dark:text-gray-100 z-0">

            {/* Fullscreen Prompt — shown only if the automatic attempt was blocked */}
            {needsFullscreenPrompt && (
                <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 text-white text-2xl md:text-3xl font-semibold tracking-wide text-center px-8">
                    Press any button to enter fullscreen
                </div>
            )}

            {/* Loading Overlay */}
            <div 
                className={`absolute inset-0 z-40 flex items-center justify-center transition-opacity duration-1000 ${
                    startAnimation ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
            >
                <div className="font-geist text-7xl md:text-8xl font-extrabold tracking-tighter text-gray-800 dark:text-gray-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-28 transition-colors duration-500">
                    {loadingProgress}%
                </div>
            </div>

            {/* Vector Graphic (Animates Center -> Top Left) */}
            <img 
                src={`${process.env.PUBLIC_URL}/images/vector1.png`} 
                alt="Decoration" 
                className={`absolute z-50 object-contain pointer-events-none transition-all duration-[2000ms] ease-in-out ${
                    startAnimation 
                        ? 'top-8 left-12 w-12 opacity-90 translate-x-0 translate-y-0' 
                        : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 opacity-100'
                }`}
            />

            {/* Main Application Content */}
            <div className={`absolute inset-0 transition-opacity duration-[1500ms] ${isAppReady ? 'opacity-100' : 'opacity-0'}`}>


                {/* ── Shared Header (single instance, never remounts) ─── */}
                <div className="flex flex-col w-full h-full relative">
                    <div className="relative z-20">
                        <Header totalMakers={data.length} isDarkMode={isDarkMode} setManualTheme={setManualTheme} />
                    </div>

                    {/* Content area below header */}
                    <div className="flex-1 relative min-h-0">
                        <PaginatedCardGrid data={data} isActive />
                    </div>
                </div>
                
                {/* Bottom Quote */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                    <div className="flex items-center gap-3">
                        <p className="font-instrument text-[#0a192f] dark:text-white text-4xl italic tracking-wide transition-colors duration-500 opacity-60">
                            "Community is my spinach"
                        </p>
                        <img 
                            src={`${process.env.PUBLIC_URL}/images/spinach.png`} 
                            alt="Spinach" 
                            className="w-10 h-10 object-contain drop-shadow-md"
                        />
                    </div>
                </div>

                {/* Bottom-Right Controls / Information */}
                <div className="absolute bottom-8 right-12 z-50 flex flex-col items-end justify-end gap-6 pointer-events-none">
                    {/* QR Code (Hidden)
                    <div className="flex items-center gap-4 bg-white/40 dark:bg-white/5 backdrop-blur-2xl px-4 py-3 rounded-2xl border border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] transition-all duration-500 hover:scale-105 pointer-events-auto cursor-pointer group">
                        <div className="flex flex-col text-right">
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 tracking-wide uppercase">Join the Feed</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Scan to add your card</span>
                        </div>
                        <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://tinkerspace.in/join&margin=0&bgcolor=ffffff&color=0a192f`} alt="QR Code" className="w-14 h-14 rounded-lg mix-blend-multiply dark:mix-blend-normal dark:invert dark:opacity-80 transition-all duration-500" />
                    </div>
                    */}

                    {/* Theme Toggle Button (Hidden)
                    <button
                        onClick={() => setManualTheme(isDarkMode ? 'light' : 'dark')}
                        className="p-3 rounded-full bg-white/40 dark:bg-black/40 border border-black/10 dark:border-white/20 backdrop-blur-md shadow-sm text-gray-800 dark:text-white transition-all hover:scale-110 active:scale-95 pointer-events-auto cursor-pointer"
                        aria-label="Toggle Theme"
                    >
                        {isDarkMode ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>
                    */}

                    <TinkerHubMascot
                        makerCount={data.length}
                        currentView={CURRENT_VIEW}
                        isVisible={isAppReady}
                    />
                </div>

                {/* Absolute Full-Width Bottom Marquee (Hidden for now) */}
                {/* <div className="absolute bottom-0 left-0 w-full pointer-events-none z-50">
                    <LedMarquee />
                </div> */}
            </div>
        </div>
    );
}

export default App;
