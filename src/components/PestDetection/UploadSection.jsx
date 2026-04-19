import React, { useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';

const UploadSection = ({ image, isAnalyzing, onUpload }) => {
  const { theme } = useTheme();
  const fileInputRef = useRef(null);

  // ── Paste detection (Ctrl+V) ──────────────────────────────────────────────
  useEffect(() => {
    const handlePaste = (e) => {
      if (isAnalyzing) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) {
            // Convert blob to a proper File with a readable name
            const file = new File([blob], `pasted-image.${blob.type.split('/')[1] || 'png'}`, {
              type: blob.type,
            });
            onUpload(file);
          }
          break;
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isAnalyzing, onUpload]);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div 
      className={`rounded-xl shadow-xl overflow-hidden ${
        theme === 'dark' ? 'bg-zinc-900' : 'bg-white'
      }`}
      style={{ animation: 'slideUp 0.6s ease-out' }}
    >
      <div
        className={`border-2 border-dashed p-8 sm:p-12 text-center transition-all cursor-pointer ${
          theme === 'dark'
            ? 'border-gray-700 hover:border-emerald-500 hover:bg-emerald-900/10'
            : 'border-gray-300 hover:border-emerald-500 hover:bg-emerald-50'
        }`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        {image ? (
          <div className="space-y-4">
            <img
              src={URL.createObjectURL(image)}
              alt="preview"
              className="w-full h-48 sm:h-64 object-cover rounded-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all text-sm"
            >
              Change Image
            </button>
          </div>
        ) : isAnalyzing ? (
          <div className="space-y-4">
            <div className="inline-block">
              <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
            <p className={`text-base sm:text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-700'
            }`}>
              Analyzing image...
            </p>
            <p className={`text-xs sm:text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              AI is scanning for pests and diseases
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-4xl sm:text-5xl">📸</div>
            <p className={`text-base sm:text-lg font-semibold ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Upload Plant Image
            </p>
            <p className={`text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Drag & drop, click to select, or paste (Ctrl+V)
            </p>
            <p className={`text-xs ${
              theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
            }`}>
              PNG, JPG up to 10MB
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default UploadSection;
