import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UploadModal } from "@/components/upload-modal";
import { FilePreviewModal } from "@/components/file-preview-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Shield, Upload, Search, Download, Trash2, File, Image, Video, Music, FileText, Plus, Eye } from "lucide-react";
import { format } from "date-fns";

interface FileItem {
  id: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return <Image className="h-5 w-5" />;
  if (mimeType.startsWith('video/')) return <Video className="h-5 w-5" />;
  if (mimeType.startsWith('audio/')) return <Music className="h-5 w-5" />;
  if (mimeType.includes('pdf') || mimeType.includes('document')) return <FileText className="h-5 w-5" />;
  return <File className="h-5 w-5" />;
}

function getFileIconColor(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'text-blue-600 bg-blue-100';
  if (mimeType.startsWith('video/')) return 'text-purple-600 bg-purple-100';
  if (mimeType.startsWith('audio/')) return 'text-yellow-600 bg-yellow-100';
  if (mimeType.includes('pdf') || mimeType.includes('document')) return 'text-green-600 bg-green-100';
  return 'text-gray-600 bg-gray-100';
}

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState("all");

  const { data: filesData, isLoading } = useQuery<{ files: FileItem[] }>({
    queryKey: ["/api/files"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      await apiRequest("DELETE", `/api/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "File deleted",
        description: "File has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handlePreview = (file: FileItem) => {
    setSelectedFile(file);
    setIsPreviewModalOpen(true);
  };

  const handleDownload = (file: FileItem) => {
    const link = document.createElement('a');
    link.href = `/api/files/${file.id}/download`;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadFromPreview = () => {
    if (selectedFile) {
      handleDownload(selectedFile);
    }
  };

  const handleDelete = (fileId: string) => {
    if (confirm("Are you sure you want to delete this file?")) {
      deleteMutation.mutate(fileId);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const files = filesData?.files || [];
  
  // Filter files based on search and type
  const filteredFiles = files.filter(file => {
    const matchesSearch = file.originalName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = fileTypeFilter === "all" || 
      (fileTypeFilter === "images" && file.mimeType.startsWith("image/")) ||
      (fileTypeFilter === "videos" && file.mimeType.startsWith("video/")) ||
      (fileTypeFilter === "documents" && (file.mimeType.includes("pdf") || file.mimeType.includes("document")));
    
    return matchesSearch && matchesType;
  });

  // Calculate total storage used
  const totalStorageUsed = files.reduce((total, file) => total + file.fileSize, 0);
  const totalStorageLimit = 15 * 1024 * 1024 * 1024; // 15GB
  const storagePercentage = (totalStorageUsed / totalStorageLimit) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-brand-500 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <h1 className="ml-3 text-xl font-semibold text-gray-900">SecureVault</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span data-testid="text-username">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="relative">
                <button className="bg-gray-200 p-2 rounded-full text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <div className="h-6 w-6 bg-brand-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </span>
                  </div>
                </button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
                className="text-gray-600 hover:text-gray-900"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Dashboard Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">My Files</h2>
            <p className="text-gray-600">Manage your secure file storage</p>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={() => setIsUploadModalOpen(true)}
                  data-testid="button-upload"
                  className="bg-brand-600 hover:bg-brand-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Files
                </Button>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search"
                    className="pl-10 w-64"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Select value={fileTypeFilter} onValueChange={setFileTypeFilter}>
                  <SelectTrigger className="w-48" data-testid="select-filter">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Files</SelectItem>
                    <SelectItem value="images">Images</SelectItem>
                    <SelectItem value="videos">Videos</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Storage Usage */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Storage Usage</h3>
              <span className="text-sm text-gray-500" data-testid="text-storage">
                {formatFileSize(totalStorageUsed)} of {formatFileSize(totalStorageLimit)} used
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-brand-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(storagePercentage, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* File Grid */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Files</h3>
                <span className="text-sm text-gray-500">
                  {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* File List */}
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="px-6 py-12 text-center">
                  <div className="text-gray-500">Loading files...</div>
                </div>
              ) : filteredFiles.length === 0 ? (
                <div className="px-6 py-12 text-center" data-testid="empty-state">
                  <div className="mx-auto h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
                  <p className="text-gray-500 mb-6">Get started by uploading your first file</p>
                  <Button 
                    onClick={() => setIsUploadModalOpen(true)}
                    data-testid="button-upload-empty"
                    className="bg-brand-600 hover:bg-brand-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
              ) : (
                filteredFiles.map((file) => (
                  <div key={file.id} className="px-6 py-4 hover:bg-gray-50 cursor-pointer" data-testid={`file-item-${file.id}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${getFileIconColor(file.mimeType)}`}>
                            {getFileIcon(file.mimeType)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900" data-testid={`text-filename-${file.id}`}>
                            {file.originalName}
                          </div>
                          <div className="text-sm text-gray-500">
                            <span data-testid={`text-filesize-${file.id}`}>{formatFileSize(file.fileSize)}</span> • 
                            <span data-testid={`text-filedate-${file.id}`}> {format(new Date(file.uploadedAt), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(file)}
                          data-testid={`button-preview-${file.id}`}
                          title="Preview"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownload(file)}
                          data-testid={`button-download-${file.id}`}
                          title="Download"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(file.id)}
                          data-testid={`button-delete-${file.id}`}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <UploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />

      <FilePreviewModal 
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setSelectedFile(null);
        }}
        file={selectedFile}
        onDownload={handleDownloadFromPreview}
      />
    </div>
  );
}
