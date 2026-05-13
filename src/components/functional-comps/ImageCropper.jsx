import { useState } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';

function ImageCropper({ imageFile, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const imageUrl = URL.createObjectURL(imageFile);

  const onCropChange = (crop) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom) => {
    setZoom(zoom);
  };

  const onCropCompleted = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCrop = async () => {
    try {
      const croppedImage = await getCroppedImg(imageUrl, croppedAreaPixels);
      onCropComplete(croppedImage);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
    URL.revokeObjectURL(imageUrl);
  };

  return (
    <div className="cropper-overlay">
      <div className="cropper-container">
        <div className="cropper-box">
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropCompleted}
          />
        </div>
        <div className="cropper-controls">
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
          />
          <button onClick={handleCrop}>Crop & Upload</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropper;