import { useState, useRef, useEffect, useCallback } from 'react';
import { formatTime } from '../utils/gameHelpers';

export default function VinylPlayer({
  src = '/music/our-song.mp3',
  title = 'Our Favorite Song',
  artist = 'Giselle & Player 1',
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [hasError, setHasError] = useState(false);

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setHasError(false);
        })
        .catch((err) => {
          console.warn('Audio play error:', err);
          setHasError(true);
          setIsPlaying(false);
        });
    }
  }, [isPlaying]);

  // Audio event listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const onError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  // Update volume
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  // Seek bar
  const handleSeek = (e) => {
    const seekTime = parseFloat(e.target.value);
    setCurrentTime(seekTime);
    if (audioRef.current) {
      audioRef.current.currentTime = seekTime;
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="vinyl-player-card">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Turntable Platter Deck */}
      <div className="turntable-deck">
        {/* Vinyl Record */}
        <div className="platter-well">
          <div className={`vinyl-disc ${isPlaying ? 'spinning' : 'paused'}`}>
            {/* Vinyl Grooves Texture */}
            <div className="vinyl-groove groove-1" />
            <div className="vinyl-groove groove-2" />
            <div className="vinyl-groove groove-3" />
            <div className="vinyl-groove groove-4" />
            <div className="vinyl-groove groove-5" />

            {/* Shiny Light Reflection Sheen */}
            <div className="vinyl-sheen" />

            {/* Center Label */}
            <div className="vinyl-label">
              <span className="vinyl-label-title">GISELLE</span>
              <span className="vinyl-label-sub">SIDE A • 33 RPM</span>
              <div className="vinyl-spindle" />
            </div>
          </div>
        </div>

        {/* Tonearm Assembly */}
        <div className={`tonearm-assembly ${isPlaying ? 'arm-on-record' : 'arm-on-rest'}`}>
          <div className="tonearm-base">
            <div className="tonearm-counterweight" />
          </div>
          <div className="tonearm-rod">
            <div className="tonearm-headshell">
              <div className="tonearm-cartridge" />
            </div>
          </div>
        </div>

        {/* Status Indicator LED */}
        <div className={`turntable-led ${isPlaying ? 'active' : ''}`} />
      </div>

      {/* Player Track Info & Controls */}
      <div className="vinyl-controls">
        <div className="vinyl-track-info">
          <h4 className="vinyl-track-title">🎵 {title}</h4>
          <span className="vinyl-track-artist">{artist}</span>
        </div>

        {/* Progress Bar / Scrubber */}
        <div className="vinyl-scrubber-row">
          <span className="time-display">{formatTime(Math.floor(currentTime))}</span>
          <input
            type="range"
            className="vinyl-progress-bar"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
          />
          <span className="time-display">{formatTime(Math.floor(duration))}</span>
        </div>

        {/* Action Controls */}
        <div className="vinyl-buttons-row">
          <button
            type="button"
            className="vinyl-play-btn"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? '⏸️ PAUSE' : '▶️ PLAY SONG'}
          </button>

          {/* Volume Control */}
          <div className="vinyl-volume-control">
            <span className="volume-icon">{volume === 0 ? '🔇' : volume < 0.5 ? '🔉' : '🔊'}</span>
            <input
              type="range"
              className="vinyl-volume-slider"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
            />
          </div>
        </div>

        {hasError && (
          <p className="vinyl-hint">
            💡 Letakkan lagu favorit kalian di <code>public/music/our-song.mp3</code>
          </p>
        )}
      </div>
    </div>
  );
}
