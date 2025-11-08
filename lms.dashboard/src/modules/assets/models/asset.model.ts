export type AssetModel = {
  id: string;
  fileType: string; // image, video, file
  filename: string;
  mimetype: string;
  fileSize: number;
  url: string;
  type: string | null; // business type
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type ListAssetFilterModel = {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  fileType?: string;
  sortBy?: 'createdAt' | 'filename' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
};

export type ListAssetModel = Partial<{
  data: AssetModel[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}>;
