import { createContext } from 'react';

export interface AudioContextType {
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

export const AudioContext = createContext<AudioContextType | null>(null);
