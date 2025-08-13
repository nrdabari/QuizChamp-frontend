import React, { useState, useRef, useCallback } from 'react';

const ImageMerger = () => {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [preview1, setPreview1] = useState(null);
  const [preview2, setPreview2] = useState(null);
  const [mergedImage, setMergedImage] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [direction, setDirection] = useState('horizontal');
  const [spacing, setSpacing] = useState(10);
  const [quality, setQuality] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const [showCropTool, setShowCropTool] = useState(false);
  const [resizeImages, setResizeImages] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  
  // Crop state
  const [cropStart, setCropStart] = useState({ x: 0, y: 0 });
  const [cropEnd, setCropEnd] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [cropPreview, setCropPreview] = useState(null);
  
  const canvasRef = useRef(null);
  const cropCanvasRef = useRef(null);
  const downloadLinkRef = useRef(null);
  const imageRef = useRef(null);

  const handleImageUpload = (event, imageNumber) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (imageNumber === 1) {
          setImage1(img);
          setPreview1(e.target.result);
        } else {
          setImage2(img);
          setPreview2(e.target.result);
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const mergeImages = () => {
    if (!image1 || !image2) {
      alert('Please select both images first!');
      return;
    }

    setIsLoading(true);
    
    // Use setTimeout to allow UI to update with loading state
    setTimeout(() => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      let canvasWidth, canvasHeight;

      if (direction === 'horizontal') {
        canvasWidth = image1.width + image2.width + spacing;
        canvasHeight = Math.max(image1.height, image2.height);
      } else {
        canvasWidth = Math.max(image1.width, image2.width);
        canvasHeight = image1.height + image2.height + spacing;
      }

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      // Fill with selected background color (skip if transparent)
      if (backgroundColor !== '#transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      if (direction === 'horizontal') {
        // Draw images side by side
        ctx.drawImage(image1, 0, (canvasHeight - image1.height) / 2);
        ctx.drawImage(image2, image1.width + spacing, (canvasHeight - image2.height) / 2);
      } else {
        // Draw images vertically
        ctx.drawImage(image1, (canvasWidth - image1.width) / 2, 0);
        ctx.drawImage(image2, (canvasWidth - image2.width) / 2, image1.height + spacing);
      }

      // Convert to JPEG
      const mergedDataURL = canvas.toDataURL('image/jpeg', quality);
      setMergedImage(mergedDataURL);
      setCroppedImage(null);
      setShowCropTool(false);
      setIsLoading(false);
    }, 100);
  };

  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const { naturalWidth, naturalHeight, width, height } = imageRef.current;
      setImageSize({ 
        width: width, 
        height: height, 
        naturalWidth, 
        naturalHeight 
      });
    }
  }, []);

  const getRelativePosition = (e) => {
    const rect = imageRef.current.getBoundingClientRect();
    const scaleX = imageSize.naturalWidth / imageSize.width;
    const scaleY = imageSize.naturalHeight / imageSize.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e) => {
    if (!showCropTool) return;
    const pos = getRelativePosition(e);
    setCropStart(pos);
    setCropEnd(pos);
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !showCropTool) return;
    const pos = getRelativePosition(e);
    setCropEnd(pos);
    
    // Generate live preview
    generateCropPreview(cropStart, pos);
  };

  const handleMouseUp = () => {
    if (!showCropTool) return;
    setIsDragging(false);
    
    // Generate final preview when mouse is released
    if (Math.abs(cropEnd.x - cropStart.x) > 10 && Math.abs(cropEnd.y - cropStart.y) > 10) {
      generateCropPreview(cropStart, cropEnd);
    }
  };

  const generateCropPreview = (start, end) => {
    if (!mergedImage || !imageSize.naturalWidth) return;

    const canvas = cropCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Calculate crop dimensions
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const width = Math.abs(end.x - start.x);
    const height = Math.abs(end.y - start.y);

    if (width < 10 || height < 10) return;

    canvas.width = width;
    canvas.height = height;

    // Fill with selected background color for crop preview
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, width, height);

    // Create image from merged image data
    const img = new Image();
    img.onload = () => {
      // Only fill background if it's not transparent
      if (backgroundColor !== '#transparent') {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
      const previewDataURL = canvas.toDataURL('image/jpeg', quality);
      setCropPreview(previewDataURL);
    };
    img.src = mergedImage;
  };

  const cropImage = () => {
    if (!cropPreview) {
      alert('Please select an area to crop first');
      return;
    }
    setCroppedImage(cropPreview);
  };

  const resetCrop = () => {
    setCropStart({ x: 0, y: 0 });
    setCropEnd({ x: 0, y: 0 });
    setCroppedImage(null);
    setCropPreview(null);
  };

  const downloadImage = (imageSource = null) => {
    const imageToDownload = imageSource || croppedImage || mergedImage;
    if (!imageToDownload) return;

    const link = downloadLinkRef.current;
    link.href = imageToDownload;
    const filename = imageSource ? 'merged-image' : croppedImage ? 'cropped-image' : 'merged-image';
    link.download = `${filename}-${Date.now()}.jpg`;
    link.click();
  };

  const resetTool = () => {
    setImage1(null);
    setImage2(null);
    setPreview1(null);
    setPreview2(null);
    setMergedImage(null);
    setCroppedImage(null);
    setCropPreview(null);
    setShowCropTool(false);
    setIsLoading(false);
    resetCrop();
    
    // Clear file inputs
    document.getElementById('image1-input').value = '';
    document.getElementById('image2-input').value = '';
  };

  const bothImagesLoaded = image1 && image2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              🖼️ Image Merger Tool
            </h1>
            <p className="text-gray-600">Merge two images horizontally or vertically with custom spacing</p>
          </div>

          {/* Upload Section */}
          <div className={`border-2 border-dashed rounded-xl p-8 text-center mb-8 transition-all duration-300 ${
            bothImagesLoaded 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
          }`}>
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Upload Your Images</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Image 1</label>
                <input
                  id="image1-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 1)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-200 rounded-lg"
                />
                {preview1 && (
                  <div className="mt-3 p-2 border-2 border-blue-200 rounded-lg bg-white">
                    <img src={preview1} alt="Preview 1" className="max-w-full max-h-32 mx-auto rounded" />
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Image 2</label>
                <input
                  id="image2-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 2)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-gray-200 rounded-lg"
                />
                {preview2 && (
                  <div className="mt-3 p-2 border-2 border-blue-200 rounded-lg bg-white">
                    <img src={preview2} alt="Preview 2" className="max-w-full max-h-32 mx-auto rounded" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Section */}
          {bothImagesLoaded && (
            <div className="mb-8 animate-fadeIn">
              <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">Image Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <h4 className="text-lg font-medium text-gray-600 mb-3">Image 1</h4>
                  <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                    <img src={preview1} alt="Image 1" className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm" />
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-medium text-gray-600 mb-3">Image 2</h4>
                  <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
                    <img src={preview2} alt="Image 2" className="max-w-full max-h-64 mx-auto rounded-lg shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Controls Section */}
          {bothImagesLoaded && (
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-6 text-center">Merge Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label htmlFor="direction" className="block text-sm font-medium text-gray-700 mb-2">
                    Merge Direction
                  </label>
                  <select
                    id="direction"
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                  >
                    <option value="horizontal">🔄 Horizontal</option>
                    <option value="vertical">⬇️ Vertical</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="resizeImages" className="block text-sm font-medium text-gray-700 mb-2">
                    Image Sizing
                  </label>
                  <select
                    id="resizeImages"
                    value={resizeImages}
                    onChange={(e) => setResizeImages(e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm"
                  >
                    <option value="true">📏 Auto-resize</option>
                    <option value="false">📐 Keep original</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="backgroundColor" className="block text-sm font-medium text-gray-700 mb-2">
                    Background
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      id="backgroundColor"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-9 border border-gray-300 rounded cursor-pointer"
                    />
                    <select
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 px-2 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs"
                    >
                      <option value="#ffffff">⚪ White</option>
                      <option value="#000000">⚫ Black</option>
                      <option value="#f3f4f6">🔘 Light Gray</option>
                      <option value="#transparent">🔳 Transparent</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="spacing" className="block text-sm font-medium text-gray-700 mb-2">
                    Spacing: {spacing}px
                  </label>
                  <input
                    type="range"
                    id="spacing"
                    min="0"
                    max="100"
                    value={spacing}
                    onChange={(e) => setSpacing(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
                
                <div>
                  <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-2">
                    Quality: {Math.round(quality * 100)}%
                  </label>
                  <input
                    type="range"
                    id="quality"
                    min="0.5"
                    max="1"
                    step="0.1"
                    value={quality}
                    onChange={(e) => setQuality(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
              
              <div className="flex justify-center gap-4 mt-8">
                <button
                  onClick={mergeImages}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      🔀 Merge Images
                    </>
                  )}
                </button>
                <button
                  onClick={resetTool}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🔄 Reset
                </button>
              </div>
            </div>
          )}

          {/* Result Section */}
          {mergedImage && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-8 animate-fadeIn">
              <h3 className="text-2xl font-semibold text-green-700 mb-6 text-center flex items-center justify-center gap-2">
                ✅ Merged Image Result
              </h3>
              
              <div className={`grid ${showCropTool && cropPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-8`}>
                {/* Main merged image */}
                <div className="text-center">
                  <h4 className="text-lg font-medium text-gray-700 mb-4">Merged Image</h4>
                  <div className="inline-block p-4 bg-white rounded-xl shadow-lg mb-6 relative">
                    <img 
                      ref={imageRef}
                      src={mergedImage} 
                      alt="Merged Result" 
                      className="max-w-full max-h-80 mx-auto rounded-lg shadow-sm cursor-crosshair"
                      onLoad={handleImageLoad}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      style={{ userSelect: 'none' }}
                    />
                    
                    {/* Crop overlay */}
                    {showCropTool && (isDragging || cropPreview) && (
                      <div
                        className="absolute border-2 border-blue-500 bg-blue-200 bg-opacity-30 pointer-events-none"
                        style={{
                          left: `${Math.min(cropStart.x, cropEnd.x) * (imageSize.width / imageSize.naturalWidth) + 16}px`,
                          top: `${Math.min(cropStart.y, cropEnd.y) * (imageSize.height / imageSize.naturalHeight) + 16}px`,
                          width: `${Math.abs(cropEnd.x - cropStart.x) * (imageSize.width / imageSize.naturalWidth)}px`,
                          height: `${Math.abs(cropEnd.y - cropStart.y) * (imageSize.height / imageSize.naturalHeight)}px`,
                        }}
                      />
                    )}
                  </div>
                  
                  <div className="flex flex-wrap justify-center gap-3 mb-4">
                    <button
                      onClick={() => downloadImage(mergedImage)}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
                    >
                      📥 Download Original
                    </button>
                    
                    <button
                      onClick={() => {
                        setShowCropTool(!showCropTool);
                        if (showCropTool) resetCrop();
                      }}
                      className={`${
                        showCropTool 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                      } text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm`}
                    >
                      {showCropTool ? '✖️ Cancel Crop' : '✂️ Crop Image'}
                    </button>
                  </div>
                </div>

                {/* Live crop preview */}
                {showCropTool && cropPreview && (
                  <div className="text-center">
                    <h4 className="text-lg font-medium text-blue-700 mb-4">Crop Preview</h4>
                    <div className="inline-block p-4 bg-blue-50 border-2 border-blue-200 rounded-xl shadow-lg mb-6">
                      <img 
                        src={cropPreview} 
                        alt="Crop Preview" 
                        className="max-w-full max-h-80 mx-auto rounded-lg shadow-sm"
                      />
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-3 mb-4">
                      <button
                        onClick={cropImage}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
                      >
                        ✂️ Apply Crop
                      </button>
                      
                      <button
                        onClick={() => downloadImage(cropPreview)}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
                      >
                        📥 Download Preview
                      </button>
                      
                      <button
                        onClick={resetCrop}
                        className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm"
                      >
                        🔄 Reset Selection
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {showCropTool && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-blue-700 font-medium mb-2">
                    🖱️ Crop Instructions:
                  </p>
                  <p className="text-xs text-blue-600">
                    Click and drag on the merged image to select the area you want to crop. The preview will update in real-time.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Cropped Image Result */}
          {croppedImage && (
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-8 mt-6 animate-fadeIn">
              <h3 className="text-2xl font-semibold text-purple-700 mb-6 text-center flex items-center justify-center gap-2">
                ✂️ Cropped Image Result
              </h3>
              
              <div className="text-center">
                <div className="inline-block p-4 bg-white rounded-xl shadow-lg mb-6">
                  <img 
                    src={croppedImage} 
                    alt="Cropped Result" 
                    className="max-w-full max-h-96 mx-auto rounded-lg shadow-sm"
                  />
                </div>
                
                <div className="space-y-4">
                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      onClick={() => downloadImage()}
                      className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      📥 Download Cropped
                    </button>
                    
                    <button
                      onClick={resetCrop}
                      className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      🔄 Reset Crop
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hidden Elements */}
          <canvas ref={canvasRef} className="hidden" />
          <canvas ref={cropCanvasRef} className="hidden" />
          <a ref={downloadLinkRef} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default ImageMerger;