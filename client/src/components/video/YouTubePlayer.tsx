import React, { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../../context/PlayerContext.js';
import { Play, Pause, Volume2, AlertCircle } from 'lucide-react';

interface YouTubePlayerProps {
  videoId: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({ videoId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerInstance = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const { registerPlayer, updateCurrentTime, updateDuration, recordLearningTime, flushLearningTime, markVideoCompleted } = usePlayer();
  const [playerReady, setPlayerReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initPlayer = () => {
      if (!window.YT || !window.YT.Player) {
        return;
      }

      if (playerInstance.current) {
        try {
          playerInstance.current.destroy();
        } catch (e) {}
      }

      const elementId = `yt-player-${videoId}`;
      if (!document.getElementById(elementId)) return;

      try {
        playerInstance.current = new window.YT.Player(elementId, {
          videoId,
          playerVars: {
            autoplay: 0,
            modestbranding: 1,
            rel: 0,
            controls: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              registerPlayer(event.target);
              setPlayerReady(true);
              setLoadError(false);
              try {
                const d = event.target.getDuration();
                if (typeof d === 'number' && d > 0) {
                  updateDuration(d);
                }
              } catch (e) {}
            },
            onStateChange: (event: any) => {
              // 1 = PLAYING
              if (event.data === 1) {
                if (timerRef.current) clearInterval(timerRef.current);
                timerRef.current = setInterval(() => {
                  try {
                    const t = playerInstance.current?.getCurrentTime();
                    const d = playerInstance.current?.getDuration();
                    if (typeof t === 'number') {
                      updateCurrentTime(t);
                      recordLearningTime(1);
                    }
                    if (typeof d === 'number' && d > 0) {
                      updateDuration(d);
                      if (typeof t === 'number' && t >= d - 3 && d > 5) {
                        markVideoCompleted();
                      }
                    }
                  } catch (e) {}
                }, 1000);
              } else if (event.data === 0) {
                // 0 = ENDED (100% video completion)
                if (timerRef.current) clearInterval(timerRef.current);
                flushLearningTime();
                markVideoCompleted();
              } else {
                // 2 = PAUSED, 3 = BUFFERING, etc.
                if (timerRef.current) clearInterval(timerRef.current);
                flushLearningTime();
              }
            },

            onError: (err: any) => {
              console.warn('YouTube Player error event:', err);
              setLoadError(true);
            },
          },
        });
      } catch (err) {
        console.error('Failed to instantiate YT Player:', err);
        setLoadError(true);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Setup callback
      window.onYouTubeIframeAPIReady = initPlayer;

      // Ensure script tag is present
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        tag.async = true;
        document.body.appendChild(tag);
      }
    }

    return () => {
      isMounted = false;
      if (timerRef.current) clearInterval(timerRef.current);
      flushLearningTime();
      if (playerInstance.current) {
        try {
          playerInstance.current.destroy();
        } catch (e) {}
      }
    };
  }, [videoId]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-surface-border">
      {/* Target element for YouTube API */}
      <div id={`yt-player-${videoId}`} className="w-full h-full" />

      {/* Fallback standard iframe if API blocked or error */}
      {loadError && (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&rel=0`}
          title="YouTube Video Player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      )}
    </div>
  );
};
