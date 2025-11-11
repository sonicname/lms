/* eslint-disable @typescript-eslint/no-explicit-any */
import api from '../../../core/api';
import type {
  AssetModel,
  ListAssetFilterModel,
  ListAssetModel,
} from '../models/asset.model';

const basePrefix = '/assets';

export const assetsApi = {
  list: (params?: ListAssetFilterModel) =>
    api.get<ListAssetModel>(basePrefix, { params }),
  getOne: (id: string) => api.get<AssetModel>(`${basePrefix}/${id}`),
  upload: (file: File, extra?: { fileType?: string; type?: string }) => {
    const form = new FormData();
    form.append('file', file);
    if (extra?.fileType) form.append('fileType', extra.fileType);
    if (extra?.type) form.append('type', extra.type);
    return api.post<any, FormData>(`${basePrefix}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: string) => api.delete<any>(`${basePrefix}/${id}`),
  // Tags
  listTags: (search?: string) =>
    api.get<{ id: string; name: string }[]>(`${basePrefix}/tags`, {
      params: search ? { search } : undefined,
    }),
  createTag: (name: string) =>
    api.post<{ id: string; name: string }>(`${basePrefix}/tags`, { name }),
  updateTag: (id: string, name: string) =>
    api.patch<{ id: string; name: string }>(`${basePrefix}/tags/${id}`, {
      name,
    }),
  deleteTag: (id: string) =>
    api.delete<{ success: boolean }>(`${basePrefix}/tags/${id}`),
  attachTags: (assetId: string, tagIds: string[]) =>
    api.post<AssetModel>(`${basePrefix}/${assetId}/tags`, { tagIds }),
  detachTag: (assetId: string, tagId: string) =>
    api.delete<AssetModel>(`${basePrefix}/${assetId}/tags/${tagId}`),
};
