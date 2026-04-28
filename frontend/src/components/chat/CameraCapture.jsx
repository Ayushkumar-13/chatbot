import React, { useRef, useEffect, useState } from 'react';
import toast from 'react-hot-toast';

const CameraCapture = ({ onCapture, onClose }) => {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(s => { 
                setStream(s); 
                if (videoRef.current) videoRef.current.srcObject = s; 
            })
            .catch(() => toast.error('Camera not accessible'));
            
        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
        };
    }, []);

    const capture = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
        
        onCapture(canvas.toDataURL('image/jpeg', 0.8));
        if (stream) stream.getTracks().forEach(t => t.stop());
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: '#000', zIndex: 100,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
            <video ref={videoRef} autoPlay style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8, transform: 'scaleX(-1)' }} />
            <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
                <button onClick={onClose} style={{ background: '#333', color: '#fff', border: 'none', borderRadius: 999, padding: '12px 28px', cursor: 'pointer', fontSize: 15 }}>Cancel</button>
                <button onClick={capture} style={{ background: 'var(--app-accent)', color: '#fff', border: 'none', borderRadius: 999, padding: '12px 28px', cursor: 'pointer', fontSize: 15, fontWeight: 600 }}>Capture</button>
            </div>
        </div>
    );
};

export default CameraCapture;
