import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

interface AudioContextType {
    isPlaying: boolean;
    isMuted: boolean;
    volume: number;
    error: string | null;
    play: () => Promise<void>;
    stop: () => void;
    toggleMute: () => void;
    setVolume: (volume: number) => void;
    testAudio: () => Promise<void>;
}

const AudioContext = createContext<AudioContextType | null>(null);

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolumeState] = useState(0.7);
    const [error, setError] = useState<string | null>(null);

    // Initialize audio element
    useEffect(() => {
        try {
            const audio = new Audio('/doordash.mp3');
            audio.loop = true;
            audio.volume = volume;
            audio.muted = isMuted;
            audioRef.current = audio;

            // Add event listeners to sync state
            const handlePlay = () => setIsPlaying(true);
            const handlePause = () => setIsPlaying(false);
            const handleError = (e: Event) => {
                console.error('Audio error:', e);
                setError('Audio playback error occurred.');
                setIsPlaying(false);
            };

            audio.addEventListener('play', handlePlay);
            audio.addEventListener('pause', handlePause);
            audio.addEventListener('error', handleError);

            return () => {
                audio.removeEventListener('play', handlePlay);
                audio.removeEventListener('pause', handlePause);
                audio.removeEventListener('error', handleError);
                audio.pause();
                audioRef.current = null;
            };
        } catch (err) {
            console.error('Failed to initialize audio:', err);
            setError('Failed to initialize audio system.');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Sync volume/mute changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
            audioRef.current.muted = isMuted;
        }
    }, [volume, isMuted]);

    const play = useCallback(async () => {
        if (!audioRef.current) return;
        if (isPlaying) return;

        try {
            audioRef.current.currentTime = 0;
            await audioRef.current.play();
            setError(null);
        } catch (err) {
            console.error('Play error:', err);
            setIsPlaying(false);
            if (err instanceof Error && err.name === 'NotAllowedError') {
                setError('Bitte klicken Sie irgendwo auf die Seite, um Audio zu aktivieren.');
            } else {
                setError('Fehler beim Abspielen des Tons.');
            }
        }
    }, [isPlaying]);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    }, []);

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    const setVolume = useCallback((newVolume: number) => {
        setVolumeState(Math.max(0, Math.min(1, newVolume)));
    }, []);

    const testAudio = useCallback(async () => {
        if (!audioRef.current) return;

        // Create a temporary audio instance for testing so we don't disrupt the main loop state
        // or we can just play the main one briefly. 
        // Let's play the main one briefly to ensure THAT one works.

        // But if we are already playing (looping for an order), testing might be weird.
        // Let's just create a one-off for testing.
        try {
            const testSound = new Audio('/doordash.mp3');
            testSound.volume = volume;
            await testSound.play();
            setTimeout(() => {
                testSound.pause();
                testSound.remove();
            }, 2000);
            setError(null);
        } catch (err) {
            console.error('Test audio error:', err);
            setError('Test fehlgeschlagen. Bitte Browser-Berechtigungen prüfen.');
            throw err;
        }
    }, [volume]);

    const value = {
        isPlaying,
        isMuted,
        volume,
        error,
        play,
        stop,
        toggleMute,
        setVolume,
        testAudio
    };

    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};
