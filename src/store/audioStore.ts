import { create } from 'zustand';

const AUDIO_PREF_KEY = 'flockhopper_audio_enabled';
const DEFAULT_VOLUME = 0.08;
// Cache-busting param to avoid iOS Safari 304 + range request bug
const AUDIO_SRC = '/audio/panopticon-drift.mp3?v=2';

interface AudioStoreState {
  isEnabled: boolean;
  isPlaying: boolean;
  isLoading: boolean;
  hasError: boolean;
  volume: number;
  audioRef: HTMLAudioElement | null;
  toggleAudio: () => void;
  cleanup: () => void;
}

const getStoredPreference = (): boolean => {
  try {
    return localStorage.getItem(AUDIO_PREF_KEY) === 'true';
  } catch {
    return false;
  }
};

const setStoredPreference = (enabled: boolean): void => {
  try {
    localStorage.setItem(AUDIO_PREF_KEY, String(enabled));
  } catch {
    // localStorage unavailable
  }
};

export const useAudioStore = create<AudioStoreState>((set, get) => ({
  isEnabled: getStoredPreference(),
  isPlaying: false,
  isLoading: false,
  hasError: false,
  volume: DEFAULT_VOLUME,
  audioRef: null,

  toggleAudio: () => {
    const { isPlaying, isLoading, audioRef, volume } = get();

    // Ignore clicks while loading
    if (isLoading) return;

    if (isPlaying && audioRef) {
      // Stop playing
      audioRef.pause();
      set({ isPlaying: false, isEnabled: false });
      setStoredPreference(false);
    } else {
      // Start playing
      set({ isLoading: true, hasError: false });

      let audio = audioRef;

      if (!audio) {
        audio = new Audio();
        audio.loop = true;
        audio.volume = volume;
        // Note: Don't set crossOrigin for same-origin files - can cause issues on mobile

        // Error handler
        const handleError = () => {
          const error = audio?.error;
          console.error('[Audio] Failed to load:', {
            code: error?.code,
            message: error?.message,
            src: AUDIO_SRC,
          });
          set({ isLoading: false, isPlaying: false, hasError: true });
        };

        audio.addEventListener('error', handleError);
        set({ audioRef: audio });
      }

      // Set source
      audio.src = AUDIO_SRC;

      // CRITICAL: Call play() synchronously in the user gesture handler
      // Mobile browsers (especially iOS Safari) require play() to be called
      // in the same call stack as the user's tap. Waiting for 'canplay' breaks this.
      // The browser will buffer and start playing once enough data is loaded.
      audio.play()
        .then(() => {
          set({ isPlaying: true, isEnabled: true, isLoading: false, hasError: false });
          setStoredPreference(true);
        })
        .catch((error) => {
          console.warn('[Audio] Play failed:', error.name, error.message);
          // On some browsers, the play() promise rejects but audio still plays after buffering
          // Listen for the playing event as a fallback
          const onPlaying = () => {
            audio?.removeEventListener('playing', onPlaying);
            set({ isPlaying: true, isEnabled: true, isLoading: false, hasError: false });
            setStoredPreference(true);
          };
          audio?.addEventListener('playing', onPlaying);

          // If it's a real error (not just "not enough data"), show error after timeout
          setTimeout(() => {
            const state = get();
            if (state.isLoading && !state.isPlaying) {
              set({ isPlaying: false, isLoading: false, hasError: true });
            }
          }, 5000);
        });
    }
  },

  cleanup: () => {
    const { audioRef } = get();
    if (audioRef) {
      audioRef.pause();
      audioRef.src = '';
      set({ audioRef: null, isPlaying: false, isLoading: false });
    }
  },
}));
