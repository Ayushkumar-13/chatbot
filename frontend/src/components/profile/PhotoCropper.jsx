import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const getCroppedImg = (image, crop) => {
    const canvas = document.createElement('canvas');
    // Compute the ratio of the original natural image vs its displayed size
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // DP size limit
    const targetSize = 400;
    
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = targetSize * pixelRatio;
    canvas.height = targetSize * pixelRatio;
    
    const ctx = canvas.getContext('2d');
    ctx.scale(pixelRatio, pixelRatio);
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        targetSize,
        targetSize
    );

    return canvas.toDataURL('image/jpeg', 0.9);
};

const PhotoCropper = ({ imageSrc, onCropComplete, onCancel }) => {
    const [crop, setCrop] = useState();
    const imgRef = useRef(null);

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const cropTarget = makeAspectCrop(
            { unit: '%', width: 80 },
            1, // enforce 1:1 aspect ratio
            width,
            height
        );
        const centeredCrop = centerCrop(cropTarget, width, height);
        setCrop(centeredCrop);
    };

    const handleSave = () => {
        if (!imgRef.current || !crop || !crop.width || !crop.height) {
            onCancel(); 
            return;
        }
        
        try {
            const croppedBase64 = getCroppedImg(imgRef.current, crop);
            onCropComplete(croppedBase64);
        } catch (e) {
            console.error('Crop failed', e);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 300,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
            <h3 style={{ color: '#fff', marginBottom: 20, fontSize: 18, fontWeight: 500 }}>
                Adjust Profile Photo
            </h3>
            
            <div style={{ 
                width: '100%', maxWidth: '80vw', maxHeight: '60vh', 
                display: 'flex', justifyContent: 'center', 
                background: '#111b21', borderRadius: 8, padding: 12
            }}>
                <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    aspect={1}
                    circularCrop
                    keepSelection
                    minWidth={50}
                >
                    <img 
                        ref={imgRef}
                        src={imageSrc} 
                        onLoad={onImageLoad}
                        style={{ maxHeight: 'calc(60vh - 24px)', maxWidth: '100%', objectFit: 'contain' }}
                        alt="Crop target" 
                    />
                </ReactCrop>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 16 }}>
                Drag the highlighted circle over the part of the image you want.
            </p>

            <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
                <button onClick={onCancel} style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', borderRadius: 24, padding: '10px 24px', cursor: 'pointer', transition: 'background 0.2s' }}>
                    Cancel
                </button>
                <button onClick={handleSave} style={{ background: 'var(--app-accent)', color: '#fff', border: 'none', borderRadius: 24, padding: '10px 24px', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s' }}>
                    Apply Photo
                </button>
            </div>
        </div>
    );
};

export default PhotoCropper;
