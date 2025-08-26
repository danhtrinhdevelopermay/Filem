import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Download, ExternalLink } from "lucide-react";

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: {
    id: string;
    originalName: string;
    mimeType: string;
    fileSize: number;
  } | null;
  onDownload: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function FilePreviewModal({ isOpen, onClose, file, onDownload }: FilePreviewModalProps) {
  const [videoObjectUrl, setVideoObjectUrl] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  // Always call hooks at the top level
  const isImage = file?.mimeType.startsWith('image/') || false;
  const isVideo = file?.mimeType.startsWith('video/') || false;
  const isAudio = file?.mimeType.startsWith('audio/') || false;
  const isPdf = file?.mimeType === 'application/pdf' || false;
  const isText = file?.mimeType.startsWith('text/') || 
                 file?.mimeType === 'application/json' ||
                 file?.mimeType === 'application/javascript' || false;

  const previewUrl = file ? `/api/files/${file.id}/preview` : '';

  // Load video data as blob for better compatibility
  useEffect(() => {
    if (isVideo && isOpen && file && previewUrl) {
      setIsLoadingVideo(true);
      fetch(previewUrl, { credentials: 'include' })
        .then(response => response.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setVideoObjectUrl(url);
          setIsLoadingVideo(false);
        })
        .catch(error => {
          console.error('Error loading video:', error);
          setIsLoadingVideo(false);
        });
    }
  }, [isVideo, isOpen, file, previewUrl]);

  // Cleanup on close or when video URL changes
  useEffect(() => {
    return () => {
      if (videoObjectUrl) {
        URL.revokeObjectURL(videoObjectUrl);
      }
    };
  }, [videoObjectUrl]);

  // Cleanup when modal closes
  useEffect(() => {
    if (!isOpen && videoObjectUrl) {
      URL.revokeObjectURL(videoObjectUrl);
      setVideoObjectUrl(null);
    }
  }, [isOpen, videoObjectUrl]);

  // Early return after all hooks
  if (!file || !isOpen) {
    return null;
  }

  const renderPreview = () => {
    if (isImage) {
      return (
        <div className="flex justify-center">
          <img 
            src={previewUrl} 
            alt={file.originalName}
            className="max-w-full max-h-96 object-contain rounded-lg"
            data-testid="preview-image"
          />
        </div>
      );
    }

    if (isVideo) {
      if (isLoadingVideo) {
        return (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-500">Loading video...</div>
          </div>
        );
      }

      return (
        <div className="flex justify-center">
          <video 
            src={videoObjectUrl || previewUrl}
            controls
            className="max-w-full max-h-96 rounded-lg"
            data-testid="preview-video"
            preload="metadata"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      );
    }

    if (isAudio) {
      return (
        <div className="flex justify-center p-8">
          <audio 
            src={previewUrl} 
            controls
            className="w-full max-w-md"
            data-testid="preview-audio"
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="h-96">
          <iframe 
            src={previewUrl}
            className="w-full h-full border rounded-lg"
            data-testid="preview-pdf"
          />
        </div>
      );
    }

    if (isText) {
      return (
        <div className="h-96">
          <iframe 
            src={previewUrl}
            className="w-full h-full border rounded-lg bg-white"
            data-testid="preview-text"
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ExternalLink className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Preview not available</h3>
        <p className="text-gray-500 mb-4">
          This file type cannot be previewed. You can download it to view the content.
        </p>
        <Button onClick={onDownload} data-testid="button-download-preview">
          <Download className="h-4 w-4 mr-2" />
          Download File
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]" data-testid="modal-preview">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <span className="text-lg font-semibold">{file.originalName}</span>
              <span className="text-sm text-gray-500 ml-2">({formatFileSize(file.fileSize)})</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onDownload}
                data-testid="button-download-header"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                data-testid="button-close-preview"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 overflow-auto">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
}