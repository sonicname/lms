import { api } from '~/core/api/client';

export type AssetModel = {
  id: string;
  url: string;
  filename: string | null;
  mimetype: string | null;
  fileSize: number | null;
  type: string | null; // image, video, pdf, etc.
  createdAt: string;
};

export async function listLessonAssets(
  classId: string,
  chapterId: string,
  lessonId: string,
): Promise<AssetModel[]> {
  return api.get(
    `/classes/${classId}/chapters/${chapterId}/lessons/${lessonId}/assets`,
  );
}
