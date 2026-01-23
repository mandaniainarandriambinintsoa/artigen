"use client";

import { Download, Share2, ZoomIn, Heart } from "lucide-react";
import { useState } from "react";

interface ImageDisplayProps {
  imageUrl: string | null;
  seed?: number | null;
}

export function ImageDisplay({ imageUrl, seed }: ImageDisplayProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `artigen-${seed || Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download image:", error);
    }
  };

  const handleShare = async () => {
    if (!imageUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Image - Artigen',
          text: 'Check out this AI generated image!',
          url: imageUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        navigator.clipboard.writeText(imageUrl);
      }
    } else {
      navigator.clipboard.writeText(imageUrl);
    }
  };

  if (!imageUrl) {
    return null;
  }

  return (
    <>
      <div className="relative w-full h-full group">
        <img
          src={imageUrl}
          alt="Generated image"
          className="w-full h-full object-cover transition-transform duration-300"
        />

        {/* Overlay with actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Bottom actions */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLiked(!liked)}
                className={`p-2 rounded-full backdrop-blur-sm transition-all ${
                  liked ? 'bg-red-500 text-white' : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={() => setIsZoomed(true)}
                className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
              >
                <ZoomIn className="h-5 w-5" />
              </button>
            </div>

            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
        >
          <img
            src={imageUrl}
            alt="Generated image - zoomed"
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
