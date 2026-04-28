import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

const useAudioRecorder = (onSend) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [visualizerData, setVisualizerData] = useState(new Array(30).fill(0));
    
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingIntervalRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const animationFrameRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 256; 

            audioContextRef.current = audioContext;
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVisualizer = () => {
                analyser.getByteFrequencyData(dataArray);
                const sampleCount = 30;
                const step = Math.floor(dataArray.length / sampleCount / 1.5);
                const values = [];
                for(let i=0; i<sampleCount; i++) {
                    values.push(dataArray[i * step] / 255);
                }
                setVisualizerData(values);
                animationFrameRef.current = requestAnimationFrame(updateVisualizer);
            };
            updateVisualizer();

            const options = {
                mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                    ? 'audio/webm;codecs=opus'
                    : 'audio/webm',
                audioBitsPerSecond: 128000
            };
            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            recordingIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error("Failed to start recording", err);
            toast.error("Microphone access denied");
        }
    };

    const stopAndCleanUpAudio = () => {
        if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
        
        setIsRecording(false);
        setVisualizerData(new Array(30).fill(0));
    };

    const stopAndSendRecording = () => {
        if (!mediaRecorderRef.current) return;
        
        const finalWaveData = [...visualizerData];
        stopAndCleanUpAudio();

        const toastId = toast.loading("Processing audio...");

        mediaRecorderRef.current.onstop = () => {
            if (audioChunksRef.current.length === 0) {
                toast.dismiss(toastId);
                toast.error("No audio data captured");
                return;
            }

            const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current.mimeType });
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            
            if (audioBlob.size < 100) {
                toast.dismiss(toastId);
                toast.error("Recording too short");
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onerror = () => {
                toast.dismiss(toastId);
                toast.error("Failed to read audio data");
            };
            reader.onloadend = () => {
                toast.dismiss(toastId);
                const base64AudioMessage = reader.result;
                onSend({ audio: base64AudioMessage, waveform: finalWaveData });
            };
        };
        mediaRecorderRef.current.stop();
    };

    const cancelRecording = () => {
        if (!mediaRecorderRef.current) return;
        stopAndCleanUpAudio();
        mediaRecorderRef.current.onstop = () => {
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        };
        mediaRecorderRef.current.stop();
    };

    const formatDuration = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return {
        isRecording,
        recordingTime,
        visualizerData,
        startRecording,
        stopAndSendRecording,
        cancelRecording,
        formatDuration
    };
};

export default useAudioRecorder;
