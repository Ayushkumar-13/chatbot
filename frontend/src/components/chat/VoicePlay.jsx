import React, { useState, useRef, useEffect } from 'react';

const VoicePlay = ({ audioUrl, waveform, isMine }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentWave, setCurrentWave] = useState(waveform || new Array(30).fill(0.1));
    const audioRef = useRef(null);
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };

    const setupVisualizer = () => {
        if (audioCtxRef.current) return;
        
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaElementSource(audioRef.current);
            source.connect(analyser);
            analyser.connect(audioCtx.destination);
            analyser.fftSize = 256; 

            audioCtxRef.current = audioCtx;
            analyserRef.current = analyser;
        } catch (e) { console.error("Audio Context Init Failed", e); }
    };

    const updateWave = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const sampleCount = 30;
        const step = Math.floor(dataArray.length / sampleCount / 1.5); 
        const values = [];
        for(let i=0; i<sampleCount; i++) {
            values.push(Math.max(0.1, dataArray[i * step] / 255));
        }
        setCurrentWave(values);
        animationFrameRef.current = requestAnimationFrame(updateWave);
    };

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onPlay = () => {
            setupVisualizer();
            setIsPlaying(true);
            updateWave();
        };
        const onPause = () => {
            setIsPlaying(false);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            setCurrentWave(waveform || new Array(30).fill(0.1));
        };
        const onEnded = () => {
            setIsPlaying(false);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            setCurrentWave(waveform || new Array(30).fill(0.1));
        };

        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);

        return () => {
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('ended', onEnded);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
        };
    }, [waveform]);

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 260, padding: '4px 0' }}>
            <button type="button" onClick={togglePlay} style={{ 
                background: isMine ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)', 
                border: 'none', borderRadius: '50%', width: 36, height: 36, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                cursor: 'pointer', color: 'currentColor', flexShrink: 0 
            }}>
                {isPlaying ? (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                ) : (
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                )}
            </button>
            
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3, height: 32, justifyContent: 'center' }}>
                {Array.isArray(currentWave) && currentWave.map((h, i) => (
                    <div key={i} style={{ 
                        width: 3, 
                        height: `${Math.max(15, h * 100)}%`, 
                        minHeight: 4,
                        background: isMine ? '#fff' : '#25D366', 
                        borderRadius: 3,
                        transition: isPlaying ? 'height 0.08s ease-out' : 'height 0.3s',
                        opacity: h > 0.1 ? 1 : 0.5
                    }} />
                ))}
            </div>
            <audio ref={audioRef} src={audioUrl} crossOrigin="anonymous" hidden />
        </div>
    );
};

export default VoicePlay;
