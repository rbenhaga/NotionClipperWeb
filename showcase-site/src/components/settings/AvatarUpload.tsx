import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Constants for avatar constraints
const MAX_FILE_SIZE = 100 * 1024; // 100KB max
const MAX_DIMENSION = 256; // Max width/height
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

interface AvatarUploadProps {
  currentAvatar?: string | null;
  userName?: string;
  userEmail?: string;
  onAvatarChange?: (newAvatar: string | null) => void;
  compact?: boolean; // Compact mode for inline display
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  userName,
  userEmail,
  onAvatarChange,
  compact = false,
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Get initials for fallback avatar
  const getInitials = () => {
    if (userName) return userName.charAt(0).toUpperCase();
    if (userEmail) return userEmail.charAt(0).toUpperCase();
    return 'U';
  };

  // Compress and resize image to WebP format
  const processImage = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };

      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }

        // Calculate new dimensions (maintain aspect ratio)
        let { width, height } = img;
        if (width > height) {
          if (width > MAX_DIMENSION) {
            height = (height * MAX_DIMENSION) / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width = (width * MAX_DIMENSION) / height;
            height = MAX_DIMENSION;
          }
        }

        // Make it square (crop to center)
        const size = Math.min(width, height);
        canvas.width = size;
        canvas.height = size;

        // Draw centered and cropped
        const offsetX = (width - size) / 2;
        const offsetY = (height - size) / 2;
        
        // Fill with white background for transparency
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        
        ctx.drawImage(
          img,
          offsetX * (img.width / width),
          offsetY * (img.height / height),
          img.width - (offsetX * 2 * (img.width / width)),
          img.height - (offsetY * 2 * (img.height / height)),
          0,
          0,
          size,
          size
        );

        // Convert to WebP with quality adjustment to stay under size limit
        let quality = 0.9;
        let dataUrl = canvas.toDataURL('image/webp', quality);
        
        // Reduce quality until under size limit
        while (dataUrl.length > MAX_FILE_SIZE * 1.37 && quality > 0.1) { // 1.37 accounts for base64 overhead
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/webp', quality);
        }

        if (dataUrl.length > MAX_FILE_SIZE * 1.37) {
          reject(new Error('Image too large even after compression'));
          return;
        }

        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, []);

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError(t('settings.avatar.invalidType', 'Please select a JPEG, PNG, WebP, or GIF image'));
      return;
    }

    // Validate initial file size (before processing)
    if (file.size > 5 * 1024 * 1024) { // 5MB max for initial file
      setError(t('settings.avatar.tooLarge', 'Image must be less than 5MB'));
      return;
    }

    try {
      setUploading(true);
      
      // Process and compress image
      const processedDataUrl = await processImage(file);
      setPreviewUrl(processedDataUrl);

      // Upload to server
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_URL}/user/avatar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ avatar_data: processedDataUrl }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to upload avatar');
      }

      setSuccess(true);
      onAvatarChange?.(processedDataUrl);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError(err instanceof Error ? err.message : t('settings.avatar.uploadError', 'Failed to upload avatar'));
      setPreviewUrl(null);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle avatar removal
  const handleRemoveAvatar = async () => {
    try {
      setUploading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_URL}/user/avatar`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to remove avatar');
      }

      setPreviewUrl(null);
      onAvatarChange?.(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Avatar removal error:', err);
      setError(t('settings.avatar.removeError', 'Failed to remove avatar'));
    } finally {
      setUploading(false);
    }
  };

  const displayAvatar = previewUrl || currentAvatar;

  // Compact mode - just avatar with hover overlay
  if (compact) {
    return (
      <div className="relative group">
        {displayAvatar ? (
          <img
            src={displayAvatar}
            alt="Avatar"
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-lg font-bold">
            {getInitials()}
          </div>
        )}

        {/* Upload Overlay */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Camera className="w-4 h-4 text-white" />
          )}
        </button>

        {/* Success Indicator */}
        {success && (
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center shadow">
            <Check className="w-3 h-3" />
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    );
  }

  // Full mode
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Display */}
      <div className="relative group">
        {displayAvatar ? (
          <img
            src={displayAvatar}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-lg"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-gray-800 shadow-lg">
            {getInitials()}
          </div>
        )}

        {/* Upload Overlay */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </button>

        {/* Remove Button */}
        {displayAvatar && !uploading && (
          <button
            onClick={handleRemoveAvatar}
            className="absolute -top-1 -right-1 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            title={t('settings.avatar.remove', 'Remove avatar')}
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Success Indicator */}
        {success && (
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
            <Check className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors disabled:opacity-50"
      >
        {uploading 
          ? t('settings.avatar.uploading', 'Uploading...') 
          : t('settings.avatar.change', 'Change avatar')}
      </button>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-500">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {t('settings.avatar.help', 'JPEG, PNG, WebP or GIF. Max 5MB. Will be resized to 256x256.')}
      </p>
    </div>
  );
};

export default AvatarUpload;
