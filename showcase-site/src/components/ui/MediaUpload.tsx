import { useState } from 'react';
import { Image, Play, Upload, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface MediaUploadProps {
  title: string;
  description?: string;
  aspectRatio?: 'video' | 'square' | 'portrait';
  className?: string;
  onUpload?: (file: File) => void;
  previewUrl?: string;
  showUploadHint?: boolean;
}

export default function MediaUpload({
  title,
  description,
  aspectRatio = 'video',
  className = '',
  onUpload,
  previewUrl,
  showUploadHint = true,
}: MediaUploadProps) {
  const { t } = useTranslation('common');
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(previewUrl || null);

  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/') || file.type === 'image/gif')) {
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
    onUpload?.(file);
  };

  const clearPreview = () => {
    setPreview(null);
  };

  return (
    <motion.div
      className={`relative ${aspectClasses[aspectRatio]} rounded-2xl overflow-hidden ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <AnimatePresence mode="wait">
        {preview ? (
          // Preview mode
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full group"
          >
            <img
              src={preview}
              alt={title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={clearPreview}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </motion.div>
        ) : (
          // Upload/Placeholder mode
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`w-full h-full flex flex-col items-center justify-center p-8 text-center transition-all duration-300 ${
              isDragging
                ? 'bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 border-2 border-purple-400 dark:border-purple-600'
                : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(147,51,234,0.3),transparent_70%)]" />
            </div>

            <div className="relative z-10">
              {/* Icon */}
              <motion.div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 mx-auto ${
                  isDragging
                    ? 'bg-purple-500'
                    : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 dark:from-purple-500/30 dark:to-blue-500/30'
                }`}
                animate={isDragging ? { scale: 1.1 } : { scale: 1 }}
              >
                {isDragging ? (
                  <Upload className="w-8 h-8 text-white" />
                ) : (
                  <Image className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                )}
              </motion.div>

              {/* Title */}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>

              {/* Description */}
              {description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-xs mx-auto">
                  {description}
                </p>
              )}

              {/* Upload hint */}
              {showUploadHint && (
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-gray-200 dark:border-gray-700">
                  <Play className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {t('showcase.placeholder', 'Screenshot or GIF coming soon')}
                  </span>
                </div>
              )}

              {/* Hidden file input */}
              {onUpload && (
                <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('upload.button', 'Upload')}</span>
                  <input
                    type="file"
                    accept="image/*,.gif"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
