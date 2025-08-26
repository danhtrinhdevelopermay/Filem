import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, Upload, FileText, Check, AlertCircle, Clock } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
  error?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]) => {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await apiRequest("POST", "/api/files/upload", formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      setUploadFiles(prev => prev.map(f => ({ ...f, status: 'completed' as const, progress: 100 })));
      toast({
        title: "Upload successful!",
        description: "Your files have been securely stored.",
      });
      setTimeout(() => {
        onClose();
        setUploadFiles([]);
      }, 2000);
    },
    onError: (error: Error) => {
      setUploadFiles(prev => prev.map(f => ({ ...f, status: 'error' as const, error: error.message })));
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (files: File[]) => {
    const newUploadFiles: UploadFile[] = files.map(file => ({
      file,
      id: crypto.randomUUID(),
      status: 'pending',
      progress: 0,
    }));

    // Validate file sizes
    const validFiles = newUploadFiles.filter(({ file }) => {
      const maxSize = 100 * 1024 * 1024; // 100MB
      if (file.size > maxSize) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 100MB limit`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setUploadFiles(validFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileSelect(files);
    }
  };

  const startUpload = () => {
    if (uploadFiles.length === 0) return;
    
    setUploadFiles(prev => prev.map(f => ({ ...f, status: 'uploading' as const })));
    
    // Simulate upload progress
    const files = uploadFiles.map(f => f.file);
    uploadMutation.mutate(files);
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'uploading':
        return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (file: UploadFile) => {
    switch (file.status) {
      case 'pending':
        return 'Pending';
      case 'uploading':
        return 'Uploading...';
      case 'completed':
        return 'Completed';
      case 'error':
        return file.error || 'Error';
      default:
        return '';
    }
  };

  const getStatusColor = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-50 border-gray-200';
      case 'uploading':
        return 'bg-blue-50 border-blue-200';
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const completedFiles = uploadFiles.filter(f => f.status === 'completed').length;
  const totalFiles = uploadFiles.length;
  const overallProgress = totalFiles > 0 ? (completedFiles / totalFiles) * 100 : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="modal-upload">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Upload Files</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              data-testid="button-close-modal"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-brand-400 bg-brand-50' 
                : 'border-gray-300 hover:border-brand-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            data-testid="upload-area"
          >
            <div className="mx-auto h-16 w-16 bg-brand-50 rounded-full flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-brand-500" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to browse</h4>
            <p className="text-gray-500 mb-4">Supports all file types up to 100MB each</p>
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className="hidden"
              data-testid="input-files"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              data-testid="button-browse"
            >
              <FileText className="h-4 w-4 mr-2" />
              Select Files
            </Button>
          </div>

          {/* File Size Limits */}
          <div className="text-sm text-gray-500 space-y-1">
            <p><span className="text-blue-600">ℹ</span> Maximum file size: 100MB per file</p>
            <p><span className="text-green-600">✓</span> Supported formats: All file types</p>
          </div>

          {/* Upload Progress */}
          {uploadFiles.length > 0 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">
                    {uploadMutation.isPending ? 'Uploading files...' : 'Ready to upload'}
                  </span>
                  <span className="text-sm text-gray-500" data-testid="text-progress">
                    {completedFiles} of {totalFiles} files
                  </span>
                </div>
                <Progress value={overallProgress} className="h-2" />
              </div>

              {/* File Upload Items */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {uploadFiles.map((uploadFile) => (
                  <div
                    key={uploadFile.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(uploadFile.status)}`}
                    data-testid={`upload-item-${uploadFile.id}`}
                  >
                    <div className="flex items-center">
                      {getStatusIcon(uploadFile.status)}
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900" data-testid={`text-filename-${uploadFile.id}`}>
                          {uploadFile.file.name}
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({formatFileSize(uploadFile.file.size)})
                        </span>
                      </div>
                    </div>
                    <span className={`text-sm ${
                      uploadFile.status === 'completed' ? 'text-green-600' :
                      uploadFile.status === 'error' ? 'text-red-600' :
                      uploadFile.status === 'uploading' ? 'text-blue-600' :
                      'text-gray-500'
                    }`} data-testid={`text-status-${uploadFile.id}`}>
                      {getStatusText(uploadFile)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              onClick={startUpload}
              disabled={uploadFiles.length === 0 || uploadMutation.isPending}
              data-testid="button-start-upload"
              className="bg-brand-600 hover:bg-brand-700"
            >
              <Upload className="h-4 w-4 mr-2" />
              {uploadMutation.isPending ? 'Uploading...' : 'Start Upload'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
