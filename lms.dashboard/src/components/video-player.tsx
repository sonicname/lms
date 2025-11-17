import { ActionIcon, Group, Menu, Slider, Text, Tooltip } from '@mantine/core';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  LuMaximize,
  LuMinimize,
  LuPause,
  LuPlay,
  LuSettings,
  LuVolume2,
  LuVolumeX,
} from 'react-icons/lu';

export type VideoSource = { src: string; type?: string; label?: string };
export type VideoTrack = {
  src: string;
  label: string;
  srclang: string;
  default?: boolean;
};

export type VideoPlayerProps = {
  src?: string;
  sources?: VideoSource[];
  poster?: string;
  tracks?: VideoTrack[];
  className?: string;
  style?: React.CSSProperties;
  autoPlay?: boolean;
};

function formatTime(sec: number) {
  if (!isFinite(sec)) return '0:00';
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((sec / 60) % 60)
    .toString()
    .padStart(2, '0');
  const h = Math.floor(sec / 3600);
  return h > 0 ? `${h}:${m}:${s}` : `${Number(m)}:${s}`;
}

export default function VideoPlayer({
  src,
  sources,
  poster,
  tracks,
  className,
  style,
  autoPlay,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [playing, setPlaying] = useState<boolean>(!!autoPlay);
  const [duration, setDuration] = useState<number>(0);
  const [current, setCurrent] = useState<number>(0);
  const [seeking, setSeeking] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('dash_video_volume');
    return saved ? Number(saved) : 1;
  });
  const [muted, setMuted] = useState<boolean>(false);
  const [rate, setRate] = useState<number>(1);
  const [isFs, setIsFs] = useState<boolean>(false);
  const [activeSrc, setActiveSrc] = useState<string | undefined>(src);
  const [showControls, setShowControls] = useState<boolean>(true);
  const hideTimerRef = useRef<number | null>(null);

  const sourceList: VideoSource[] = useMemo(() => {
    if (sources?.length) return sources;
    if (src) return [{ src }];
    return [];
  }, [sources, src]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = volume;
    v.muted = muted;
    v.playbackRate = rate;
    if (autoPlay) v.play().catch(() => void 0);
  }, [volume, muted, rate, autoPlay]);

  useEffect(() => {
    localStorage.setItem('dash_video_volume', String(volume));
  }, [volume]);

  useEffect(() => {
    const onFsChange = () => {
      const doc: any = document;
      setIsFs(!!(doc.fullscreenElement || doc.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    // @ts-ignore
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      // @ts-ignore
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play()
        .then(() => setPlaying(true))
        .catch(() => void 0);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  const toggleMute = () => setMuted((m) => !m);

  const seekTo = (time: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.min(Math.max(time, 0), duration || v.duration || 0);
  };

  const requestFs = () => {
    const el: any = containerRef.current;
    if (!el) return;
    if (el.requestFullscreen) el.requestFullscreen();
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  };
  const exitFs = () => {
    const d: any = document;
    if (document.exitFullscreen) document.exitFullscreen();
    else if (d.webkitExitFullscreen) d.webkitExitFullscreen();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    const v = videoRef.current;
    if (!v) return;
    setShowControls(true);
    if (e.key === ' ' || e.key.toLowerCase() === 'k') {
      e.preventDefault();
      togglePlay();
    } else if (e.key.toLowerCase() === 'm') {
      setMuted((m) => !m);
    } else if (e.key.toLowerCase() === 'f') {
      isFs ? exitFs() : requestFs();
    } else if (e.key.toLowerCase() === 'j') {
      seekTo(v.currentTime - 10);
    } else if (e.key.toLowerCase() === 'l') {
      seekTo(v.currentTime + 10);
    } else if (e.key === 'ArrowLeft') {
      seekTo(v.currentTime - 5);
    } else if (e.key === 'ArrowRight') {
      seekTo(v.currentTime + 5);
    } else if (e.key === 'ArrowUp') {
      setVolume((vol) => Math.min(1, vol + 0.05));
    } else if (e.key === 'ArrowDown') {
      setVolume((vol) => Math.max(0, vol - 0.05));
    }
    if (!v.paused) scheduleAutoHide();
  };

  const handleSelectSource = (s: VideoSource) => {
    const v = videoRef.current;
    if (!v) return;
    const wasPlaying = !v.paused;
    const t = v.currentTime;
    setActiveSrc(s.src);
    requestAnimationFrame(() => {
      const vv = videoRef.current;
      if (!vv) return;
      vv.currentTime = t;
      vv.playbackRate = rate;
      vv.muted = muted;
      vv.volume = volume;
      if (wasPlaying) vv.play().catch(() => void 0);
    });
  };

  const clearHideTimer = () => {
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  };

  const scheduleAutoHide = (delay = 2000) => {
    clearHideTimer();
    hideTimerRef.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
      hideTimerRef.current = null;
    }, delay);
  };

  useEffect(() => {
    if (playing) {
      scheduleAutoHide();
    } else {
      clearHideTimer();
      setShowControls(true);
    }
    return clearHideTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'relative',
        background: 'black',
        borderRadius: 8,
        overflow: 'hidden',
        ...style,
      }}
      tabIndex={0}
      onKeyDown={onKeyDown}
      onDoubleClick={() => (isFs ? exitFs() : requestFs())}
      onMouseMove={() => {
        setShowControls(true);
        if (videoRef.current && !videoRef.current.paused) {
          scheduleAutoHide();
        }
      }}
      onMouseLeave={() => {
        if (videoRef.current && !videoRef.current.paused) {
          setShowControls(false);
          clearHideTimer();
        }
      }}
    >
      <video
        ref={videoRef}
        poster={poster}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        onLoadedMetadata={(e) =>
          setDuration((e.target as HTMLVideoElement).duration || 0)
        }
        onTimeUpdate={(e) =>
          !seeking && setCurrent((e.target as HTMLVideoElement).currentTime)
        }
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        playsInline
      >
        {(activeSrc || src) && <source src={activeSrc || src} />}
        {sourceList
          .filter((s) =>
            activeSrc || src ? s.src !== (activeSrc || src) : true,
          )
          .map((s, i) => (
            <source key={i} src={s.src} type={s.type} />
          ))}
        {tracks?.map((t, i) => (
          <track
            key={i}
            kind='subtitles'
            srcLang={t.srclang}
            label={t.label}
            src={t.src}
            default={t.default}
          />
        ))}
      </video>

      {/* Center clickable overlay: toggle play/pause */}
      <div
        role='button'
        aria-label='Toggle playback'
        onClick={togglePlay}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          background: 'transparent',
          pointerEvents: 'auto',
        }}
      >
        {!playing ? (
          <LuPlay size={64} color='white' style={{ opacity: 0.85 }} />
        ) : null}
      </div>

      {/* Bottom controls overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: 8,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0) 60%, rgba(0,0,0,0.55) 100%)',
          padding: 12,
          opacity: showControls || !playing ? 1 : 0,
          transition: 'opacity 200ms ease',
          pointerEvents: showControls || !playing ? 'auto' : 'none',
          zIndex: 2,
        }}
        onClick={(e) => {
          if (e.currentTarget === e.target) togglePlay();
        }}
      >
        <Slider
          value={
            seeking ? undefined : duration ? (current / duration) * 100 : 0
          }
          onChange={(val) => {
            setSeeking(true);
            const t = (Number(val) / 100) * (duration || 0);
            setCurrent(t);
          }}
          onChangeEnd={(val) => {
            const t = (Number(val) / 100) * (duration || 0);
            seekTo(t);
            setSeeking(false);
          }}
          color='red'
          size='sm'
        />

        <Group justify='space-between' align='center' gap='xs'>
          <Group gap='xs'>
            <Tooltip label={playing ? 'Tạm dừng (k)' : 'Phát (k)'}>
              <ActionIcon variant='subtle' color='gray' onClick={togglePlay}>
                {playing ? <LuPause color='white' /> : <LuPlay color='white' />}
              </ActionIcon>
            </Tooltip>
            <Tooltip label={muted ? 'Bật tiếng (m)' : 'Tắt tiếng (m)'}>
              <ActionIcon variant='subtle' color='gray' onClick={toggleMute}>
                {muted || volume === 0 ? (
                  <LuVolumeX color='white' />
                ) : (
                  <LuVolume2 color='white' />
                )}
              </ActionIcon>
            </Tooltip>
            <div style={{ width: 100 }}>
              <Slider
                value={muted ? 0 : volume * 100}
                onChange={(v) => setVolume(Number(v) / 100)}
                onChangeEnd={(v) => setVolume(Number(v) / 100)}
                size='xs'
              />
            </div>
            <Text size='xs' c='gray.2' style={{ minWidth: 84 }}>
              {formatTime(current)} / {formatTime(duration)}
            </Text>
          </Group>

          <Group gap='xs'>
            {sourceList.length > 1 && (
              <Menu shadow='md' withArrow>
                <Menu.Target>
                  <ActionIcon variant='subtle' color='gray'>
                    <LuSettings color='white' />
                  </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>Chất lượng</Menu.Label>
                  {sourceList.map((s, i) => (
                    <Menu.Item
                      key={i}
                      onClick={() => handleSelectSource(s)}
                      rightSection={
                        (activeSrc || src) === s.src ? (
                          <span
                            style={{ color: 'var(--mantine-color-blue-6)' }}
                          >
                            ✓
                          </span>
                        ) : null
                      }
                    >
                      {s.label || s.type || `Nguồn ${i + 1}`}
                    </Menu.Item>
                  ))}
                  <Menu.Divider />
                  <Menu.Label>Tốc độ</Menu.Label>
                  {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((r) => (
                    <Menu.Item
                      key={r}
                      onClick={() => setRate(r)}
                      rightSection={rate === r ? '✓' : undefined}
                    >
                      {r}x
                    </Menu.Item>
                  ))}
                </Menu.Dropdown>
              </Menu>
            )}
            <Tooltip
              label={isFs ? 'Thoát toàn màn hình (f)' : 'Toàn màn hình (f)'}
            >
              <ActionIcon
                variant='subtle'
                color='gray'
                onClick={() => (isFs ? exitFs() : requestFs())}
              >
                {isFs ? (
                  <LuMinimize color='white' />
                ) : (
                  <LuMaximize color='white' />
                )}
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </div>
    </div>
  );
}
