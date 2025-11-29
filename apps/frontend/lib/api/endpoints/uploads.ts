import { apiClient, ApiResponse } from '../client';

export interface UploadedFile {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
  modifiedAt: string;
}

export interface UploadsListResponse {
  files: UploadedFile[];
  total: number;
}

export const uploadsApi = {
  /**
   * Get list of all uploaded files
   */
  getFiles: async (): Promise<UploadsListResponse> => {
    const response = await apiClient.get<ApiResponse<UploadsListResponse>>('/upload');
    return response.data.data;
  },

  /**
   * Delete a file
   */
  deleteFile: async (filename: string): Promise<void> => {
    await apiClient.delete(`/upload/${encodeURIComponent(filename)}`);
  },

  /**
   * Upload a single file
   */
  uploadFile: async (file: File): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ApiResponse<UploadedFile>>('/upload/single', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },
};
